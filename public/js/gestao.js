// Gestão: painel do mês com exportação e configuração da política e do simulador.
import { api } from './api.js';
import { esc, reais, percentual, dataHora, estado, mesAtual, NOME_POLITICA, NOME_CENARIO } from './formato.js';
import { enviando } from './telas.js';

const ORDEM_ESTADOS = ['Autorizado', 'Processando', 'Pendente', 'Rejeitado', 'Rascunho', 'Cancelado'];
const DESCRICAO_CENARIO = {
  SUCESSO: 'Autoriza e devolve um protocolo SIM-000000.',
  REJEICAO: 'Recusa com HTTP 422, código R03: endereço do destinatário incompleto.',
  INDISPONIVEL: 'Não responde (HTTP 503). O documento fica Pendente e é reenviado até 3 vezes.',
};

/* Painel */

function htmlBarras(porEstado) {
  const total = porEstado.reduce(function (s, e) { return s + e.quantidade; }, 0);
  if (total === 0) return '<p class="discreto">Nenhum documento neste mês.</p>';
  const mapa = Object.fromEntries(porEstado.map(function (e) { return [e.estado, e.quantidade]; }));
  return '<ul class="barras">' + ORDEM_ESTADOS.map(function (nome) {
    const n = mapa[nome] || 0;
    return '<li>' + estado(nome) +
      '<span class="trilha e-' + nome.toLowerCase() + '"><i style="width:' + (n / total * 100).toFixed(1) + '%"></i></span>' +
      '<span class="num mono">' + n + '</span></li>';
  }).join('') + '</ul>';
}

function htmlImpostos(lista) {
  if (lista.length === 0) return '<p class="discreto">Nenhum documento autorizado neste mês.</p>';
  return '<table class="tabela"><thead><tr><th>Política</th><th class="num">Documentos</th><th class="num">Imposto</th></tr></thead><tbody>' +
    lista.map(function (p) {
      return '<tr><td>' + esc(NOME_POLITICA[p.politica] || p.politica) + '</td><td class="num">' + p.quantidade + '</td>' +
        '<td class="num">' + reais(p.total) + '</td></tr>';
    }).join('') + '</tbody></table>';
}

export async function telaPainel(palco, ctx) {
  palco.innerHTML = '<header class="cabeca"><div><h1>Painel do mês</h1><p>Valores simulados, sem valor fiscal.</p></div>' +
    '<div class="filtros" style="margin:0"><div class="campo"><label for="mes">Mês</label><input id="mes" type="month" value="' + mesAtual() + '"></div>' +
    '<a class="btn" id="exportar" download>Exportar mês (JSON)</a></div></header>' +
    '<div id="dados"></div>';
  const campoMes = palco.querySelector('#mes');
  const dados = palco.querySelector('#dados');
  const exportar = palco.querySelector('#exportar');

  async function carregar() {
    const mes = campoMes.value || mesAtual();
    exportar.href = '/api/exportacao?mes=' + encodeURIComponent(mes);
    try {
      const p = await api('/painel?mes=' + encodeURIComponent(mes));
      const imposto = p.impostoPorPolitica.reduce(function (s, i) { return s + i.total; }, 0);
      dados.innerHTML =
        '<section class="cifras" aria-label="Resumo do mês">' +
          '<div><span>Vendas confirmadas</span><b>' + p.vendas.quantidade + '</b></div>' +
          '<div><span>Faturamento</span><b>' + reais(p.vendas.total) + '</b></div>' +
          '<div><span>Imposto simulado autorizado</span><b>' + reais(imposto) + '</b></div>' +
        '</section>' +
        '<div class="duas-colunas">' +
          '<section><h2>Documentos por estado</h2>' + htmlBarras(p.porEstado) + '</section>' +
          '<section><h2>Imposto por política</h2>' + htmlImpostos(p.impostoPorPolitica) + '</section>' +
        '</div>';
    } catch (e) { ctx.falhar(e); }
  }

  campoMes.addEventListener('change', carregar);
  await carregar();
}

/* Configurações */

function opcao(nome, valor, marcado, titulo, detalhe, exemplo, travado) {
  return '<label class="opcao"><input type="radio" name="' + nome + '" value="' + esc(valor) + '"' +
    (marcado ? ' checked' : '') + (travado ? ' disabled' : '') + '>' +
    '<span>' + esc(titulo) + '<small>' + esc(detalhe) + '</small></span>' +
    '<span class="exemplo">' + (exemplo || '') + '</span></label>';
}

function htmlConfiguracao(c, gerente) {
  const politicas = c.politicas.map(function (p) {
    return opcao('politica', p.codigo, p.codigo === c.politicaAtiva, p.nome, p.regra,
      percentual(p.exemplo.aliquota) + '<br>' + reais(p.exemplo.impostoCentavos), !gerente);
  }).join('');
  const cenarios = c.cenarios.map(function (k) {
    return opcao('cenario', k, k === c.cenario, NOME_CENARIO[k] || k, DESCRICAO_CENARIO[k] || '', '', !gerente);
  }).join('');
  const historico = c.historico.length === 0
    ? '<tr><td colspan="4" class="vazio">Sem alterações registradas.</td></tr>'
    : c.historico.map(function (h) {
      return '<tr><td class="mono">' + dataHora(h.data_hora) + '</td><td>' + esc(NOME_POLITICA[h.politica] || h.politica) + '</td>' +
        '<td>' + esc(NOME_CENARIO[h.cenario] || h.cenario) + '</td><td>' + esc(h.usuario_nome || 'sistema') + '</td></tr>';
    }).join('');
  return '<form id="f-config" novalidate>' +
    '<section class="grupo-config"><h2>Política de imposto (vale para os próximos documentos)</h2>' +
      '<div class="opcoes">' + politicas + '</div>' +
      '<p class="discreto">Exemplo: moto de 300 cc vendida por R$ 25.000,00. Alíquotas fictícias.</p></section>' +
    '<section class="grupo-config"><h2>Resposta do autorizador simulado</h2><div class="opcoes">' + cenarios + '</div></section>' +
    (gerente ? '<div class="acoes"><button class="btn btn-primario" type="submit">Salvar configuração</button></div>' : '') +
    '<p class="erro-form" role="alert"></p></form>' +
    '<section class="grupo-config"><h2>Últimas alterações</h2><table class="tabela"><thead><tr><th>Quando</th><th>Política</th><th>Autorizador</th><th>Por</th></tr></thead>' +
    '<tbody>' + historico + '</tbody></table></section>';
}

export async function telaConfiguracao(palco, ctx) {
  const gerente = ctx.pode('Gerente');
  const cabeca = '<header class="cabeca"><div><h1>Configurações</h1><p>Política de imposto e comportamento do autorizador simulado.</p></div></header>';

  function desenhar(config) {
    palco.innerHTML = cabeca + htmlConfiguracao(config, gerente);
    const form = palco.querySelector('#f-config');
    if (!gerente) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const corpo = { politica: form.politica.value, cenario: form.cenario.value };
      enviando(form.querySelector('[type=submit]'), async function () {
        try {
          const nova = await api('/configuracao', { metodo: 'PUT', corpo: corpo });
          ctx.avisar('Configuração salva: ' + (NOME_POLITICA[nova.politicaAtiva] || '') + ', autorizador ' + (NOME_CENARIO[nova.cenario] || '') + '.');
          ctx.atualizarFaixa();
          desenhar(nova);
        } catch (e) {
          form.querySelector('.erro-form').textContent = e.message;
        }
      });
    });
  }

  desenhar(await api('/configuracao'));
}
