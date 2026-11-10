import { createHash } from 'node:crypto';

// Implementa a interface Autorizador { autorizar(requisicao), cancelar(requisicao) } da seção 7.2.
// Não acessa nenhum serviço externo: a resposta depende do cenário configurado pela gerência.
export const CENARIOS = Object.freeze({ SUCESSO: 'SUCESSO', REJEICAO: 'REJEICAO', INDISPONIVEL: 'INDISPONIVEL' });
const AVISO = 'SEM VALOR FISCAL - SIMULAÇÃO';
const FORMATO_CHASSI = /^[A-HJ-NPR-Z0-9]{17}$/;

const espera = (ms) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());
const impressao = (obj) => createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);

export class AutorizadorSimulado {
  #obterCenario;
  #latenciaMs;
  #relogio;
  #respostas = new Map();
  #sequencia = 0;

  constructor({ obterCenario, latenciaMs = 800, relogio = () => new Date(), sequenciaInicial = 0 }) {
    this.#sequencia = sequenciaInicial;
    this.#obterCenario = obterCenario;
    this.#latenciaMs = latenciaMs;
    this.#relogio = relogio;
  }

  #protocolo() {
    this.#sequencia += 1;
    return `SIM-${String(this.#sequencia).padStart(6, '0')}`;
  }

  async autorizar(requisicao) {
    await espera(this.#latenciaMs);
    if (!requisicao?.chaveIdempotencia) {
      return { http: 400, corpo: { status: 'ERRO', motivo: 'chaveIdempotencia ausente' } };
    }
    // Mesma chave com o mesmo conteúdo devolve a mesma resposta, sem novo protocolo.
    // Conteúdo corrigido depois de uma rejeição é avaliado de novo.
    const chave = `${requisicao.chaveIdempotencia}:${impressao(requisicao)}`;
    if (this.#respostas.has(chave)) return this.#respostas.get(chave);

    const cenario = this.#obterCenario();
    if (cenario === CENARIOS.INDISPONIVEL) return { http: 503, corpo: null };

    let resposta;
    if (!FORMATO_CHASSI.test(requisicao.item?.chassi ?? '')) {
      resposta = { http: 422, corpo: { status: 'REJEITADO', codigo: 'R01', motivo: 'Chassi com formato inválido' } };
    } else if (cenario === CENARIOS.REJEICAO) {
      resposta = { http: 422, corpo: { status: 'REJEITADO', codigo: 'R03', motivo: 'Endereço do destinatário incompleto' } };
    } else {
      resposta = {
        http: 200,
        corpo: { status: 'AUTORIZADO', protocolo: this.#protocolo(), dataHora: this.#relogio().toISOString(), aviso: AVISO },
      };
    }
    this.#respostas.set(chave, resposta);
    return resposta;
  }

  async cancelar(requisicao) {
    await espera(this.#latenciaMs);
    if (this.#obterCenario() === CENARIOS.INDISPONIVEL) return { http: 503, corpo: null };
    return { http: 200, corpo: { status: 'CANCELADO', protocolo: this.#protocolo(), referencia: requisicao.protocolo, aviso: AVISO } };
  }
}
