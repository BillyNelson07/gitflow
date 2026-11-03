'use strict';

/**
 * Model de Tarefa: schema da tabela, constantes do domínio e validações.
 */

const STATUS = Object.freeze({
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDA: 'concluida',
});

const PRIORIDADES = Object.freeze({
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
});

const STATUS_VALIDOS = Object.values(STATUS);
const PRIORIDADES_VALIDAS = Object.values(PRIORIDADES);

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 100;

const SQL_CRIAR_TABELA = `
  CREATE TABLE IF NOT EXISTS tarefas (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(100) NOT NULL,
    descricao     TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'pendente',
    prioridade    VARCHAR(10)  NOT NULL DEFAULT 'media',
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )
`;

const ehTextoNaoVazio = (valor) => typeof valor === 'string' && valor.trim().length > 0;

function validarTitulo(titulo, erros) {
  if (!ehTextoNaoVazio(titulo)) {
    erros.push('titulo é obrigatório.');
  } else if (titulo.trim().length < 3 || titulo.trim().length > 100) {
    erros.push('titulo deve ter entre 3 e 100 caracteres.');
  }
}

function validarDescricao(descricao, erros) {
  if (descricao !== undefined && descricao !== null && typeof descricao !== 'string') {
    erros.push('descricao deve ser um texto.');
  }
}

function validarStatus(status, erros) {
  if (!STATUS_VALIDOS.includes(status)) {
    erros.push(`status deve ser um de: ${STATUS_VALIDOS.join(', ')}.`);
  }
}

function validarPrioridade(prioridade, erros) {
  if (!PRIORIDADES_VALIDAS.includes(prioridade)) {
    erros.push(`prioridade deve ser uma de: ${PRIORIDADES_VALIDAS.join(', ')}.`);
  }
}

/**
 * Valida o corpo de criação.
 * @returns {{ erros: string[], dados: object }}
 */
function validarCriacao(corpo = {}) {
  const erros = [];
  const { titulo, descricao, status = STATUS.PENDENTE, prioridade = PRIORIDADES.MEDIA } = corpo;

  validarTitulo(titulo, erros);
  validarDescricao(descricao, erros);
  validarStatus(status, erros);
  validarPrioridade(prioridade, erros);

  return {
    erros,
    dados: {
      titulo: typeof titulo === 'string' ? titulo.trim() : titulo,
      descricao: descricao ?? null,
      status,
      prioridade,
    },
  };
}

/**
 * Valida o corpo de atualização (parcial: só os campos enviados).
 * @returns {{ erros: string[], dados: object }}
 */
function validarAtualizacao(corpo = {}) {
  const erros = [];
  const dados = {};

  if ('titulo' in corpo) {
    validarTitulo(corpo.titulo, erros);
    if (typeof corpo.titulo === 'string') dados.titulo = corpo.titulo.trim();
  }
  if ('descricao' in corpo) {
    validarDescricao(corpo.descricao, erros);
    dados.descricao = corpo.descricao ?? null;
  }
  if ('status' in corpo) {
    validarStatus(corpo.status, erros);
    dados.status = corpo.status;
  }
  if ('prioridade' in corpo) {
    validarPrioridade(corpo.prioridade, erros);
    dados.prioridade = corpo.prioridade;
  }
  if (Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push('Envie ao menos um campo para atualizar (titulo, descricao, status, prioridade).');
  }

  return { erros, dados };
}

/**
 * Valida e normaliza os filtros e a paginação da listagem.
 * @returns {{ erros: string[], filtros: object }}
 */
function validarFiltros(query = {}) {
  const erros = [];
  const { status, prioridade, busca } = query;
  const pagina = query.pagina === undefined ? 1 : Number(query.pagina);
  const limite = query.limite === undefined ? LIMITE_PADRAO : Number(query.limite);

  if (status !== undefined) validarStatus(status, erros);
  if (prioridade !== undefined) validarPrioridade(prioridade, erros);
  if (!Number.isInteger(pagina) || pagina < 1) erros.push('pagina deve ser um inteiro >= 1.');
  if (!Number.isInteger(limite) || limite < 1 || limite > LIMITE_MAXIMO) {
    erros.push(`limite deve ser um inteiro entre 1 e ${LIMITE_MAXIMO}.`);
  }

  return {
    erros,
    filtros: {
      status,
      prioridade,
      busca: ehTextoNaoVazio(busca) ? busca.trim() : undefined,
      pagina,
      limite,
    },
  };
}

/** Converte o parâmetro de rota em id numérico, ou retorna null se inválido. */
function converterId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = {
  STATUS,
  PRIORIDADES,
  STATUS_VALIDOS,
  PRIORIDADES_VALIDAS,
  SQL_CRIAR_TABELA,
  validarCriacao,
  validarAtualizacao,
  validarFiltros,
  converterId,
};
