import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco } from '../src/infra/banco.js';
import { gerarHash } from '../src/infra/senhas.js';
import { criarServicos, criarApp } from '../src/app.js';

const CHASSI_300 = '9C2KC2210RR000123';
const CHASSI_650 = '9C2RH0610SR331907';

// Ambiente isolado: banco em memória, autorizador sem latência e relógio controlado.
function montar() {
  const db = abrirBanco();
  const relogio = { agora: new Date('2026-11-10T12:00:00.000Z') };
  const s = criarServicos({ db, latenciaMs: 0, relogio: () => relogio.agora, intervaloReenvioMs: 60000 });
  const usuario = (login, perfil) =>
    s.repos.usuarios.porId(s.repos.usuarios.inserir({ nome: login, login, perfil, senhaHash: gerarHash('teste') }));
  const vendedor = usuario('vendedor', 'Vendedor');
  const gerente = usuario('gerente', 'Gerente');
  usuario('contador', 'Contador');
  s.venda.cadastrarMoto({ chassi: CHASSI_300, marca: 'Honda', modelo: 'CB 300F', cilindrada: 300, ano: 2026, cor: 'Vermelha', preco: 25000 });
  s.venda.cadastrarMoto({ chassi: CHASSI_650, marca: 'Honda', modelo: 'CB 650R', cilindrada: 649, ano: 2026, cor: 'Cinza', preco: 59900 });
  const cliente = s.venda.cadastrarCliente({ documento: '529.982.247-25', nome: 'Ana Costa', endereco: 'Rua das Acácias, 120', email: 'ana@exemplo.com' });
  let chamadas = 0;
  const original = s.autorizador.autorizar.bind(s.autorizador);
  s.autorizador.autorizar = async (req) => { chamadas += 1; return original(req); };
  const configurar = (politica, cenario) => s.gestao.alterarConfiguracao({ politica, cenario }, gerente);
  const vender = (chassi = CHASSI_300) => s.venda.confirmar({ chassi, clienteId: cliente.id, formaPagamento: 'PIX' }, vendedor);
  return { s, relogio, vendedor, gerente, cliente, configurar, vender, chamadas: () => chamadas };
}

describe('Emissão simulada (UC02)', () => {
  test('venda válida gera documento Autorizado e a moto passa a Vendida', async () => {
    const { s, vender } = montar();
    const { documento, processamento } = vender();
    assert.equal(documento.estado, 'Processando');
    assert.equal(s.repos.motos.porChassi(CHASSI_300).situacao, 'Reservada');
    const final = await processamento;
    assert.equal(final.estado, 'Autorizado');
    assert.match(final.protocolo, /^SIM-\d{6}$/);
    assert.equal(final.aviso, 'SEM VALOR FISCAL - SIMULAÇÃO');
    assert.equal(s.repos.motos.porChassi(CHASSI_300).situacao, 'Vendida');
    const caminho = s.emissao.detalhar(final.id).transicoes.map((t) => `${t.de}>${t.para}`);
    assert.deepEqual(caminho, ['null>Rascunho', 'Rascunho>Processando', 'Processando>Autorizado']);
  });

  test('RN01/RN02: pedir de novo devolve o mesmo documento sem novo envio', async () => {
    const { s, vender, vendedor, chamadas } = montar();
    const primeiro = vender();
    const repetido = s.emissao.emitir(primeiro.venda.codigo, vendedor.id);
    await primeiro.processamento;
    const depois = s.emissao.emitir(primeiro.venda.codigo, vendedor.id);
    assert.equal(repetido.novo, false);
    assert.equal(repetido.documento.id, primeiro.documento.id);
    assert.equal(depois.documento.id, primeiro.documento.id);
    assert.equal(depois.documento.pedidos, 3);
    assert.equal(chamadas(), 1);
  });

  test('RN03: a mesma moto não pode entrar em duas vendas', async () => {
    const { vender } = montar();
    await vender().processamento;
    assert.throws(() => vender(), /não está mais disponível/);
  });

  test('RN06: o documento guarda a política usada e não é recalculado depois', async () => {
    const { s, vender, configurar } = montar();
    configurar('B_POR_CILINDRADA', 'SUCESSO');
    const doc = await vender(CHASSI_650).processamento;
    configurar('A_ALIQUOTA_UNICA', 'SUCESSO');
    const relido = s.repos.documentos.porId(doc.id);
    assert.equal(relido.politica, 'B_POR_CILINDRADA');
    assert.equal(relido.imposto_centavos, 1078200);
  });
});

describe('Cenários do autorizador simulado (US11)', () => {
  test('rejeição mostra o motivo e o reenvio usa o mesmo documento', async () => {
    const { s, vender, configurar, vendedor } = montar();
    configurar('A_ALIQUOTA_UNICA', 'REJEICAO');
    const rejeitado = await vender().processamento;
    assert.equal(rejeitado.estado, 'Rejeitado');
    assert.equal(rejeitado.codigo_rejeicao, 'R03');
    assert.equal(s.repos.motos.porChassi(CHASSI_300).situacao, 'Reservada');
    configurar('A_ALIQUOTA_UNICA', 'SUCESSO');
    s.venda.atualizarCliente(rejeitado.cliente_id, { nome: 'Ana Costa', endereco: 'Rua das Acácias, 120, Centro', email: 'ana@exemplo.com' });
    const final = await s.emissao.reenviar(rejeitado.id, vendedor.id).processamento;
    assert.equal(final.id, rejeitado.id);
    assert.equal(final.estado, 'Autorizado');
  });

  test('RN07: indisponível fica Pendente, reenvia 3 vezes e depois exige reenvio manual', async () => {
    const { s, relogio, vender, configurar, vendedor } = montar();
    configurar('A_ALIQUOTA_UNICA', 'INDISPONIVEL');
    let doc = await vender().processamento;
    assert.equal(doc.estado, 'Pendente');
    assert.equal(doc.reenvio_manual, 0);
    for (let i = 0; i < 3; i += 1) {
      relogio.agora = new Date(relogio.agora.getTime() + 61000);
      await s.emissao.reenviarPendentes();
    }
    doc = s.repos.documentos.porId(doc.id);
    assert.equal(doc.tentativas, 4);
    assert.equal(doc.reenvio_manual, 1);
    relogio.agora = new Date(relogio.agora.getTime() + 61000);
    assert.deepEqual(await s.emissao.reenviarPendentes(), []);
    configurar('A_ALIQUOTA_UNICA', 'SUCESSO');
    const final = await s.emissao.reenviar(doc.id, vendedor.id).processamento;
    assert.equal(final.estado, 'Autorizado');
  });
});

describe('Cancelamento (UC03)', () => {
  test('gerente cancela, a venda é desfeita e a moto volta ao estoque', async () => {
    const { s, vender, gerente } = montar();
    const doc = await vender().processamento;
    const cancelado = await s.emissao.cancelar(doc.id, 'Cliente desistiu no mesmo dia', gerente);
    assert.equal(cancelado.estado, 'Cancelado');
    assert.equal(cancelado.venda_situacao, 'Cancelada');
    assert.equal(s.repos.motos.porChassi(CHASSI_300).situacao, 'Disponível');
  });

  test('com o autorizador indisponível o documento continua Autorizado', async () => {
    const { s, vender, gerente, configurar } = montar();
    const doc = await vender().processamento;
    configurar('A_ALIQUOTA_UNICA', 'INDISPONIVEL');
    await assert.rejects(s.emissao.cancelar(doc.id, 'Cliente desistiu no mesmo dia', gerente), /continua Autorizado/);
    assert.equal(s.repos.documentos.porId(doc.id).estado, 'Autorizado');
  });
});

describe('API e perfis', () => {
  test('exige sessão e respeita o perfil Contador somente leitura (RN10)', async () => {
    const { s } = montar();
    const servidor = criarApp(s).listen(0);
    const base = `http://127.0.0.1:${servidor.address().port}/api`;
    try {
      assert.equal((await fetch(`${base}/motos`)).status, 401);
      const login = await fetch(`${base}/sessao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: 'contador', senha: 'teste' }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get('set-cookie').split(';')[0];
      assert.equal((await fetch(`${base}/motos`, { headers: { cookie } })).status, 200);
      const venda = await fetch(`${base}/vendas`, {
        method: 'POST', headers: { cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chassi: CHASSI_300, clienteId: 1, formaPagamento: 'PIX' }),
      });
      assert.equal(venda.status, 403);
      const errada = await fetch(`${base}/sessao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: 'contador', senha: 'x' }),
      });
      assert.equal(errada.status, 401);
    } finally {
      servidor.close();
    }
  });

  test('entra sem senha e a sessão vale em outra instância do servidor', async () => {
    const a = criarApp(montar().s).listen(0);
    const b = criarApp(montar().s).listen(0);
    const api = (srv) => `http://127.0.0.1:${srv.address().port}/api`;
    try {
      const entrada = await fetch(`${api(a)}/sessao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: 'contador' }),
      });
      assert.equal(entrada.status, 200);
      const cookie = entrada.headers.get('set-cookie').split(';')[0];
      const sessao = await fetch(`${api(b)}/sessao`, { headers: { cookie } });
      assert.equal(sessao.status, 200);
      assert.equal((await sessao.json()).perfil, 'Contador');
      const inexistente = await fetch(`${api(a)}/sessao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: 'ninguem' }),
      });
      assert.equal(inexistente.status, 401);
    } finally {
      a.close();
      b.close();
    }
  });
});
