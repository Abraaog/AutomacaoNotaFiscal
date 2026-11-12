// Entrada do protótipo: sessão, quadro (menu + faixa do simulador), rotas por hash e avisos.
import { api, ErroApi } from './api.js';
import { esc, NOME_POLITICA, NOME_CENARIO } from './formato.js';
import { telaEntrada, telaVenda, telaEstoque, telaClientes, entrarComo, LOGIN_PADRAO } from './telas.js';
import { telaDocumentos, telaDocumento } from './documentos.js';
import { telaPainel, telaConfiguracao } from './gestao.js';

const VENDE = ['Vendedor', 'Gerente'];
const TODOS = ['Vendedor', 'Gerente', 'Contador'];
const ROTAS = [
  { caminho: 'venda', titulo: 'Nova venda', perfis: VENDE, tela: telaVenda },
  { caminho: 'documentos', titulo: 'Documentos', perfis: TODOS, tela: telaDocumentos, detalhe: telaDocumento },
  { caminho: 'clientes', titulo: 'Clientes', perfis: VENDE, tela: telaClientes },
  { caminho: 'estoque', titulo: 'Estoque', perfis: VENDE, tela: telaEstoque },
  { caminho: 'painel', titulo: 'Painel do mês', perfis: ['Gerente', 'Contador'], tela: telaPainel },
  { caminho: 'configuracao', titulo: 'Configurações', perfis: ['Gerente'], tela: telaConfiguracao },
];
const AVISO_MS = 4200;

const raiz = document.getElementById('raiz');
const caixaAviso = document.getElementById('aviso');
let usuario = null;
let reentrando = false;
let limparTela = null;
let geracao = 0;
let temporizadorAviso = 0;

function avisar(mensagem, tipo) {
  clearTimeout(temporizadorAviso);
  caixaAviso.textContent = mensagem;
  caixaAviso.className = 'aviso visivel' + (tipo === 'erro' ? ' erro' : '');
  temporizadorAviso = setTimeout(function () { caixaAviso.className = 'aviso'; }, AVISO_MS);
}

function falhar(erro) {
  if (erro instanceof ErroApi && erro.status === 401) return;
  avisar(erro instanceof ErroApi ? erro.message : 'Algo deu errado. Tente de novo.', 'erro');
}

const ctx = {
  get usuario() { return usuario; },
  pode: function () { return usuario !== null && Array.prototype.includes.call(arguments, usuario.perfil); },
  avisar: avisar,
  falhar: falhar,
  ir: function (hash) { location.hash = hash; },
  atualizarFaixa: atualizarFaixa,
};

function rotasDoPerfil() {
  return ROTAS.filter(function (r) { return r.perfis.includes(usuario.perfil); });
}

function montarQuadro() {
  const itens = rotasDoPerfil().map(function (r) {
    return '<li><a href="#/' + r.caminho + '" data-caminho="' + r.caminho + '">' + esc(r.titulo) + '</a></li>';
  }).join('');
  raiz.innerHTML =
    '<div class="quadro">' +
      '<nav class="trilho" aria-label="Navegação principal">' +
        '<div class="marca"><img src="/img/logo.svg" alt="" width="36" height="36"><div><strong>Emite<em>Já</em></strong><span>Rota Motos</span></div></div>' +
        '<ul class="menu">' + itens + '</ul>' +
        '<div class="quem"><b>' + esc(usuario.nome) + '</b><span class="discreto">' + esc(usuario.perfil) + '</span>' +
          '<div><button type="button" class="btn btn-leve" id="sair">Trocar usuário</button></div></div>' +
      '</nav>' +
      '<div class="principal">' +
        '<div class="faixa-sim" id="faixa" aria-label="Situação do simulador"></div>' +
        '<main class="conteudo" id="conteudo"></main>' +
      '</div>' +
    '</div>';
  document.getElementById('sair').addEventListener('click', sair);
  atualizarFaixa();
}

async function atualizarFaixa() {
  const faixa = document.getElementById('faixa');
  if (!faixa) return;
  try {
    const config = await api('/configuracao');
    faixa.innerHTML =
      '<span><b>SIMULAÇÃO</b> · sem valor fiscal</span>' +
      '<span>Política <b>' + esc(NOME_POLITICA[config.politicaAtiva] || config.politicaAtiva) + '</b></span>' +
      '<span><i class="sinal ' + esc(config.cenario) + '"></i>Autorizador <b>' + esc(NOME_CENARIO[config.cenario] || config.cenario) + '</b></span>' +
      (ctx.pode('Gerente') ? '<a href="#/configuracao">Alterar</a>' : '');
  } catch (erro) {
    falhar(erro);
  }
}

function marcarMenu(caminho) {
  raiz.querySelectorAll('.menu a').forEach(function (a) {
    if (a.dataset.caminho === caminho) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function encerrarTela() {
  geracao += 1;
  if (limparTela) limparTela();
  limparTela = null;
}

async function navegar() {
  encerrarTela();
  if (!usuario) return mostrarEntrada();
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  const permitidas = rotasDoPerfil();
  const rota = permitidas.find(function (r) { return r.caminho === partes[0]; });
  if (!rota) return location.replace('#/' + permitidas[0].caminho);
  // A faixa reflete a configuração atual, mesmo que outra pessoa tenha mudado.
  if (!document.getElementById('conteudo')) montarQuadro();
  else atualizarFaixa();
  marcarMenu(rota.caminho);

  // Cada tela desenha num palco novo: uma tela antiga que termine depois não suja a atual.
  const palco = document.createElement('div');
  palco.innerHTML = '<p class="discreto">Carregando…</p>';
  document.getElementById('conteudo').replaceChildren(palco);
  const vez = geracao;
  const tela = partes[1] && rota.detalhe ? rota.detalhe : rota.tela;
  try {
    const limpar = await tela(palco, ctx, decodeURIComponent(partes[1] || ''));
    if (typeof limpar !== 'function') return;
    if (vez === geracao) limparTela = limpar;
    else limpar();
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) return;
    palco.innerHTML = '<p class="erro-form">' + esc(erro instanceof ErroApi ? erro.message : 'Não foi possível abrir esta tela.') + '</p>';
  }
}

function mostrarEntrada() {
  telaEntrada(raiz, function (novo) {
    usuario = novo;
    raiz.innerHTML = '';
    if (location.hash.length > 2) navegar();
    else location.hash = '#/' + rotasDoPerfil()[0].caminho;
  });
}

async function sair() {
  try {
    await api('/sessao', { metodo: 'DELETE' });
  } catch (erro) {
    falhar(erro);
  }
  usuario = null;
  history.replaceState(null, '', location.pathname);
  navegar();
}

window.addEventListener('hashchange', navegar);
// Se o servidor perder a sessão, entra de novo como o mesmo usuário, sem interromper a demonstração.
window.addEventListener('sessao-expirada', async function () {
  if (!usuario || reentrando) return;
  reentrando = true;
  try {
    usuario = await entrarComo(usuario.login);
  } catch (erro) {
    usuario = null;
    avisar('Não foi possível continuar a sessão. Escolha o usuário de novo.', 'erro');
  } finally {
    reentrando = false;
  }
  navegar();
});

async function iniciar() {
  try {
    usuario = await api('/sessao');
  } catch (erro) {
    usuario = null;
  }
  // Sem sessão: abre direto como a gerente (acesso a todas as telas); "Trocar usuário" escolhe outro.
  if (!usuario) {
    try {
      usuario = await entrarComo(LOGIN_PADRAO);
    } catch (erro) {
      usuario = null;
    }
  }
  navegar();
}

iniciar();
