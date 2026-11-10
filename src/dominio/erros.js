// Erro de regra de negócio: a mensagem é mostrada ao usuário como está.
export class ErroNegocio extends Error {
  constructor(mensagem, status = 422) {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.status = status;
  }
}
