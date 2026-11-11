const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(valor) {
  return String(valor == null ? '' : valor).replace(/[&<>"']/g, function (c) { return ENTIDADES[c]; });
}

export function reais(centavos) {
  return MOEDA.format((centavos || 0) / 100);
}

export function percentual(aliquota) {
  return (aliquota * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
}

// Chassi em três blocos: fabricante (3), descrição (6), identificação (8).
export function chassi(valor) {
  const c = esc(valor);
  return '<span class="chassi"><span>' + c.slice(0, 3) + '</span><span>' + c.slice(3, 9) +
    '</span><span>' + c.slice(9) + '</span></span>';
}

export function documento(valor) {
  const d = String(valor || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return d;
}

export function dataHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function hora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function estado(nome) {
  return '<span class="estado e-' + esc(String(nome).toLowerCase()) + '">' + esc(nome) + '</span>';
}

export const NOME_POLITICA = { A_ALIQUOTA_UNICA: 'A · alíquota única', B_POR_CILINDRADA: 'B · por cilindrada' };
export const NOME_CENARIO = { SUCESSO: 'Sucesso', REJEICAO: 'Rejeição', INDISPONIVEL: 'Indisponível' };

export function mesAtual() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
