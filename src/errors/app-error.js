'use strict';

/** Erro de negócio/HTTP com status e detalhes opcionais. */
class AppError extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

const erroValidacao = (detalhes) => new AppError(400, 'Dados inválidos.', detalhes);
const erroNaoEncontrado = (mensagem) => new AppError(404, mensagem);
const erroConflito = (mensagem) => new AppError(409, mensagem);

module.exports = { AppError, erroValidacao, erroNaoEncontrado, erroConflito };
