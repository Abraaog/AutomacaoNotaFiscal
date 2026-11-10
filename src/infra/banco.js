import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY, nome TEXT NOT NULL, login TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL, perfil TEXT NOT NULL CHECK (perfil IN ('Vendedor','Gerente','Contador'))
);
CREATE TABLE IF NOT EXISTS motos (
  chassi TEXT PRIMARY KEY, marca TEXT NOT NULL, modelo TEXT NOT NULL, cilindrada INTEGER NOT NULL,
  ano INTEGER NOT NULL, cor TEXT NOT NULL, preco_centavos INTEGER NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'Disponível' CHECK (situacao IN ('Disponível','Reservada','Vendida'))
);
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY, documento TEXT NOT NULL UNIQUE, nome TEXT NOT NULL,
  endereco TEXT NOT NULL, email TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS vendas (
  codigo TEXT PRIMARY KEY, chassi TEXT NOT NULL REFERENCES motos(chassi),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id), vendedor_id INTEGER NOT NULL REFERENCES usuarios(id),
  forma_pagamento TEXT NOT NULL, valor_centavos INTEGER NOT NULL, data_hora TEXT NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'Confirmada' CHECK (situacao IN ('Confirmada','Cancelada'))
);
CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY, venda_codigo TEXT NOT NULL UNIQUE REFERENCES vendas(codigo),
  estado TEXT NOT NULL, politica TEXT NOT NULL, aliquota REAL NOT NULL, imposto_centavos INTEGER NOT NULL,
  protocolo TEXT, codigo_rejeicao TEXT, motivo_rejeicao TEXT, aviso TEXT,
  tentativas INTEGER NOT NULL DEFAULT 0, proxima_tentativa TEXT, reenvio_manual INTEGER NOT NULL DEFAULT 0,
  pedidos INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL, autorizado_em TEXT,
  protocolo_cancelamento TEXT, justificativa_cancelamento TEXT
);
CREATE TABLE IF NOT EXISTS transicoes (
  id INTEGER PRIMARY KEY, documento_id INTEGER NOT NULL REFERENCES documentos(id),
  de TEXT, para TEXT NOT NULL, data_hora TEXT NOT NULL, usuario_id INTEGER REFERENCES usuarios(id), detalhe TEXT
);
CREATE TABLE IF NOT EXISTS configuracao (
  id INTEGER PRIMARY KEY CHECK (id = 1), politica_ativa TEXT NOT NULL, cenario TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS alteracoes_configuracao (
  id INTEGER PRIMARY KEY, politica TEXT NOT NULL, cenario TEXT NOT NULL,
  data_hora TEXT NOT NULL, usuario_id INTEGER REFERENCES usuarios(id)
);
INSERT OR IGNORE INTO configuracao (id, politica_ativa, cenario) VALUES (1, 'A_ALIQUOTA_UNICA', 'SUCESSO');
`;

export function abrirBanco(caminho = ':memory:') {
  if (caminho !== ':memory:') mkdirSync(dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(ESQUEMA);
  return db;
}

// Executa fn dentro de uma transação; desfaz tudo se fn lançar erro.
// A restrição UNIQUE em documentos.venda_codigo garante a RN01 mesmo sob concorrência.
export function transacao(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const resultado = fn();
    db.exec('COMMIT');
    return resultado;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}
