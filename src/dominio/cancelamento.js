import { ErroNegocio } from './erros.js';
import { ESTADOS } from './estados.js';

export const PRAZO_CANCELAMENTO_MS = 24 * 60 * 60 * 1000;
export const JUSTIFICATIVA_MINIMA = 15;

// RN08: só Gerente, até 24 horas após a autorização, justificativa com 15 caracteres ou mais.
export function validarCancelamento({ perfil, estado, autorizadoEm, agora, justificativa }) {
  if (perfil !== 'Gerente') throw new ErroNegocio('Somente a gerência pode cancelar documentos.', 403);
  if (estado !== ESTADOS.AUTORIZADO) throw new ErroNegocio('Só documentos autorizados podem ser cancelados.', 409);
  const decorrido = agora.getTime() - new Date(autorizadoEm).getTime();
  if (decorrido > PRAZO_CANCELAMENTO_MS) throw new ErroNegocio('Prazo de 24 horas para cancelamento expirado.');
  const texto = String(justificativa ?? '').trim();
  if (texto.length < JUSTIFICATIVA_MINIMA) {
    throw new ErroNegocio(`A justificativa precisa de pelo menos ${JUSTIFICATIVA_MINIMA} caracteres.`);
  }
  return texto;
}
