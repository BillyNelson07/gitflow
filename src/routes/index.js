'use strict';

const { Router } = require('express');
const criarTarefaRoutes = require('./tarefa.routes');
const criarHealthRoutes = require('./health.routes');

/** Agrega todas as rotas da API. */
function criarRotas({ tarefaService, verificarBanco }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({
      message: 'API simples rodando perfeitamente!',
      versao: '2.0.0',
      endpoints: ['/health', '/tarefas', '/tarefas/estatisticas'],
    });
  });

  router.use('/health', criarHealthRoutes(verificarBanco));
  router.use('/tarefas', criarTarefaRoutes(tarefaService));

  return router;
}

module.exports = criarRotas;
