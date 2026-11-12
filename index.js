// Entrada usada pela Vercel (função serverless). Para rodar na máquina, use npm start (src/servidor.js).
import express from 'express';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { abrirBanco } from './src/infra/banco.js';
import { popularSeVazio } from './src/infra/seed.js';
import { criarServicos, criarApp } from './src/app.js';

const INTERVALO_VERIFICACAO_MS = 5000;

// Na Vercel só /tmp aceita escrita, e o arquivo some quando a função reinicia:
// o banco volta aos dados de exemplo, o que basta para demonstração.
const db = abrirBanco(process.env.BANCO || join(tmpdir(), 'emiteja.db'));
await popularSeVazio(criarServicos({ db, latenciaMs: 0 }), process.env.SENHA_DEMO || 'emiteja');
const servicos = criarServicos({ db, intervaloReenvioMs: Number(process.env.REENVIO_MS) || 60000 });

// Sem processo contínuo não há setInterval confiável: os Pendentes vencidos (RN07)
// são verificados quando chega uma requisição, no máximo a cada 5 s.
let ultimaVerificacao = 0;
const app = express();
app.use((req, res, next) => {
  const agora = Date.now();
  if (agora - ultimaVerificacao >= INTERVALO_VERIFICACAO_MS) {
    ultimaVerificacao = agora;
    servicos.emissao.reenviarPendentes().catch((erro) => console.error('[reenvio]', erro));
  }
  next();
});
app.use(criarApp(servicos));

export default app;
