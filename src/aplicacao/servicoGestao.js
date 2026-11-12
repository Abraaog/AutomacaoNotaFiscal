import { ErroNegocio } from '../dominio/erros.js';
import { POLITICAS, obterPolitica, calcularImposto } from '../dominio/politicas.js';
import { CENARIOS } from '../infra/autorizadorSimulado.js';
import { conferirSenha } from '../infra/senhas.js';

const MOTO_EXEMPLO = Object.freeze({ cilindrada: 300 });
const VALOR_EXEMPLO_CENTAVOS = 2500000;

// Período mensal "AAAA-MM" convertido em intervalo ISO [de, ate).
export function intervaloDoMes(mes) {
  if (!/^\d{4}-\d{2}$/.test(String(mes))) throw new ErroNegocio('Mês inválido. Use AAAA-MM.');
  const [ano, m] = mes.split('-').map(Number);
  const de = new Date(Date.UTC(ano, m - 1, 1)).toISOString();
  const ate = new Date(Date.UTC(ano, m, 1)).toISOString();
  return { de, ate };
}

export function criarServicoGestao({ repos, relogio = () => new Date() }) {
  // Sessão sem estado: o cookie guarda o login. Em hospedagem serverless cada requisição pode cair
  // numa instância diferente, e uma sessão guardada em memória "expirava" sozinha.
  // Protótipo de demonstração: a senha é opcional (entrada direta por usuário); se vier, é conferida.
  function entrar(login, senha) {
    const usuario = repos.usuarios.porLogin(String(login ?? '').trim().toLowerCase());
    if (!usuario) throw new ErroNegocio('Usuário não encontrado.', 401);
    if (senha !== undefined && !conferirSenha(senha, usuario.senha_hash)) throw new ErroNegocio('Usuário ou senha incorretos.', 401);
    return { token: usuario.login, usuario: repos.usuarios.porId(usuario.id) };
  }

  const sair = () => {};
  function usuarioDaSessao(token) {
    const usuario = token ? repos.usuarios.porLogin(token) : null;
    return usuario ? repos.usuarios.porId(usuario.id) : null;
  }

  function configuracao() {
    const atual = repos.configuracao.obter();
    const politicas = Object.values(POLITICAS).map((p) => ({
      codigo: p.codigo, nome: p.nome, regra: p.regra,
      exemplo: calcularImposto(p, MOTO_EXEMPLO, VALOR_EXEMPLO_CENTAVOS),
    }));
    return {
      politicaAtiva: atual.politica_ativa, cenario: atual.cenario, politicas,
      cenarios: Object.values(CENARIOS), historico: repos.configuracao.historico(),
    };
  }

  function alterarConfiguracao({ politica, cenario }, usuario) {
    obterPolitica(politica);
    if (!Object.values(CENARIOS).includes(cenario)) throw new ErroNegocio('Cenário do simulador inválido.');
    repos.configuracao.salvar({ politica, cenario, dataHora: relogio().toISOString(), usuarioId: usuario.id });
    return configuracao();
  }

  function painel(mes) {
    const { de, ate } = intervaloDoMes(mes);
    return {
      mes,
      vendas: repos.relatorios.vendasNoPeriodo(de, ate),
      porEstado: repos.relatorios.documentosPorEstado(de, ate),
      impostoPorPolitica: repos.relatorios.impostoPorPolitica(de, ate),
    };
  }

  // US13: um único arquivo com resumo e todos os documentos do mês.
  function exportacao(mes) {
    const { de, ate } = intervaloDoMes(mes);
    const documentos = repos.documentos.listar({ de, ate });
    const autorizados = documentos.filter((d) => d.estado === 'Autorizado');
    return {
      aviso: 'SEM VALOR FISCAL - SIMULAÇÃO',
      periodo: mes,
      geradoEm: relogio().toISOString(),
      resumo: {
        documentos: documentos.length,
        autorizados: autorizados.length,
        totalVendas: autorizados.reduce((s, d) => s + d.valor_centavos, 0) / 100,
        totalImposto: autorizados.reduce((s, d) => s + d.imposto_centavos, 0) / 100,
      },
      documentos: documentos.map((d) => ({
        venda: d.venda_codigo, estado: d.estado, protocolo: d.protocolo, cliente: d.cliente_nome,
        chassi: d.chassi, valor: d.valor_centavos / 100, politica: d.politica, imposto: d.imposto_centavos / 100,
        emitidoEm: d.criado_em,
      })),
    };
  }

  return Object.freeze({ entrar, sair, usuarioDaSessao, configuracao, alterarConfiguracao, painel, exportacao });
}
