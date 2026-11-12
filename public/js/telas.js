// Telas de balcão: entrada, venda, estoque e clientes.
import { api } from './api.js';
import { esc, reais, percentual, chassi, documento, estado, NOME_POLITICA } from './formato.js';

const USUARIOS_DEMO = [
  { login: 'sandra', nome: 'Sandra Lima', perfil: 'Gerente' },
  { login: 'marcos', nome: 'Marcos Andrade', perfil: 'Vendedor' },
  { login: 'paula', nome: 'Paula Rocha', perfil: 'Vendedor' },
  { login: 'diego', nome: 'Diego Souza', perfil: 'Vendedor' },
  { login: 'fabio', nome: 'Fábio Teles', perfil: 'Contador' },
];
export const LOGIN_PADRAO = 'sandra';
const ATRASO_BUSCA_MS = 250;
// Faixas da Variante B, reaproveitadas como filtro de cilindrada no balcão.
const FAIXAS_CILINDRADA = [
  { rotulo: 'Todas', min: 0, max: 99999 },
  { rotulo: 'Até 160 cc', min: 0, max: 160 },
  { rotulo: '161 a 500 cc', min: 161, max: 500 },
  { rotulo: 'Acima de 500 cc', min: 501, max: 99999 },
];

export function adiar(fn) {
  let t = 0;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ATRASO_BUSCA_MS);
  };
}

export function lerFormulario(form) {
  return Object.fromEntries(new FormData(form).entries());
}

// Trava o botão de envio durante a requisição para evitar duplo clique.
export async function enviando(botao, acao) {
  if (botao.disabled) return;
  botao.disabled = true;
  try {
    await acao();
  } finally {
    botao.disabled = false;
  }
}

function cabeca(titulo, subtitulo, extra) {
  return '<header class="cabeca"><div><h1>' + esc(titulo) + '</h1>' +
    (subtitulo ? '<p>' + esc(subtitulo) + '</p>' : '') + '</div>' + (extra || '') + '</header>';
}

/* Entrada */

// Protótipo de demonstração: entra direto como um dos usuários, sem senha.
export function telaEntrada(raiz, aoEntrar) {
  const opcoes = USUARIOS_DEMO.map(function (u) {
    return '<li><button type="button" class="usuario-demo" data-login="' + u.login + '">' +
      '<strong>' + u.nome + '</strong><span>' + u.perfil + '</span></button></li>';
  }).join('');
  raiz.innerHTML =
    '<main class="entrada"><div class="entrada-caixa">' +
      '<div class="marca"><strong>EmiteJá</strong><span>Rota Motos · emissão simulada</span></div>' +
      '<p class="entrada-instrucao">Entrar como</p>' +
      '<ul class="usuarios-demo">' + opcoes + '</ul>' +
      '<p class="erro-form" id="erro-entrada" role="alert"></p>' +
    '</div></main>';

  const erro = raiz.querySelector('#erro-entrada');
  raiz.querySelectorAll('[data-login]').forEach(function (b) {
    b.addEventListener('click', function () {
      enviando(b, async function () {
        try {
          aoEntrar(await entrarComo(b.dataset.login));
        } catch (e) {
          erro.textContent = e.message;
        }
      });
    });
  });
  raiz.querySelector('[data-login]').focus();
}

export function entrarComo(login) {
  return api('/sessao', { metodo: 'POST', corpo: { login: login } });
}

/* Cliente: formulário compartilhado entre balcão e cadastro */

function formularioCliente(cliente) {
  const c = cliente || {};
  const editando = Boolean(cliente);
  return '<form class="formulario-lateral" id="f-cliente" novalidate>' +
    '<h2>' + (editando ? 'Editar cliente' : 'Novo cliente') + '</h2>' +
    '<div class="linha-campos">' +
      '<div class="campo"><label for="c-doc">CPF ou CNPJ</label><input id="c-doc" name="documento" class="mono" inputmode="numeric" value="' +
        esc(editando ? documento(c.documento) : '') + '"' + (editando ? ' readonly' : ' required') + '></div>' +
      '<div class="campo"><label for="c-nome">Nome ou razão social</label><input id="c-nome" name="nome" required value="' + esc(c.nome) + '"></div>' +
    '</div>' +
    '<div class="campo"><label for="c-end">Endereço completo</label><input id="c-end" name="endereco" required value="' + esc(c.endereco) + '"></div>' +
    '<div class="campo"><label for="c-email">E-mail</label><input id="c-email" name="email" type="email" required value="' + esc(c.email) + '"></div>' +
    '<div class="acoes"><button class="btn btn-primario" type="submit">' + (editando ? 'Salvar alterações' : 'Cadastrar cliente') + '</button>' +
      '<button class="btn" type="button" data-fechar>Fechar</button></div>' +
    '<p class="erro-form" role="alert"></p>' +
  '</form>';
}

function ligarFormularioCliente(caixa, cliente, aoSalvar) {
  caixa.innerHTML = formularioCliente(cliente);
  const form = caixa.querySelector('form');
  const erro = form.querySelector('.erro-form');
  form.querySelector('[data-fechar]').addEventListener('click', function () { caixa.innerHTML = ''; });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    enviando(form.querySelector('[type=submit]'), async function () {
      try {
        const salvo = cliente
          ? await api('/clientes/' + cliente.id, { metodo: 'PUT', corpo: lerFormulario(form) })
          : await api('/clientes', { metodo: 'POST', corpo: lerFormulario(form) });
        caixa.innerHTML = '';
        aoSalvar(salvo);
      } catch (e) {
        erro.textContent = e.message;
      }
    });
  });
  form.querySelector('input:not([readonly])').focus();
}

function linhasClientes(lista, selecionadoId) {
  if (lista.length === 0) return '<tr><td colspan="3" class="vazio">Nenhum cliente encontrado.</td></tr>';
  return lista.map(function (c) {
    return '<tr class="clicavel' + (c.id === selecionadoId ? ' selecionada' : '') + '" data-id="' + c.id + '">' +
      '<td>' + esc(c.nome) + '<small>' + esc(c.email) + '</small></td>' +
      '<td class="mono">' + documento(c.documento) + '</td>' +
      '<td>' + esc(c.endereco) + '</td></tr>';
  }).join('');
}

/* Balcão de venda */

// Prévia no balcão; o valor oficial é calculado pelo servidor no momento da emissão.
function aliquotaPrevista(politica, cilindrada) {
  if (politica !== 'B_POR_CILINDRADA') return 0.1;
  if (cilindrada <= 160) return 0.08;
  if (cilindrada <= 500) return 0.12;
  return 0.18;
}

function htmlResumo(estadoVenda, config) {
  const m = estadoVenda.moto;
  const c = estadoVenda.cliente;
  const vazio = function (t) { return '<dd class="vazio">' + t + '</dd>'; };
  const aliquota = m ? aliquotaPrevista(config.politicaAtiva, m.cilindrada) : 0;
  const politica = config.politicas.find(function (p) { return p.codigo === config.politicaAtiva; });
  const pronto = Boolean(m && c && estadoVenda.forma);
  return '<h2>Resumo da venda</h2><dl>' +
    '<dt>Moto</dt>' + (m ? '<dd>' + esc(m.marca + ' ' + m.modelo) + '</dd>' : vazio('escolha no passo 1')) +
    '<dt>Chassi</dt>' + (m ? '<dd>' + chassi(m.chassi) + '</dd>' : vazio('·')) +
    '<dt>Cliente</dt>' + (c ? '<dd>' + esc(c.nome) + '</dd>' : vazio('escolha no passo 2')) +
    '<dt>Pagamento</dt>' + (estadoVenda.forma ? '<dd>' + esc(estadoVenda.forma) + '</dd>' : vazio('escolha no passo 3')) +
    '<dt>Política</dt><dd>' + esc(NOME_POLITICA[config.politicaAtiva] || config.politicaAtiva) + '</dd>' +
    '<dt>Imposto previsto</dt>' + (m ? '<dd class="mono">' + percentual(aliquota) + ' · ' + reais(Math.round(m.preco_centavos * aliquota)) + '</dd>' : vazio('·')) +
    '<dt>Total</dt><dd class="total">' + (m ? reais(m.preco_centavos) : '<span class="discreto">R$ 0,00</span>') + '</dd>' +
  '</dl>' +
  (politica ? '<p class="nota-politica">' + esc(politica.regra) + ' Alíquotas fictícias, só para fins didáticos.</p>' : '') +
  '<button class="btn btn-primario" id="confirmar"' + (pronto ? '' : ' disabled') + '>Confirmar venda e emitir</button>' +
  '<p class="erro-form" id="erro-venda" role="alert"></p>';
}

export async function telaVenda(palco, ctx) {
  const dados = await Promise.all([
    api('/motos?situacao=' + encodeURIComponent('Disponível')), api('/clientes'), api('/formas-pagamento'), api('/configuracao'),
  ]);
  const config = dados[3];
  const sel = { moto: null, cliente: null, forma: '' };
  let motos = dados[0];
  let clientes = dados[1];

  const faixas = FAIXAS_CILINDRADA.map(function (f, i) { return '<option value="' + i + '">' + f.rotulo + '</option>'; }).join('');
  const formas = dados[2].map(function (f) {
    return '<label><input type="radio" name="forma" value="' + esc(f) + '"><span>' + esc(f) + '</span></label>';
  }).join('');
  palco.innerHTML = cabeca('Nova venda', 'Escolha a moto, o cliente e a forma de pagamento. A emissão começa ao confirmar.') +
    '<div class="balcao"><div>' +
      '<section class="passo" aria-labelledby="p1"><h2 id="p1"><i>01</i>Moto disponível</h2>' +
        '<div class="filtros"><div class="campo largo"><label for="b-moto">Buscar por marca, modelo, cor ou chassi</label><input id="b-moto" type="search"></div>' +
        '<div class="campo"><label for="b-cil">Cilindrada</label><select id="b-cil">' + faixas + '</select></div></div>' +
        '<div class="lista-rolagem"><table class="tabela"><thead><tr><th>Moto</th><th>Chassi</th><th class="num">cc</th><th class="num">Preço</th></tr></thead>' +
        '<tbody id="l-motos"></tbody></table></div></section>' +
      '<section class="passo" aria-labelledby="p2"><h2 id="p2"><i>02</i>Cliente</h2>' +
        '<div class="filtros"><div class="campo largo"><label for="b-cli">Buscar por nome, CPF ou CNPJ</label><input id="b-cli" type="search"></div>' +
        '<button class="btn" type="button" id="novo-cli">Novo cliente</button></div>' +
        '<div id="caixa-cli"></div>' +
        '<div class="lista-rolagem"><table class="tabela"><thead><tr><th>Nome</th><th>Documento</th><th>Endereço</th></tr></thead>' +
        '<tbody id="l-clientes"></tbody></table></div></section>' +
      '<section class="passo" aria-labelledby="p3"><h2 id="p3"><i>03</i>Forma de pagamento</h2>' +
        '<div class="formas" role="radiogroup" aria-labelledby="p3">' + formas + '</div></section>' +
    '</div><aside class="resumo" id="resumo" aria-live="polite"></aside></div>';

  const el = function (id) { return palco.querySelector('#' + id); };

  function desenharMotos() {
    el('l-motos').innerHTML = motos.length === 0
      ? '<tr><td colspan="4" class="vazio">Nenhuma moto disponível com esse filtro.</td></tr>'
      : motos.map(function (m) {
        const marcada = sel.moto && sel.moto.chassi === m.chassi;
        return '<tr class="clicavel' + (marcada ? ' selecionada' : '') + '" data-chassi="' + esc(m.chassi) + '" tabindex="0">' +
          '<td>' + esc(m.marca + ' ' + m.modelo) + '<small>' + esc(m.cor) + ' · ' + esc(m.ano) + '</small></td>' +
          '<td>' + chassi(m.chassi) + '</td><td class="num">' + esc(m.cilindrada) + '</td>' +
          '<td class="num">' + reais(m.preco_centavos) + '</td></tr>';
      }).join('');
  }

  function desenharClientes() {
    el('l-clientes').innerHTML = linhasClientes(clientes, sel.cliente && sel.cliente.id);
    el('l-clientes').querySelectorAll('tr[data-id]').forEach(function (tr) { tr.tabIndex = 0; });
  }

  function desenharResumo() {
    el('resumo').innerHTML = htmlResumo(sel, config);
    if (vendendo) el('confirmar').disabled = true;
    el('confirmar').addEventListener('click', confirmar);
  }

  async function buscarMotos() {
    const f = FAIXAS_CILINDRADA[Number(el('b-cil').value)];
    const q = new URLSearchParams({ situacao: 'Disponível', busca: el('b-moto').value.trim(), cilMin: f.min, cilMax: f.max });
    try {
      motos = await api('/motos?' + q);
      desenharMotos();
    } catch (e) { ctx.falhar(e); }
  }

  async function buscarClientes() {
    try {
      clientes = await api('/clientes?busca=' + encodeURIComponent(el('b-cli').value.trim()));
      desenharClientes();
    } catch (e) { ctx.falhar(e); }
  }

  function escolherPorLinha(tbody, aoEscolher) {
    const escolher = function (ev) {
      const tr = ev.target.closest('tr[data-chassi], tr[data-id]');
      if (!tr) return;
      if (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      aoEscolher(tr);
    };
    tbody.addEventListener('click', escolher);
    tbody.addEventListener('keydown', escolher);
  }

  // A trava fica no estado da tela: o resumo é redesenhado a cada escolha e recriaria o botão.
  let vendendo = false;

  async function confirmar() {
    if (vendendo || !(sel.moto && sel.cliente && sel.forma)) return;
    vendendo = true;
    el('confirmar').disabled = true;
    try {
      const r = await api('/vendas', { metodo: 'POST', corpo: { chassi: sel.moto.chassi, clienteId: sel.cliente.id, formaPagamento: sel.forma } });
      ctx.avisar('Venda ' + r.venda.codigo + ' confirmada. Documento enviado ao autorizador.');
      ctx.ir('#/documentos/' + r.documento.id);
    } catch (e) {
      vendendo = false;
      if (e.status === 409) {
        sel.moto = null;
        buscarMotos();
      }
      desenharResumo();
      el('erro-venda').textContent = e.message;
    }
  }

  escolherPorLinha(el('l-motos'), function (tr) {
    sel.moto = motos.find(function (m) { return m.chassi === tr.dataset.chassi; }) || null;
    desenharMotos();
    desenharResumo();
  });
  escolherPorLinha(el('l-clientes'), function (tr) {
    sel.cliente = clientes.find(function (c) { return String(c.id) === tr.dataset.id; }) || null;
    desenharClientes();
    desenharResumo();
  });
  el('b-moto').addEventListener('input', adiar(buscarMotos));
  el('b-cil').addEventListener('change', buscarMotos);
  el('b-cli').addEventListener('input', adiar(buscarClientes));
  el('novo-cli').addEventListener('click', function () {
    ligarFormularioCliente(el('caixa-cli'), null, function (novo) {
      sel.cliente = novo;
      clientes = [novo].concat(clientes.filter(function (c) { return c.id !== novo.id; }));
      ctx.avisar('Cliente ' + novo.nome + ' cadastrado e selecionado.');
      desenharClientes();
      desenharResumo();
    });
  });
  palco.querySelectorAll('input[name=forma]').forEach(function (r) {
    r.addEventListener('change', function () { sel.forma = r.value; desenharResumo(); });
  });

  desenharMotos();
  desenharClientes();
  desenharResumo();
}

/* Estoque */

function formularioMoto() {
  const ano = new Date().getFullYear();
  return '<form class="formulario-lateral" id="f-moto" novalidate><h2>Cadastrar moto</h2>' +
    '<div class="campo"><label for="m-chassi">Chassi (17 caracteres, sem I, O e Q)</label>' +
      '<input id="m-chassi" name="chassi" class="mono" maxlength="17" required autocomplete="off"></div>' +
    '<div class="linha-campos">' +
      '<div class="campo"><label for="m-marca">Marca</label><input id="m-marca" name="marca" required></div>' +
      '<div class="campo"><label for="m-modelo">Modelo</label><input id="m-modelo" name="modelo" required></div>' +
      '<div class="campo"><label for="m-cor">Cor</label><input id="m-cor" name="cor" required></div>' +
    '</div><div class="linha-campos">' +
      '<div class="campo"><label for="m-cil">Cilindrada (cc)</label><input id="m-cil" name="cilindrada" type="number" min="50" max="2500" required></div>' +
      '<div class="campo"><label for="m-ano">Ano</label><input id="m-ano" name="ano" type="number" min="2000" max="' + (ano + 1) + '" value="' + ano + '" required></div>' +
      '<div class="campo"><label for="m-preco">Preço (R$)</label><input id="m-preco" name="preco" type="number" min="0.01" step="0.01" required></div>' +
    '</div>' +
    '<div class="acoes"><button class="btn btn-primario" type="submit">Cadastrar moto</button><button class="btn" type="button" data-fechar>Fechar</button></div>' +
    '<p class="erro-form" role="alert"></p></form>';
}

export async function telaEstoque(palco, ctx) {
  const gerente = ctx.pode('Gerente');
  palco.innerHTML = cabeca('Estoque', 'Motos da Rota Motos e sua situação.',
    gerente ? '<button class="btn btn-primario" type="button" id="nova-moto">Cadastrar moto</button>' : '') +
    '<div id="caixa-moto"></div>' +
    '<div class="filtros">' +
      '<div class="campo largo"><label for="e-busca">Buscar</label><input id="e-busca" type="search"></div>' +
      '<div class="campo"><label for="e-sit">Situação</label><select id="e-sit"><option value="">Todas</option>' +
        '<option>Disponível</option><option>Reservada</option><option>Vendida</option></select></div>' +
      '<div class="campo"><label for="e-preco">Preço até (R$)</label><input id="e-preco" type="number" min="0" step="1000"></div>' +
    '</div>' +
    '<table class="tabela"><thead><tr><th>Moto</th><th>Chassi</th><th class="num">cc</th><th class="num">Ano</th><th class="num">Preço</th><th>Situação</th></tr></thead>' +
    '<tbody id="l-estoque"></tbody></table>';

  const el = function (id) { return palco.querySelector('#' + id); };

  async function carregar() {
    const q = new URLSearchParams({ busca: el('e-busca').value.trim(), situacao: el('e-sit').value, precoMax: el('e-preco').value || 0 });
    try {
      const motos = await api('/motos?' + q);
      el('l-estoque').innerHTML = motos.length === 0
        ? '<tr><td colspan="6" class="vazio">Nenhuma moto encontrada.</td></tr>'
        : motos.map(function (m) {
          return '<tr><td>' + esc(m.marca + ' ' + m.modelo) + '<small>' + esc(m.cor) + '</small></td>' +
            '<td>' + chassi(m.chassi) + '</td><td class="num">' + esc(m.cilindrada) + '</td><td class="num">' + esc(m.ano) + '</td>' +
            '<td class="num">' + reais(m.preco_centavos) + '</td><td>' + estado(m.situacao) + '</td></tr>';
        }).join('');
    } catch (e) { ctx.falhar(e); }
  }

  el('e-busca').addEventListener('input', adiar(carregar));
  el('e-preco').addEventListener('input', adiar(carregar));
  el('e-sit').addEventListener('change', carregar);
  if (gerente) {
    el('nova-moto').addEventListener('click', function () {
      const caixa = el('caixa-moto');
      caixa.innerHTML = formularioMoto();
      const form = caixa.querySelector('form');
      form.querySelector('[data-fechar]').addEventListener('click', function () { caixa.innerHTML = ''; });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        enviando(form.querySelector('[type=submit]'), async function () {
          try {
            const moto = await api('/motos', { metodo: 'POST', corpo: lerFormulario(form) });
            caixa.innerHTML = '';
            ctx.avisar(moto.marca + ' ' + moto.modelo + ' entrou no estoque.');
            carregar();
          } catch (e) {
            form.querySelector('.erro-form').textContent = e.message;
          }
        });
      });
      form.chassi.focus();
    });
  }
  await carregar();
}

/* Clientes */

export async function telaClientes(palco, ctx) {
  palco.innerHTML = cabeca('Clientes', 'Clique em um cliente para corrigir endereço ou e-mail.',
    '<button class="btn btn-primario" type="button" id="novo">Novo cliente</button>') +
    '<div id="caixa"></div>' +
    '<div class="filtros"><div class="campo largo"><label for="c-busca">Buscar por nome, CPF ou CNPJ</label><input id="c-busca" type="search"></div></div>' +
    '<table class="tabela"><thead><tr><th>Nome</th><th>Documento</th><th>Endereço</th></tr></thead><tbody id="l-cli"></tbody></table>';

  const el = function (id) { return palco.querySelector('#' + id); };
  let lista = [];

  async function carregar() {
    try {
      lista = await api('/clientes?busca=' + encodeURIComponent(el('c-busca').value.trim()));
      el('l-cli').innerHTML = linhasClientes(lista, null);
    } catch (e) { ctx.falhar(e); }
  }

  function abrir(cliente) {
    ligarFormularioCliente(el('caixa'), cliente, function (salvo) {
      ctx.avisar(cliente ? 'Dados de ' + salvo.nome + ' atualizados.' : 'Cliente ' + salvo.nome + ' cadastrado.');
      carregar();
    });
    el('caixa').scrollIntoView({ block: 'nearest' });
  }

  el('novo').addEventListener('click', function () { abrir(null); });
  el('c-busca').addEventListener('input', adiar(carregar));
  el('l-cli').addEventListener('click', function (ev) {
    const tr = ev.target.closest('tr[data-id]');
    if (tr) abrir(lista.find(function (c) { return String(c.id) === tr.dataset.id; }));
  });
  await carregar();
}
