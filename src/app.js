'use strict';

const express = require('express');
const criarRotas = require('./routes');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/error-handler');

/**
 * Monta a aplicação Express a partir das dependências recebidas.
 * Não abre porta nem conecta no banco, o que facilita os testes.
 */
function criarApp({ tarefaService, verificarBanco }) {
  const app = express();

  app.use(express.json());
  app.use(criarRotas({ tarefaService, verificarBanco }));
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}

module.exports = criarApp;
