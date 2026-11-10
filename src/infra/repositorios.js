// Acesso a dados. Os serviços dependem destas funções, nunca de SQL direto.
const umOuNulo = (linha) => linha ?? null;

function repoUsuarios(q) {
  return {
    porLogin: (login) => umOuNulo(q('SELECT * FROM usuarios WHERE login = ?').get(login)),
    porId: (id) => umOuNulo(q('SELECT id, nome, login, perfil FROM usuarios WHERE id = ?').get(id)),
    inserir: (u) => q('INSERT INTO usuarios (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)')
      .run(u.nome, u.login, u.senhaHash, u.perfil).lastInsertRowid,
    contar: () => q('SELECT COUNT(*) AS n FROM usuarios').get().n,
  };
}

function repoMotos(q) {
  return {
    listar: ({ busca = '', situacao = '', cilMin = 0, cilMax = 99999, precoMax = 0 } = {}) =>
      q(`SELECT * FROM motos WHERE (marca || ' ' || modelo || ' ' || chassi || ' ' || cor) LIKE ?
         AND (? = '' OR situacao = ?) AND cilindrada BETWEEN ? AND ? AND (? = 0 OR preco_centavos <= ?)
         ORDER BY situacao = 'Disponível' DESC, marca, modelo`)
        .all(`%${busca}%`, situacao, situacao, cilMin, cilMax, precoMax, precoMax),
    porChassi: (chassi) => umOuNulo(q('SELECT * FROM motos WHERE chassi = ?').get(chassi)),
    inserir: (m) => q(`INSERT INTO motos (chassi, marca, modelo, cilindrada, ano, cor, preco_centavos)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(m.chassi, m.marca, m.modelo, m.cilindrada, m.ano, m.cor, m.precoCentavos),
    // Troca a situação só se a moto estiver na situação esperada; devolve true se trocou.
    trocarSituacao: (chassi, de, para) =>
      q('UPDATE motos SET situacao = ? WHERE chassi = ? AND situacao = ?').run(para, chassi, de).changes === 1,
  };
}

function repoClientes(q) {
  return {
    listar: (busca = '') => {
      const digitos = busca.replace(/\D/g, '');
      return q('SELECT * FROM clientes WHERE nome LIKE ? OR documento LIKE ? ORDER BY nome')
        .all(`%${busca}%`, `%${digitos || busca}%`);
    },
    porId: (id) => umOuNulo(q('SELECT * FROM clientes WHERE id = ?').get(id)),
    porDocumento: (doc) => umOuNulo(q('SELECT * FROM clientes WHERE documento = ?').get(doc)),
    inserir: (c) => q('INSERT INTO clientes (documento, nome, endereco, email) VALUES (?, ?, ?, ?)')
      .run(c.documento, c.nome, c.endereco, c.email).lastInsertRowid,
    atualizar: (id, c) => q('UPDATE clientes SET nome = ?, endereco = ?, email = ? WHERE id = ?')
      .run(c.nome, c.endereco, c.email, id),
  };
}

function repoVendas(q) {
  return {
    porCodigo: (codigo) => umOuNulo(q('SELECT * FROM vendas WHERE codigo = ?').get(codigo)),
    proximoCodigo: (ano) => {
      const ultimo = q('SELECT codigo FROM vendas WHERE codigo LIKE ? ORDER BY codigo DESC LIMIT 1').get(`${ano}-%`);
      const seq = ultimo ? Number(ultimo.codigo.split('-')[1]) + 1 : 1;
      return `${ano}-${String(seq).padStart(6, '0')}`;
    },
    inserir: (v) => q(`INSERT INTO vendas (codigo, chassi, cliente_id, vendedor_id, forma_pagamento, valor_centavos, data_hora)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(v.codigo, v.chassi, v.clienteId, v.vendedorId, v.formaPagamento, v.valorCentavos, v.dataHora),
    cancelar: (codigo) => q(`UPDATE vendas SET situacao = 'Cancelada' WHERE codigo = ?`).run(codigo),
  };
}

const SELECT_DOC = `SELECT d.*, v.chassi, v.cliente_id, v.vendedor_id, v.forma_pagamento, v.valor_centavos,
    v.data_hora AS venda_data_hora, v.situacao AS venda_situacao,
    m.marca, m.modelo, m.cilindrada, m.ano, m.cor, m.situacao AS moto_situacao,
    c.nome AS cliente_nome, c.documento AS cliente_documento, c.endereco AS cliente_endereco,
    c.email AS cliente_email, u.nome AS vendedor_nome
  FROM documentos d JOIN vendas v ON v.codigo = d.venda_codigo JOIN motos m ON m.chassi = v.chassi
  JOIN clientes c ON c.id = v.cliente_id JOIN usuarios u ON u.id = v.vendedor_id`;

const CAMPOS_DOCUMENTO = new Set([
  'estado', 'protocolo', 'codigo_rejeicao', 'motivo_rejeicao', 'aviso', 'tentativas', 'proxima_tentativa',
  'reenvio_manual', 'pedidos', 'autorizado_em', 'protocolo_cancelamento', 'justificativa_cancelamento',
]);

function repoDocumentos(q) {
  return {
    porId: (id) => umOuNulo(q(`${SELECT_DOC} WHERE d.id = ?`).get(id)),
    porVenda: (codigo) => umOuNulo(q(`${SELECT_DOC} WHERE d.venda_codigo = ?`).get(codigo)),
    listar: ({ estado = '', de = '', ate = '' } = {}) => q(`${SELECT_DOC}
      WHERE (? = '' OR d.estado = ?) AND (? = '' OR d.criado_em >= ?) AND (? = '' OR d.criado_em < ?)
      ORDER BY d.id DESC`).all(estado, estado, de, de, ate, ate),
    inserir: (d) => q(`INSERT INTO documentos (venda_codigo, estado, politica, aliquota, imposto_centavos, criado_em)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(d.vendaCodigo, d.estado, d.politica, d.aliquota, d.impostoCentavos, d.criadoEm).lastInsertRowid,
    atualizar: (id, campos) => {
      const nomes = Object.keys(campos).filter((n) => CAMPOS_DOCUMENTO.has(n));
      if (nomes.length === 0) return;
      const sets = nomes.map((n) => `${n} = ?`).join(', ');
      q(`UPDATE documentos SET ${sets} WHERE id = ?`).run(...nomes.map((n) => campos[n] ?? null), id);
    },
    pendentesVencidos: (agoraIso) => q(`SELECT id FROM documentos WHERE estado = 'Pendente'
      AND reenvio_manual = 0 AND proxima_tentativa <= ?`).all(agoraIso).map((l) => l.id),
  };
}

function repoTransicoes(q) {
  return {
    registrar: (t) => q(`INSERT INTO transicoes (documento_id, de, para, data_hora, usuario_id, detalhe)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(t.documentoId, t.de ?? null, t.para, t.dataHora, t.usuarioId ?? null, t.detalhe ?? null),
    doDocumento: (id) => q(`SELECT t.*, u.nome AS usuario_nome FROM transicoes t
      LEFT JOIN usuarios u ON u.id = t.usuario_id WHERE documento_id = ? ORDER BY t.id`).all(id),
  };
}

function repoConfiguracao(q) {
  return {
    obter: () => q('SELECT politica_ativa, cenario FROM configuracao WHERE id = 1').get(),
    salvar: ({ politica, cenario, dataHora, usuarioId }) => {
      q('UPDATE configuracao SET politica_ativa = ?, cenario = ? WHERE id = 1').run(politica, cenario);
      q('INSERT INTO alteracoes_configuracao (politica, cenario, data_hora, usuario_id) VALUES (?, ?, ?, ?)')
        .run(politica, cenario, dataHora, usuarioId);
    },
    historico: () => q(`SELECT a.*, u.nome AS usuario_nome FROM alteracoes_configuracao a
      LEFT JOIN usuarios u ON u.id = a.usuario_id ORDER BY a.id DESC LIMIT 10`).all(),
  };
}

function repoRelatorios(q) {
  return {
    vendasNoPeriodo: (de, ate) => q(`SELECT COUNT(*) AS quantidade, COALESCE(SUM(valor_centavos), 0) AS total
      FROM vendas WHERE situacao = 'Confirmada' AND data_hora >= ? AND data_hora < ?`).get(de, ate),
    documentosPorEstado: (de, ate) => q(`SELECT estado, COUNT(*) AS quantidade FROM documentos
      WHERE criado_em >= ? AND criado_em < ? GROUP BY estado`).all(de, ate),
    impostoPorPolitica: (de, ate) => q(`SELECT politica, COUNT(*) AS quantidade, SUM(imposto_centavos) AS total
      FROM documentos WHERE estado = 'Autorizado' AND criado_em >= ? AND criado_em < ? GROUP BY politica`).all(de, ate),
  };
}

export function criarRepositorios(db) {
  const q = (sql) => db.prepare(sql);
  return Object.freeze({
    usuarios: repoUsuarios(q),
    motos: repoMotos(q),
    clientes: repoClientes(q),
    vendas: repoVendas(q),
    documentos: repoDocumentos(q),
    transicoes: repoTransicoes(q),
    configuracao: repoConfiguracao(q),
    relatorios: repoRelatorios(q),
  });
}
