'use strict';

const { SQL_CRIAR_TABELA } = require('../models/tarefa.model');

/** Campos que podem ser alterados via UPDATE (lista fixa evita SQL injection por nome de coluna). */
const CAMPOS_ATUALIZAVEIS = ['titulo', 'descricao', 'status', 'prioridade'];

/**
 * Repository: única camada que conversa com o banco de dados.
 * Recebe qualquer objeto com método `query(sql, params)` (ex.: pg.Pool).
 */
class TarefaRepository {
  constructor(db) {
    this.db = db;
  }

  async criarTabela() {
    await this.db.query(SQL_CRIAR_TABELA);
  }

  async listar({ status, prioridade, busca, limite, offset }) {
    const condicoes = [];
    const params = [];

    if (status) {
      params.push(status);
      condicoes.push(`status = $${params.length}`);
    }
    if (prioridade) {
      params.push(prioridade);
      condicoes.push(`prioridade = $${params.length}`);
    }
    if (busca) {
      params.push(`%${busca}%`);
      condicoes.push(`(titulo ILIKE $${params.length} OR descricao ILIKE $${params.length})`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const total = await this.db.query(`SELECT COUNT(*) AS total FROM tarefas ${where}`, params);
    const itens = await this.db.query(
      `SELECT * FROM tarefas ${where}
       ORDER BY id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limite, offset]
    );

    return { itens: itens.rows, total: Number(total.rows[0].total) };
  }

  async buscarPorId(id) {
    const { rows } = await this.db.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async criar({ titulo, descricao, status, prioridade }) {
    const { rows } = await this.db.query(
      `INSERT INTO tarefas (titulo, descricao, status, prioridade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, descricao, status, prioridade]
    );
    return rows[0];
  }

  async atualizar(id, dados) {
    const campos = CAMPOS_ATUALIZAVEIS.filter((campo) => campo in dados);
    if (campos.length === 0) return this.buscarPorId(id);

    const atribuicoes = campos.map((campo, indice) => `${campo} = $${indice + 1}`);
    const valores = campos.map((campo) => dados[campo]);

    const { rows } = await this.db.query(
      `UPDATE tarefas
          SET ${atribuicoes.join(', ')}, atualizado_em = NOW()
        WHERE id = $${campos.length + 1}
        RETURNING *`,
      [...valores, id]
    );
    return rows[0] || null;
  }

  async remover(id) {
    const { rowCount } = await this.db.query('DELETE FROM tarefas WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async contarPorStatus() {
    const { rows } = await this.db.query(
      'SELECT status, COUNT(*) AS quantidade FROM tarefas GROUP BY status'
    );
    return rows.map((linha) => ({ status: linha.status, quantidade: Number(linha.quantidade) }));
  }
}

module.exports = TarefaRepository;
