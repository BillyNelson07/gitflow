'use strict';

const { Router } = require('express');

/** GET /health: confirma que a API está de pé e que o banco responde. */
function criarHealthRoutes(verificarBanco) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      await verificarBanco();
      res.json({ status: 'ok', banco: 'conectado' });
    } catch (erro) {
      res.status(503).json({ status: 'erro', banco: 'indisponivel' });
    }
  });

  return router;
}

module.exports = criarHealthRoutes;
