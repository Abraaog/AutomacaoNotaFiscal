import { ErroNegocio } from './erros.js';

// Seção 4.1: alíquotas FICTÍCIAS, de finalidade exclusivamente didática.
// Cada política implementa a mesma interface { codigo, nome, regra, aliquota(moto) } (padrão Strategy).
const aliquotaUnica = Object.freeze({
  codigo: 'A_ALIQUOTA_UNICA',
  nome: 'Variante A · alíquota única',
  regra: '10% sobre o valor da venda, qualquer que seja a moto.',
  aliquota: () => 0.1,
});

const porCilindrada = Object.freeze({
  codigo: 'B_POR_CILINDRADA',
  nome: 'Variante B · por cilindrada',
  regra: 'Até 160 cc: 8%. De 161 a 500 cc: 12%. Acima de 500 cc: 18%.',
  aliquota: (moto) => {
    if (moto.cilindrada <= 160) return 0.08;
    if (moto.cilindrada <= 500) return 0.12;
    return 0.18;
  },
});

export const POLITICAS = Object.freeze({
  [aliquotaUnica.codigo]: aliquotaUnica,
  [porCilindrada.codigo]: porCilindrada,
});

export function obterPolitica(codigo) {
  const politica = POLITICAS[codigo];
  if (!politica) throw new ErroNegocio(`Política de imposto desconhecida: ${codigo}`);
  return politica;
}

// Valores sempre em centavos para evitar erro de arredondamento.
export function calcularImposto(politica, moto, valorCentavos) {
  const aliquota = politica.aliquota(moto);
  return Object.freeze({
    politica: politica.codigo,
    aliquota,
    impostoCentavos: Math.round(valorCentavos * aliquota),
  });
}
