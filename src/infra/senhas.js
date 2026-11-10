import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// RNF05: senhas guardadas somente como hash (scrypt com sal aleatório).
export function gerarHash(senha) {
  const sal = randomBytes(16).toString('hex');
  return `${sal}:${scryptSync(senha, sal, 32).toString('hex')}`;
}

export function conferirSenha(senha, hashGuardado) {
  const [sal, hash] = String(hashGuardado).split(':');
  if (!sal || !hash) return false;
  const calculado = scryptSync(String(senha), sal, 32);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
