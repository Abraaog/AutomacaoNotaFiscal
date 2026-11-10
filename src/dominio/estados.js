import { ErroNegocio } from './erros.js';

export const ESTADOS = Object.freeze({
  RASCUNHO: 'Rascunho',
  PROCESSANDO: 'Processando',
  AUTORIZADO: 'Autorizado',
  REJEITADO: 'Rejeitado',
  PENDENTE: 'Pendente',
  CANCELADO: 'Cancelado',
});

// Seção 7.1: transições permitidas. null representa o documento ainda inexistente.
const TRANSICOES = Object.freeze({
  null: [ESTADOS.RASCUNHO],
  [ESTADOS.RASCUNHO]: [ESTADOS.RASCUNHO, ESTADOS.PROCESSANDO],
  [ESTADOS.PROCESSANDO]: [ESTADOS.AUTORIZADO, ESTADOS.REJEITADO, ESTADOS.PENDENTE],
  [ESTADOS.PENDENTE]: [ESTADOS.PROCESSANDO],
  [ESTADOS.REJEITADO]: [ESTADOS.PROCESSANDO],
  [ESTADOS.AUTORIZADO]: [ESTADOS.CANCELADO],
  [ESTADOS.CANCELADO]: [],
});

export const podeTransitar = (de, para) => (TRANSICOES[de] ?? []).includes(para);

export function exigirTransicao(de, para) {
  if (!podeTransitar(de, para)) {
    throw new ErroNegocio(`Transição inválida: ${de ?? 'novo'} para ${para}`, 409);
  }
}

export const podeReenviar = (estado) =>
  [ESTADOS.RASCUNHO, ESTADOS.REJEITADO, ESTADOS.PENDENTE].includes(estado);
