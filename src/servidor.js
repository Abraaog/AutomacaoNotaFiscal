import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { abrirBanco } from './infra/banco.js';
import { popularSeVazio } from './infra/seed.js';
import { criarServicos, criarApp } from './app.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORT) || 3000;
const SENHA_DEMO = process.env.SENHA_DEMO || 'emiteja';
const INTERVALO_REENVIO_MS = Number(process.env.REENVIO_MS) || 60000;
const VERIFICACAO_PENDENTES_MS = 5000;

const db = abrirBanco(process.env.BANCO || join(RAIZ, 'dados', 'emiteja.db'));

// O seed usa latência zero para não atrasar a subida; o servidor usa a latência normal.
await popularSeVazio(criarServicos({ db, latenciaMs: 0 }), SENHA_DEMO);

const servicos = criarServicos({ db, intervaloReenvioMs: INTERVALO_REENVIO_MS });
const app = criarApp(servicos);

// RN07: verifica documentos Pendentes com reenvio vencido.
setInterval(() => {
  servicos.emissao.reenviarPendentes().catch((erro) => console.error('[reenvio]', erro));
}, VERIFICACAO_PENDENTES_MS);

app.listen(PORTA, '127.0.0.1', () => {
  process.stdout.write('EmiteJá no ar em http://localhost:' + PORTA + '\n');
});
