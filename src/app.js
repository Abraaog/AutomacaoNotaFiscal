import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ErroNegocio } from './dominio/erros.js';
import { criarRepositorios } from './infra/repositorios.js';
import { AutorizadorSimulado } from './infra/autorizadorSimulado.js';
import { criarServicoEmissao } from './aplicacao/servicoEmissao.js';
import { criarServicoVenda, FORMAS_PAGAMENTO } from './aplicacao/servicoVenda.js';
import { criarServicoGestao } from './aplicacao/servicoGestao.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const COOKIE = 'emiteja_sessao';

const lerCookie = (req) => {
  const par = (req.headers.cookie ?? '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return par ? par.slice(COOKIE.length + 1) : '';
};

// Monta serviços e rotas. Recebe o banco pronto para os testes usarem um banco em memória.
export function criarServicos({ db, relogio = () => new Date(), latenciaMs = 800, intervaloReenvioMs = 60000 }) {
  const repos = criarRepositorios(db);
  // Protocolos continuam a numeração já gravada, para não repetir depois de reiniciar o servidor.
  const sequenciaInicial = db.prepare(`SELECT COUNT(protocolo) + COUNT(protocolo_cancelamento) AS n FROM documentos`).get().n;
  const autorizador = new AutorizadorSimulado({
    obterCenario: () => repos.configuracao.obter().cenario, latenciaMs, relogio, sequenciaInicial,
  });
  const emissao = criarServicoEmissao({ db, repos, autorizador, relogio, intervaloReenvioMs });
  const venda = criarServicoVenda({ db, repos, emissao, relogio });
  const gestao = criarServicoGestao({ repos, relogio });
  return { repos, autorizador, emissao, venda, gestao };
}

function rotasApi(s) {
  const api = express.Router();
  const semEspera = (p) => p.catch((erro) => console.error('[emissao]', erro));

  api.use((req, _res, next) => {
    req.usuario = s.gestao.usuarioDaSessao(lerCookie(req));
    next();
  });
  const exigir = (...perfis) => (req, _res, next) => {
    if (!req.usuario) return next(new ErroNegocio('Sessão expirada. Entre de novo.', 401));
    if (perfis.length && !perfis.includes(req.usuario.perfil)) return next(new ErroNegocio('Seu perfil não permite esta ação.', 403));
    return next();
  };
  const VENDE = ['Vendedor', 'Gerente'];

  api.post('/sessao', (req, res) => {
    const { token, usuario } = s.gestao.entrar(req.body.login, req.body.senha);
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'strict', path: '/' }).json(usuario);
  });
  api.get('/sessao', exigir(), (req, res) => res.json(req.usuario));
  api.delete('/sessao', (req, res) => {
    s.gestao.sair(lerCookie(req));
    res.clearCookie(COOKIE, { path: '/' }).status(204).end();
  });

  api.get('/motos', exigir(), (req, res) => {
    const { busca = '', situacao = '', cilMin, cilMax, precoMax } = req.query;
    res.json(s.repos.motos.listar({
      busca: String(busca), situacao: String(situacao),
      cilMin: Number(cilMin) || 0, cilMax: Number(cilMax) || 99999, precoMax: Math.round(Number(precoMax) * 100) || 0,
    }));
  });
  api.post('/motos', exigir('Gerente'), (req, res) => res.status(201).json(s.venda.cadastrarMoto(req.body)));

  api.get('/clientes', exigir(), (req, res) => res.json(s.repos.clientes.listar(String(req.query.busca ?? ''))));
  api.post('/clientes', exigir(...VENDE), (req, res) => res.status(201).json(s.venda.cadastrarCliente(req.body)));
  api.put('/clientes/:id', exigir(...VENDE), (req, res) => res.json(s.venda.atualizarCliente(req.params.id, req.body)));

  api.get('/formas-pagamento', exigir(), (_req, res) => res.json(FORMAS_PAGAMENTO));
  api.post('/vendas', exigir(...VENDE), (req, res) => {
    const { venda, documento, novo, processamento } = s.venda.confirmar(req.body, req.usuario);
    semEspera(processamento);
    res.status(201).json({ venda, documento, novo });
  });
  api.post('/vendas/:codigo/emitir', exigir(...VENDE), (req, res) => {
    const { documento, novo, processamento } = s.emissao.emitir(req.params.codigo, req.usuario.id);
    semEspera(processamento);
    res.status(novo ? 201 : 200).json({ documento, novo });
  });

  api.get('/documentos', exigir(), (req, res) => res.json(s.repos.documentos.listar({ estado: String(req.query.estado ?? '') })));
  api.get('/documentos/:id', exigir(), (req, res) => res.json(s.emissao.detalhar(req.params.id)));
  api.post('/documentos/:id/reenviar', exigir(...VENDE), (req, res) => {
    const { documento, processamento } = s.emissao.reenviar(req.params.id, req.usuario.id);
    semEspera(processamento);
    res.json(documento);
  });
  api.post('/documentos/:id/cancelar', exigir('Gerente'), async (req, res) => {
    res.json(await s.emissao.cancelar(req.params.id, req.body.justificativa, req.usuario));
  });

  api.get('/configuracao', exigir(), (_req, res) => res.json(s.gestao.configuracao()));
  api.put('/configuracao', exigir('Gerente'), (req, res) => res.json(s.gestao.alterarConfiguracao(req.body, req.usuario)));
  api.get('/painel', exigir('Gerente', 'Contador'), (req, res) => res.json(s.gestao.painel(String(req.query.mes))));
  api.get('/exportacao', exigir('Contador', 'Gerente'), (req, res) => {
    const mes = String(req.query.mes);
    res.attachment(`emiteja-${mes}.json`).json(s.gestao.exportacao(mes));
  });

  // Endpoint do contrato da seção 7.2, exposto para inspeção na apresentação.
  api.post('/autorizador/documentos', exigir('Gerente'), async (req, res) => {
    const { http, corpo } = await s.autorizador.autorizar(req.body);
    res.status(http).json(corpo);
  });

  api.use((erro, _req, res, _next) => {
    if (erro instanceof ErroNegocio) return res.status(erro.status).json({ erro: erro.message });
    if (erro?.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
    console.error('[api]', erro);
    return res.status(500).json({ erro: 'Erro interno. Tente de novo.' });
  });
  return api;
}

export function criarApp(servicos) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', rotasApi(servicos));
  app.use('/fontes/sans', express.static(join(RAIZ, 'node_modules/@fontsource/ibm-plex-sans')));
  app.use('/fontes/mono', express.static(join(RAIZ, 'node_modules/@fontsource/ibm-plex-mono')));
  app.use(express.static(join(RAIZ, 'public')));
  return app;
}

// A Vercel pode tomar este arquivo como entrada e exige um export default que seja função.
// O app de verdade (banco em /tmp, seed) é montado em index.js, carregado só na primeira requisição.
export default async function entradaVercel(req, res) {
  const { default: app } = await import('../index.js');
  return app(req, res);
}
