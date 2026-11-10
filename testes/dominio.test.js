import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { chassiValido, cpfValido, cnpjValido, documentoValido, formatarDocumento } from '../src/dominio/validacoes.js';
import { POLITICAS, obterPolitica, calcularImposto } from '../src/dominio/politicas.js';
import { ESTADOS, podeTransitar, exigirTransicao, podeReenviar } from '../src/dominio/estados.js';
import { validarCancelamento } from '../src/dominio/cancelamento.js';
import { ErroNegocio } from '../src/dominio/erros.js';

describe('RN04: chassi', () => {
  test('aceita 17 caracteres alfanuméricos sem I, O e Q', () => {
    assert.equal(chassiValido('9C2KC2210RR000123'), true);
    assert.equal(chassiValido('9c2kc2210rr000123'), true);
  });
  test('recusa tamanho errado e letras proibidas', () => {
    assert.equal(chassiValido('9C2KC2210RR00012'), false);
    assert.equal(chassiValido('9C2KC2210RR0001234'), false);
    assert.equal(chassiValido('9C2KC2210RO000123'), false);
    assert.equal(chassiValido('9C2KC2210RI000123'), false);
    assert.equal(chassiValido('9C2KC2210RQ000123'), false);
  });
});

describe('RN05: CPF e CNPJ', () => {
  test('confere dígitos verificadores do CPF', () => {
    assert.equal(cpfValido('529.982.247-25'), true);
    assert.equal(cpfValido('529.982.247-26'), false);
    assert.equal(cpfValido('111.111.111-11'), false);
  });
  test('confere dígitos verificadores do CNPJ', () => {
    assert.equal(cnpjValido('11.222.333/0001-81'), true);
    assert.equal(cnpjValido('11.222.333/0001-82'), false);
  });
  test('documentoValido decide pelo tamanho e formatarDocumento aplica a máscara', () => {
    assert.equal(documentoValido('52998224725'), true);
    assert.equal(documentoValido('11222333000181'), true);
    assert.equal(documentoValido('123'), false);
    assert.equal(formatarDocumento('52998224725'), '529.982.247-25');
    assert.equal(formatarDocumento('11222333000181'), '11.222.333/0001-81');
  });
});

describe('Seção 4.1: política didática de imposto', () => {
  const VALOR = 2500000; // R$ 25.000,00 em centavos

  test('variante A cobra 10% de qualquer moto', () => {
    const a = obterPolitica('A_ALIQUOTA_UNICA');
    assert.equal(calcularImposto(a, { cilindrada: 110 }, VALOR).impostoCentavos, 250000);
    assert.equal(calcularImposto(a, { cilindrada: 900 }, VALOR).impostoCentavos, 250000);
  });

  test('variante B usa as faixas de cilindrada, com limites inclusivos', () => {
    const b = obterPolitica('B_POR_CILINDRADA');
    const aliquota = (cilindrada) => calcularImposto(b, { cilindrada }, VALOR).aliquota;
    assert.equal(aliquota(160), 0.08);
    assert.equal(aliquota(161), 0.12);
    assert.equal(aliquota(500), 0.12);
    assert.equal(aliquota(501), 0.18);
  });

  test('exemplo do documento: moto de 300 cc por R$ 25.000,00', () => {
    const moto = { cilindrada: 300 };
    assert.equal(calcularImposto(POLITICAS.A_ALIQUOTA_UNICA, moto, VALOR).impostoCentavos, 250000);
    assert.equal(calcularImposto(POLITICAS.B_POR_CILINDRADA, moto, VALOR).impostoCentavos, 300000);
  });

  test('o resultado registra a política usada (RN06)', () => {
    const r = calcularImposto(POLITICAS.B_POR_CILINDRADA, { cilindrada: 650 }, 5990000);
    assert.deepEqual({ ...r }, { politica: 'B_POR_CILINDRADA', aliquota: 0.18, impostoCentavos: 1078200 });
  });

  test('política desconhecida é recusada', () => {
    assert.throws(() => obterPolitica('C_INEXISTENTE'), ErroNegocio);
  });
});

describe('Seção 7.1: máquina de estados', () => {
  test('permite o caminho feliz e os caminhos de falha', () => {
    assert.equal(podeTransitar(null, ESTADOS.RASCUNHO), true);
    assert.equal(podeTransitar(ESTADOS.RASCUNHO, ESTADOS.PROCESSANDO), true);
    assert.equal(podeTransitar(ESTADOS.PROCESSANDO, ESTADOS.AUTORIZADO), true);
    assert.equal(podeTransitar(ESTADOS.PROCESSANDO, ESTADOS.REJEITADO), true);
    assert.equal(podeTransitar(ESTADOS.PROCESSANDO, ESTADOS.PENDENTE), true);
    assert.equal(podeTransitar(ESTADOS.PENDENTE, ESTADOS.PROCESSANDO), true);
    assert.equal(podeTransitar(ESTADOS.AUTORIZADO, ESTADOS.CANCELADO), true);
  });

  test('bloqueia transições inválidas', () => {
    assert.equal(podeTransitar(ESTADOS.CANCELADO, ESTADOS.AUTORIZADO), false);
    assert.equal(podeTransitar(ESTADOS.AUTORIZADO, ESTADOS.PROCESSANDO), false);
    assert.equal(podeTransitar(ESTADOS.RASCUNHO, ESTADOS.AUTORIZADO), false);
    assert.throws(() => exigirTransicao(ESTADOS.CANCELADO, ESTADOS.AUTORIZADO), ErroNegocio);
  });

  test('só Rascunho, Rejeitado e Pendente podem ser reenviados', () => {
    const reenviaveis = Object.values(ESTADOS).filter(podeReenviar);
    assert.deepEqual(reenviaveis, [ESTADOS.RASCUNHO, ESTADOS.REJEITADO, ESTADOS.PENDENTE]);
  });
});

describe('RN08: cancelamento', () => {
  const autorizadoEm = '2026-11-10T10:00:00.000Z';
  const base = { perfil: 'Gerente', estado: 'Autorizado', autorizadoEm, justificativa: 'Cliente desistiu da compra' };

  test('aceita gerente dentro de 24 horas com justificativa suficiente', () => {
    const agora = new Date('2026-11-11T09:59:00.000Z');
    assert.equal(validarCancelamento({ ...base, agora }), 'Cliente desistiu da compra');
  });

  test('recusa vendedor, prazo vencido, justificativa curta e documento não autorizado', () => {
    const agora = new Date('2026-11-10T12:00:00.000Z');
    assert.throws(() => validarCancelamento({ ...base, agora, perfil: 'Vendedor' }), /gerência/);
    assert.throws(() => validarCancelamento({ ...base, agora: new Date('2026-11-11T10:00:01.000Z') }), /24 horas/);
    assert.throws(() => validarCancelamento({ ...base, agora, justificativa: 'desistiu' }), /15 caracteres/);
    assert.throws(() => validarCancelamento({ ...base, agora, estado: 'Rejeitado' }), /autorizados/);
  });
});
