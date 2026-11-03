'use strict';

/**
 * Teste de integração: usa um PostgreSQL REAL (o mesmo do docker compose).
 * Só executa com RUN_DB_TESTS=1, por exemplo:
 *   docker compose up -d db
 *   DB_HOST=localhost npm run test:integration
 */
const { criarPool } = require('../../src/config/database');
const config = require('../../src/config/env');
const TarefaRepository = require('../../src/repositories/tarefa.repository');
const TarefaService = require('../../src/services/tarefa.service');

const rodar = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

rodar('Integração: Service + Repository + PostgreSQL', () => {
  let pool;
  let repository;
  let service;

  beforeAll(async () => {
    pool = criarPool(config.db);
    repository = new TarefaRepository(pool);
    await repository.criarTabela();
    service = new TarefaService(repository);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE tarefas RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('cria, busca, atualiza, conclui e remove uma tarefa', async () => {
    const criada = await service.criar({ titulo: 'Tarefa de integração', prioridade: 'alta' });
    expect(criada.id).toBeGreaterThan(0);

    const buscada = await service.buscarPorId(criada.id);
    expect(buscada.titulo).toBe('Tarefa de integração');

    const atualizada = await service.atualizar(criada.id, { status: 'em_andamento' });
    expect(atualizada.status).toBe('em_andamento');

    const concluida = await service.concluir(criada.id);
    expect(concluida.status).toBe('concluida');

    await service.remover(criada.id);
    await expect(service.buscarPorId(criada.id)).rejects.toMatchObject({ status: 404 });
  });

  it('filtra, busca por texto e pagina', async () => {
    await service.criar({ titulo: 'Estudar Docker', prioridade: 'alta' });
    await service.criar({ titulo: 'Estudar Postgres', status: 'em_andamento' });
    await service.criar({ titulo: 'Lavar o carro', descricao: 'fim de semana' });

    const porBusca = await service.listar({ busca: 'estudar' });
    expect(porBusca.paginacao.total).toBe(2);

    const porStatus = await service.listar({ status: 'em_andamento' });
    expect(porStatus.itens).toHaveLength(1);

    const paginada = await service.listar({ limite: '2', pagina: '2' });
    expect(paginada.itens).toHaveLength(1);
    expect(paginada.paginacao.totalPaginas).toBe(2);
  });

  it('calcula estatísticas por status', async () => {
    await service.criar({ titulo: 'Tarefa A' });
    await service.criar({ titulo: 'Tarefa B', status: 'concluida' });

    await expect(service.estatisticas()).resolves.toEqual({
      total: 2,
      porStatus: { pendente: 1, em_andamento: 0, concluida: 1 },
    });
  });
});
