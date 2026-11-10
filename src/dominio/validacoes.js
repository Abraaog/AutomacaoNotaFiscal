// RN04: 17 caracteres alfanuméricos, sem I, O e Q.
const FORMATO_CHASSI = /^[A-HJ-NPR-Z0-9]{17}$/;

export const normalizarChassi = (valor) => String(valor ?? '').trim().toUpperCase();
export const chassiValido = (valor) => FORMATO_CHASSI.test(normalizarChassi(valor));
export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

const todosIguais = (digitos) => /^(\d)\1+$/.test(digitos);

// RN05: dígitos verificadores do CPF.
export function cpfValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || todosIguais(d)) return false;
  const digito = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

// RN05: dígitos verificadores do CNPJ.
export function cnpjValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 14 || todosIguais(d)) return false;
  const digito = (n) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const resto = pesos.reduce((soma, peso, i) => soma + Number(d[i]) * peso, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12) === Number(d[12]) && digito(13) === Number(d[13]);
}

export function documentoValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length === 11) return cpfValido(d);
  if (d.length === 14) return cnpjValido(d);
  return false;
}

export function formatarDocumento(valor) {
  const d = somenteDigitos(valor);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return d;
}
