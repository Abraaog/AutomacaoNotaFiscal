// Documentos: lista por estado e o documento como cupom, com histórico e ações.
import { api } from './api.js';
import { esc, reais, percentual, chassi, documento, dataHora, hora, estado, NOME_POLITICA } from './formato.js';
import { enviando } from './telas.js';

const ESTADOS = ['Processando', 'Pendente', 'Rejeitado', 'Autorizado', 'Rascunho', 'Cancelado'];
const REENVIAVEIS = ['Rascunho', 'Rejeitado', 'Pendente'];
const JUSTIFICATIVA_MINIMA = 15;
const PRAZO_CANCELAMENTO_MS = 24 * 60 * 60 * 1000;
const ESPERA_PROCESSANDO_MS = 900;
const ESPERA_PENDENTE_MS = 5000;
const ESPERA_LISTA_MS = 4000;

const emAndamento = function (d) { return d.estado === 'Processando' || (d.estado === 'Pendente' && !d.reenvio_manual); };

/* Lista */

export async function telaDocumentos(palco, ctx) {
  let filtro = '';
  let docs = [];
  let temporizador = 0;
  let encerrada = false;

  palco.innerHTML = '<header class="cabeca"><div><h1>Documentos</h1><p>Uma venda, um documento. Clique para ver o cupom e o histórico.</p></div></header>' +
    '<div class="abas" role="group" aria-label="Filtrar por estado" id="abas"></div>' +
    '<table class="tabela"><thead><tr><th>Venda</th><th>Moto</th><th>Cliente</th><th class="num">Valor</th><th class="num">Imposto</th><th>Estado</th><th>Emitido</th></tr></thead>' +
    '<tbody id="l-docs"></tbody></table>';
  const abas = palco.querySelector('#abas');
  const corpo = palco.querySelector('#l-docs');

  function desenhar() {
    const contar = function (e) { return docs.filter(function (d) { return d.estado === e; }).length; };
    abas.innerHTML = [''].concat(ESTADOS).map(function (e) {
      return '<button type="button" data-estado="' + e + '" aria-pressed="' + (e === filtro) + '">' + (e || 'Todos') +
        '<small>' + (e ? contar(e) : docs.length) + '</small></button>';
    }).join('');
    const visiveis = filtro ? docs.filter(function (d) { return d.estado === filtro; }) : docs;
    corpo.innerHTML = visiveis.length === 0
      ? '<tr><td colspan="7" class="vazio">Nenhum documento' + (filtro ? ' ' + filtro.toLowerCase() : '') + '.</td></tr>'
      : visiveis.map(function (d) {
        return '<tr class="clicavel" data-id="' + d.id + '" tabindex="0">' +
          '<td class="mono">' + esc(d.venda_codigo) + '</td>' +
          '<td>' + esc(d.marca + ' ' + d.modelo) + '<small>' + chassi(d.chassi) + '</small></td>' +
          '<td>' + esc(d.cliente_nome) + '</td>' +
          '<td class="num">' + reais(d.valor_centavos) + '</td>' +
          '<td class="num">' + reais(d.imposto_centavos) + '<small>' + percentual(d.aliquota) + '</small></td>' +
          '<td>' + estado(d.estado) + '</td>' +
          '<td class="mono discreto">' + dataHora(d.criado_em) + '</td></tr>';
      }).join('');
  }

  async function carregar() {
    try {
      docs = await api('/documentos');
      if (encerrada) return;
      desenhar();
    } catch (e) { ctx.falhar(e); }
    // Enquanto houver documento em andamento, a lista se atualiza sozinha.
    if (!encerrada && docs.some(emAndamento)) temporizador = setTimeout(carregar, ESPERA_LISTA_MS);
  }

  abas.addEventListener('click', function (ev) {
    const b = ev.target.closest('button[data-estado]');
    if (!b) return;
    filtro = b.dataset.estado;
    desenhar();
  });
  const abrir = function (ev) {
    const tr = ev.target.closest('tr[data-id]');
    if (!tr || (ev.type === 'keydown' && ev.key !== 'Enter')) return;
    ctx.ir('#/documentos/' + tr.dataset.id);
  };
  corpo.addEventListener('click', abrir);
  corpo.addEventListener('keydown', abrir);

  await carregar();
  return function () {
    encerrada = true;
    clearTimeout(temporizador);
  };
}

/* Cupom */

function par(rotulo, valor, classe) {
  return '<div class="par' + (classe ? ' ' + classe : '') + '"><span>' + rotulo + '</span><span>' + valor + '</span></div>';
}

function htmlCupom(d) {
  const autorizacao = d.protocolo
    ? par('Protocolo', esc(d.protocolo)) + par('Autorizado', dataHora(d.autorizado_em))
    : par('Protocolo', 'aguardando');
  const cancelamento = d.protocolo_cancelamento ? par('Cancelamento', esc(d.protocolo_cancelamento)) : '';
  return '<article class="cupom" aria-label="Documento da venda ' + esc(d.venda_codigo) + '">' +
    '<div class="topo"><b>ROTA MOTOS</b>Documento de venda simulado<br>Venda ' + esc(d.venda_codigo) + '</div>' +
    '<hr>' +
    '<div>' + esc(d.cliente_nome) + '</div><div>' + documento(d.cliente_documento) + '</div><div class="discreto">' + esc(d.cliente_endereco) + '</div>' +
    '<hr>' +
    '<div>' + esc(d.marca + ' ' + d.modelo) + '</div>' +
    '<div class="discreto">' + esc(d.cilindrada) + ' cc · ' + esc(d.ano) + ' · ' + esc(d.cor) + '</div>' +
    '<div>' + chassi(d.chassi) + '</div>' +
    '<hr>' +
    par('Valor da venda', reais(d.valor_centavos)) +
    par('Pagamento', esc(d.forma_pagamento)) +
    par('Política', esc(NOME_POLITICA[d.politica] || d.politica)) +
    par('Imposto ' + percentual(d.aliquota), reais(d.imposto_centavos)) +
    '<hr>' + par('TOTAL', reais(d.valor_centavos), 'total') + '<hr>' +
    autorizacao + cancelamento +
    par('Vendedor', esc(d.vendedor_nome)) +
    '<span class="selo" aria-hidden="true">SEM VALOR FISCAL</span>' +
  '</article>';
}

function htmlSituacao(d) {
  if (d.estado === 'Rejeitado') {
    return '<p class="motivo">Rejeitado pelo autorizador: <code>' + esc(d.codigo_rejeicao) + '</code> ' + esc(d.motivo_rejeicao) +
      '. Corrija o cadastro e reenvie.</p>';
  }
  if (d.estado === 'Pendente') {
    return '<p class="motivo">Autorizador sem resposta. ' + (d.reenvio_manual
      ? 'As tentativas automáticas acabaram: reenvie manualmente.'
      : 'Nova tentativa automática às <b class="mono">' + hora(d.proxima_tentativa) + '</b>.') + '</p>';
  }
  if (d.estado === 'Processando') return '<p class="discreto">Aguardando a resposta do autorizador…</p>';
  if (d.estado === 'Cancelado') return '<p class="discreto">Justificativa: ' + esc(d.justificativa_cancelamento) + '</p>';
  return '';
}

function htmlHistorico(transicoes) {
  return '<h2>Histórico</h2><ol class="historico">' + transicoes.map(function (t) {
    return '<li><time datetime="' + esc(t.data_hora) + '">' + hora(t.data_hora) + '</time>' +
      '<span>' + (t.de ? esc(t.de) + ' → ' : '') + estado(t.para) + '</span>' +
      '<span class="quem-fez">' + esc(t.detalhe || '') + (t.usuario_nome ? ' · ' + esc(t.usuario_nome) : ' · sistema') + '</span></li>';
  }).join('') + '</ol>';
}

function podeCancelar(d, ctx) {
  return ctx.pode('Gerente') && d.estado === 'Autorizado' &&
    Date.now() - new Date(d.autorizado_em).getTime() <= PRAZO_CANCELAMENTO_MS;
}

function htmlAcoes(d, ctx) {
  const vende = ctx.pode('Vendedor', 'Gerente');
  const botoes = [];
  if (vende && REENVIAVEIS.includes(d.estado)) botoes.push('<button class="btn btn-primario" data-acao="reenviar">Reenviar ao autorizador</button>');
  if (vende) botoes.push('<button class="btn" data-acao="emitir" title="Pede a emissão da mesma venda de novo">Pedir emissão de novo</button>');
  if (podeCancelar(d, ctx)) botoes.push('<button class="btn btn-perigo" data-acao="cancelar">Cancelar documento</button>');
  return botoes.length ? '<div class="acoes">' + botoes.join('') + '</div>' : '';
}

/* Detalhe */

export async function telaDocumento(palco, ctx, id) {
  let doc = null;
  let temporizador = 0;
  let encerrada = false;

  function desenhar(anterior) {
    const mudou = anterior && anterior.estado !== doc.estado;
    palco.innerHTML =
      '<header class="cabeca"><div><h1>Venda ' + esc(doc.venda_codigo) + '</h1><p>Emitido em ' + dataHora(doc.criado_em) + '</p></div>' +
        '<a class="btn btn-leve" href="#/documentos">← Todos os documentos</a></header>' +
      '<div class="documento">' + htmlCupom(doc) + '<div>' +
        '<div class="carimbo e-' + esc(doc.estado.toLowerCase()) + (mudou ? ' novo' : '') + '" role="status">' + esc(doc.estado) + '</div>' +
        htmlSituacao(doc) + htmlAcoes(doc, ctx) +
        '<div id="caixa-cancelar"></div>' +
        '<p class="contador">Envios ao autorizador <b>' + doc.tentativas + '</b> · Pedidos de emissão <b>' + doc.pedidos + '</b>' +
          (doc.pedidos > 1 ? ' · repetidos sem gerar documento novo' : '') + '</p>' +
        htmlHistorico(doc.transicoes) +
        '<details class="contrato"><summary>Requisição enviada ao autorizador (contrato da seção 7.2)</summary><pre>' +
          esc(JSON.stringify(doc.requisicao, null, 2)) + '</pre></details>' +
      '</div></div>';
    ligarAcoes();
  }

  async function carregar() {
    clearTimeout(temporizador);
    const anterior = doc;
    doc = await api('/documentos/' + encodeURIComponent(id));
    if (encerrada) return;
    desenhar(anterior);
    if (anterior && anterior.estado !== doc.estado && anterior.estado === 'Processando') {
      ctx.avisar('Documento ' + doc.estado.toLowerCase() + '.', doc.estado === 'Autorizado' ? '' : 'erro');
    }
    if (emAndamento(doc)) {
      temporizador = setTimeout(recarregar, doc.estado === 'Processando' ? ESPERA_PROCESSANDO_MS : ESPERA_PENDENTE_MS);
    }
  }

  // Uma falha de rede não deve parar o acompanhamento: avisa e tenta de novo.
  function recarregar() {
    carregar().catch(function (e) {
      ctx.falhar(e);
      if (!encerrada && e.status !== 401) temporizador = setTimeout(recarregar, ESPERA_PENDENTE_MS);
    });
  }

  function abrirCancelamento() {
    const caixa = palco.querySelector('#caixa-cancelar');
    caixa.innerHTML = '<form class="cancelar-form" novalidate><h2>Cancelar documento</h2>' +
      '<div class="campo"><label for="justificativa">Justificativa (mínimo de ' + JUSTIFICATIVA_MINIMA + ' caracteres)</label>' +
      '<textarea id="justificativa" name="justificativa" rows="3" required></textarea></div>' +
      '<p class="contador" id="conta-just">0 de ' + JUSTIFICATIVA_MINIMA + '</p>' +
      '<div class="acoes"><button class="btn btn-perigo" type="submit" disabled>Confirmar cancelamento</button>' +
      '<button class="btn" type="button" data-fechar>Voltar</button></div>' +
      '<p class="erro-form" role="alert"></p></form>';
    const form = caixa.querySelector('form');
    const campo = form.justificativa;
    const confirmar = form.querySelector('[type=submit]');
    campo.addEventListener('input', function () {
      const n = campo.value.trim().length;
      form.querySelector('#conta-just').textContent = n + ' de ' + JUSTIFICATIVA_MINIMA;
      confirmar.disabled = n < JUSTIFICATIVA_MINIMA;
    });
    form.querySelector('[data-fechar]').addEventListener('click', function () { caixa.innerHTML = ''; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (campo.value.trim().length < JUSTIFICATIVA_MINIMA) return;
      enviando(confirmar, async function () {
        try {
          await api('/documentos/' + doc.id + '/cancelar', { metodo: 'POST', corpo: { justificativa: campo.value } });
          ctx.avisar('Documento cancelado. A moto voltou ao estoque.');
          await carregar();
        } catch (e) {
          form.querySelector('.erro-form').textContent = e.message;
        }
      });
    });
    campo.focus();
  }

  const ACOES = {
    reenviar: async function () {
      await api('/documentos/' + doc.id + '/reenviar', { metodo: 'POST' });
      ctx.avisar('Documento reenviado ao autorizador.');
      await carregar();
    },
    emitir: async function () {
      const r = await api('/vendas/' + encodeURIComponent(doc.venda_codigo) + '/emitir', { metodo: 'POST' });
      ctx.avisar(r.novo ? 'Documento criado.' : 'Esta venda já tem documento: nada foi reenviado nem duplicado.');
      await carregar();
    },
  };

  function ligarAcoes() {
    palco.querySelectorAll('[data-acao]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.acao === 'cancelar') return abrirCancelamento();
        enviando(b, function () { return ACOES[b.dataset.acao]().catch(ctx.falhar); });
      });
    });
  }

  await carregar();
  return function () {
    encerrada = true;
    clearTimeout(temporizador);
  };
}
