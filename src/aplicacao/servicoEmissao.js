import { ESTADOS, exigirTransicao, podeReenviar } from '../dominio/estados.js';
import { obterPolitica, calcularImposto } from '../dominio/politicas.js';
import { chassiValido, documentoValido, formatarDocumento } from '../dominio/validacoes.js';
import { validarCancelamento } from '../dominio/cancelamento.js';
import { ErroNegocio } from '../dominio/erros.js';
import { transacao } from '../infra/banco.js';

export const MAX_REENVIOS_AUTOMATICOS = 3;

export function criarServicoEmissao({ db, repos, autorizador, relogio = () => new Date(), intervaloReenvioMs = 60000 }) {
  const agora = () => relogio().toISOString();

  function buscar(id) {
    const doc = repos.documentos.porId(Number(id));
    if (!doc) throw new ErroNegocio('Documento não encontrado.', 404);
    return doc;
  }

  // Toda mudança de estado passa por aqui: valida a transição e registra o histórico (RNF03).
  function mudarEstado(doc, para, usuarioId, campos, detalhe) {
    exigirTransicao(doc.estado, para);
    repos.documentos.atualizar(doc.id, { ...campos, estado: para });
    repos.transicoes.registrar({ documentoId: doc.id, de: doc.estado, para, dataHora: agora(), usuarioId, detalhe });
    return repos.documentos.porId(doc.id);
  }

  function montarRequisicao(doc) {
    return {
      chaveIdempotencia: `VENDA-${doc.venda_codigo}`,
      venda: { codigo: doc.venda_codigo, data: doc.venda_data_hora.slice(0, 10), formaPagamento: doc.forma_pagamento },
      destinatario: {
        documento: formatarDocumento(doc.cliente_documento), nome: doc.cliente_nome, endereco: doc.cliente_endereco,
      },
      item: {
        chassi: doc.chassi,
        descricao: `${doc.marca} ${doc.modelo}, ${doc.cilindrada} cc, ${doc.ano}, ${doc.cor}`,
        cilindrada: doc.cilindrada,
      },
      valores: {
        venda: doc.valor_centavos / 100, politicaImposto: doc.politica,
        aliquota: doc.aliquota, imposto: doc.imposto_centavos / 100,
      },
    };
  }

  function errosDeValidacao(doc) {
    const erros = [];
    if (!chassiValido(doc.chassi)) erros.push('chassi inválido');
    if (!documentoValido(doc.cliente_documento)) erros.push('CPF ou CNPJ do cliente inválido');
    if (!(doc.valor_centavos > 0)) erros.push('valor da venda precisa ser positivo');
    return erros;
  }

  function aplicarResposta(doc, { http, corpo }) {
    if (http === 200) {
      return transacao(db, () => {
        repos.motos.trocarSituacao(doc.chassi, 'Reservada', 'Vendida');
        return mudarEstado(doc, ESTADOS.AUTORIZADO, null, {
          protocolo: corpo.protocolo, aviso: corpo.aviso, autorizado_em: agora(),
          codigo_rejeicao: null, motivo_rejeicao: null, reenvio_manual: 0,
        }, `Protocolo ${corpo.protocolo}`);
      });
    }
    if (http === 422) {
      return mudarEstado(doc, ESTADOS.REJEITADO, null,
        { codigo_rejeicao: corpo.codigo, motivo_rejeicao: corpo.motivo }, `${corpo.codigo}: ${corpo.motivo}`);
    }
    // 503 ou falha de comunicação (RN07): até 3 reenvios automáticos, depois o reenvio é manual.
    const esgotou = doc.tentativas - 1 >= MAX_REENVIOS_AUTOMATICOS;
    const proxima = new Date(relogio().getTime() + intervaloReenvioMs).toISOString();
    return mudarEstado(doc, ESTADOS.PENDENTE, null, {
      proxima_tentativa: esgotou ? null : proxima, reenvio_manual: esgotou ? 1 : 0,
    }, esgotou ? 'Autorizador sem resposta; tentativas automáticas esgotadas'
      : 'Autorizador sem resposta; nova tentativa automática agendada');
  }

  // A parte síncrona (até o primeiro await) já deixa o documento em Processando.
  async function enviar(id, usuarioId) {
    const doc = buscar(id);
    const erros = errosDeValidacao(doc);
    if (erros.length > 0) {
      if (doc.estado === ESTADOS.RASCUNHO) {
        return mudarEstado(doc, ESTADOS.RASCUNHO, usuarioId, {}, `Dados inválidos: ${erros.join(', ')}`);
      }
      throw new ErroNegocio(`Corrija antes de reenviar: ${erros.join(', ')}.`);
    }
    const enviado = mudarEstado(doc, ESTADOS.PROCESSANDO, usuarioId,
      { tentativas: doc.tentativas + 1, proxima_tentativa: null }, `Envio ${doc.tentativas + 1} ao autorizador`);
    let resposta;
    try {
      resposta = await autorizador.autorizar(montarRequisicao(enviado));
    } catch {
      resposta = { http: 503, corpo: null };
    }
    return aplicarResposta(enviado, resposta);
  }

  // RN01 e RN02: a venda é a chave; um novo pedido devolve o documento existente sem reenviar.
  function emitir(vendaCodigo, usuarioId) {
    const existente = repos.documentos.porVenda(vendaCodigo);
    if (existente) {
      repos.documentos.atualizar(existente.id, { pedidos: existente.pedidos + 1 });
      return { documento: repos.documentos.porId(existente.id), novo: false, processamento: Promise.resolve(null) };
    }
    const venda = repos.vendas.porCodigo(vendaCodigo);
    if (!venda) throw new ErroNegocio('Venda não encontrada.', 404);
    const moto = repos.motos.porChassi(venda.chassi);
    const { politica_ativa: politicaAtiva } = repos.configuracao.obter();
    const calculo = calcularImposto(obterPolitica(politicaAtiva), moto, venda.valor_centavos);
    const id = transacao(db, () => {
      const novoId = repos.documentos.inserir({
        vendaCodigo, estado: ESTADOS.RASCUNHO, politica: calculo.politica,
        aliquota: calculo.aliquota, impostoCentavos: calculo.impostoCentavos, criadoEm: agora(),
      });
      repos.transicoes.registrar({
        documentoId: novoId, de: null, para: ESTADOS.RASCUNHO, dataHora: agora(), usuarioId,
        detalhe: `Venda ${vendaCodigo} confirmada`,
      });
      return novoId;
    });
    const processamento = enviar(id, usuarioId);
    return { documento: repos.documentos.porId(id), novo: true, processamento };
  }

  function reenviar(id, usuarioId) {
    const doc = buscar(id);
    if (!podeReenviar(doc.estado)) throw new ErroNegocio(`Documento ${doc.estado} não pode ser reenviado.`, 409);
    const processamento = enviar(doc.id, usuarioId);
    return { documento: repos.documentos.porId(doc.id), processamento };
  }

  function reenviarPendentes() {
    return Promise.all(repos.documentos.pendentesVencidos(agora()).map((id) => enviar(id, null)));
  }

  async function cancelar(id, justificativa, usuario) {
    const doc = buscar(id);
    const texto = validarCancelamento({
      perfil: usuario.perfil, estado: doc.estado, autorizadoEm: doc.autorizado_em, agora: relogio(), justificativa,
    });
    const resposta = await autorizador.cancelar({
      chaveIdempotencia: `CANC-${doc.venda_codigo}`, protocolo: doc.protocolo, justificativa: texto,
    });
    if (resposta.http !== 200) {
      throw new ErroNegocio('Autorizador indisponível. O documento continua Autorizado; tente de novo.', 503);
    }
    // RN09: o cancelamento desfaz a venda e devolve a moto ao estoque.
    return transacao(db, () => {
      const atual = buscar(id);
      const cancelado = mudarEstado(atual, ESTADOS.CANCELADO, usuario.id, {
        protocolo_cancelamento: resposta.corpo.protocolo, justificativa_cancelamento: texto,
      }, `Justificativa: ${texto}`);
      repos.vendas.cancelar(atual.venda_codigo);
      repos.motos.trocarSituacao(atual.chassi, 'Vendida', 'Disponível');
      return repos.documentos.porId(cancelado.id);
    });
  }

  function detalhar(id) {
    const doc = buscar(id);
    return { ...doc, transicoes: repos.transicoes.doDocumento(doc.id), requisicao: montarRequisicao(doc) };
  }

  return Object.freeze({ emitir, reenviar, reenviarPendentes, cancelar, detalhar });
}
