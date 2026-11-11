// Cliente HTTP da API. Erros chegam com a mensagem pronta para mostrar ao usuário.
export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

export async function api(caminho, opcoes) {
  const metodo = (opcoes && opcoes.metodo) || 'GET';
  const corpo = opcoes && opcoes.corpo;
  const resposta = await fetch('/api' + caminho, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : {},
    body: corpo ? JSON.stringify(corpo) : undefined,
    credentials: 'same-origin',
  });
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(function () { return {}; });
  if (!resposta.ok) {
    if (resposta.status === 401 && caminho !== '/sessao') window.dispatchEvent(new Event('sessao-expirada'));
    throw new ErroApi(dados.erro || 'Sem resposta do servidor. Tente de novo.', resposta.status);
  }
  return dados;
}
