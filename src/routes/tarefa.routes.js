'use strict';

const { Router } = require('express');
const asyncHandler = require('../middlewares/async-handler');

/** Rotas de /tarefas. Só traduz HTTP <-> service; não contém regra de negócio. */
function criarTarefaRoutes(tarefaService) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await tarefaService.listar(req.query));
    })
  );

  // Precisa vir antes de "/:id", senão "estatisticas" seria lido como id.
  router.get(
    '/estatisticas',
    asyncHandler(async (req, res) => {
      res.json(await tarefaService.estatisticas());
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      res.json(await tarefaService.buscarPorId(req.params.id));
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      res.status(201).json(await tarefaService.criar(req.body));
    })
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      res.json(await tarefaService.atualizar(req.params.id, req.body));
    })
  );

  router.patch(
    '/:id/concluir',
    asyncHandler(async (req, res) => {
      res.json(await tarefaService.concluir(req.params.id));
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await tarefaService.remover(req.params.id);
      res.status(204).send();
    })
  );

  return router;
}

module.exports = criarTarefaRoutes;
