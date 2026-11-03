'use strict';

const request = require('supertest');
const criarApp = require('../src/app');
const TarefaService = require('../src/services/tarefa.service');
const { tarefaExemplo, criarRepositoryFalso } = require('./helpers');

describe('Rotas da API', () => {
  let repository;
  let app;

  beforeEach(() => {
    repository = criarRepositoryFalso();
    app = criarApp({
      tarefaService: new TarefaService(repository),
      verificarBanco: jest.fn().mockResolvedValue(),
    });
  });

  describe('GET /', () => {
    it('retorna a mensagem da API', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('API simples rodando perfeitamente!');
    });
  });

  describe('GET /health', () => {
    it('retorna 200 quando o banco responde', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', banco: 'conectado' });
    });

    it('retorna 503 quando o banco falha', async () => {
      const appSemBanco = criarApp({
        tarefaService: new TarefaService(repository),
        verificarBanco: jest.fn().mockRejectedValue(new Error('sem conexão')),
      });
      const res = await request(appSemBanco).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('erro');
    });
  });

  describe('GET /tarefas', () => {
    it('lista tarefas com paginação', async () => {
      repository.listar.mockResolvedValue({ itens: [tarefaExemplo()], total: 1 });
      const res = await request(app).get('/tarefas?status=pendente&limite=5');
      expect(res.status).toBe(200);
      expect(res.body.itens).toHaveLength(1);
      expect(res.body.paginacao).toEqual({ pagina: 1, limite: 5, total: 1, totalPaginas: 1 });
    });

    it('retorna 400 para filtro inválido', async () => {
      const res = await request(app).get('/tarefas?status=xyz');
      expect(res.status).toBe(400);
      expect(res.body.detalhes).toBeDefined();
    });
  });

  describe('GET /tarefas/estatisticas', () => {
    it('retorna contagem por status (sem confundir com :id)', async () => {
      repository.contarPorStatus.mockResolvedValue([{ status: 'pendente', quantidade: 2 }]);
      const res = await request(app).get('/tarefas/estatisticas');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
    });
  });

  describe('GET /tarefas/:id', () => {
    it('retorna a tarefa', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo());
      const res = await request(app).get('/tarefas/1');
      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe('Estudar Docker Compose');
    });

    it('retorna 404 quando não existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);
      const res = await request(app).get('/tarefas/99');
      expect(res.status).toBe(404);
    });

    it('retorna 400 para id inválido', async () => {
      const res = await request(app).get('/tarefas/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /tarefas', () => {
    it('cria tarefa e retorna 201', async () => {
      repository.criar.mockResolvedValue(tarefaExemplo({ id: 2, titulo: 'Nova tarefa' }));
      const res = await request(app).post('/tarefas').send({ titulo: 'Nova tarefa' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(2);
    });

    it('retorna 400 com dados inválidos', async () => {
      const res = await request(app).post('/tarefas').send({ titulo: '' });
      expect(res.status).toBe(400);
      expect(repository.criar).not.toHaveBeenCalled();
    });

    it('retorna 400 com JSON malformado', async () => {
      const res = await request(app)
        .post('/tarefas')
        .set('Content-Type', 'application/json')
        .send('{ titulo: ');
      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/JSON inválido/);
    });
  });

  describe('PUT /tarefas/:id', () => {
    it('atualiza a tarefa', async () => {
      repository.atualizar.mockResolvedValue(tarefaExemplo({ prioridade: 'alta' }));
      const res = await request(app).put('/tarefas/1').send({ prioridade: 'alta' });
      expect(res.status).toBe(200);
      expect(res.body.prioridade).toBe('alta');
    });

    it('retorna 404 quando não existe', async () => {
      repository.atualizar.mockResolvedValue(null);
      const res = await request(app).put('/tarefas/1').send({ titulo: 'Outro título' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tarefas/:id/concluir', () => {
    it('conclui a tarefa', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo());
      repository.atualizar.mockResolvedValue(tarefaExemplo({ status: 'concluida' }));
      const res = await request(app).patch('/tarefas/1/concluir');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('concluida');
    });

    it('retorna 409 se já concluída', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo({ status: 'concluida' }));
      const res = await request(app).patch('/tarefas/1/concluir');
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /tarefas/:id', () => {
    it('remove e retorna 204', async () => {
      repository.remover.mockResolvedValue(true);
      const res = await request(app).delete('/tarefas/1');
      expect(res.status).toBe(204);
    });

    it('retorna 404 quando não existe', async () => {
      repository.remover.mockResolvedValue(false);
      const res = await request(app).delete('/tarefas/1');
      expect(res.status).toBe(404);
    });
  });

  describe('rotas inexistentes e erros inesperados', () => {
    it('retorna 404 para rota desconhecida', async () => {
      const res = await request(app).get('/nao-existe');
      expect(res.status).toBe(404);
    });

    it('retorna 500 genérico para erro inesperado', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      repository.buscarPorId.mockRejectedValue(new Error('falha interna'));
      const res = await request(app).get('/tarefas/1');
      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno do servidor.');
      spy.mockRestore();
    });
  });
});
