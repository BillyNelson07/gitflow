'use strict';

const TarefaService = require('../src/services/tarefa.service');
const { AppError } = require('../src/errors/app-error');
const { tarefaExemplo, criarRepositoryFalso } = require('./helpers');

describe('TarefaService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = criarRepositoryFalso();
    service = new TarefaService(repository);
  });

  describe('listar', () => {
    it('calcula offset e metadados de paginação', async () => {
      repository.listar.mockResolvedValue({ itens: [tarefaExemplo()], total: 25 });

      const resultado = await service.listar({ pagina: '3', limite: '10', status: 'pendente' });

      expect(repository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pendente', limite: 10, offset: 20 })
      );
      expect(resultado.paginacao).toEqual({ pagina: 3, limite: 10, total: 25, totalPaginas: 3 });
    });

    it('lança erro 400 para filtros inválidos', async () => {
      await expect(service.listar({ status: 'invalido' })).rejects.toMatchObject({ status: 400 });
      expect(repository.listar).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('retorna a tarefa encontrada', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo());
      await expect(service.buscarPorId('1')).resolves.toMatchObject({ id: 1 });
      expect(repository.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('lança 404 quando não existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);
      await expect(service.buscarPorId('99')).rejects.toMatchObject({ status: 404 });
    });

    it('lança 400 para id inválido', async () => {
      await expect(service.buscarPorId('abc')).rejects.toBeInstanceOf(AppError);
      expect(repository.buscarPorId).not.toHaveBeenCalled();
    });
  });

  describe('criar', () => {
    it('persiste dados validados e normalizados', async () => {
      repository.criar.mockResolvedValue(tarefaExemplo());

      await service.criar({ titulo: '  Nova tarefa  ', prioridade: 'alta' });

      expect(repository.criar).toHaveBeenCalledWith({
        titulo: 'Nova tarefa',
        descricao: null,
        status: 'pendente',
        prioridade: 'alta',
      });
    });

    it('lança 400 sem chamar o repository quando inválido', async () => {
      await expect(service.criar({ titulo: '' })).rejects.toMatchObject({ status: 400 });
      expect(repository.criar).not.toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('atualiza campos enviados', async () => {
      repository.atualizar.mockResolvedValue(tarefaExemplo({ status: 'em_andamento' }));

      const resultado = await service.atualizar('1', { status: 'em_andamento' });

      expect(repository.atualizar).toHaveBeenCalledWith(1, { status: 'em_andamento' });
      expect(resultado.status).toBe('em_andamento');
    });

    it('lança 404 quando a tarefa não existe', async () => {
      repository.atualizar.mockResolvedValue(null);
      await expect(service.atualizar('1', { titulo: 'Novo título' })).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('concluir', () => {
    it('marca a tarefa como concluída', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo());
      repository.atualizar.mockResolvedValue(tarefaExemplo({ status: 'concluida' }));

      const resultado = await service.concluir('1');

      expect(repository.atualizar).toHaveBeenCalledWith(1, { status: 'concluida' });
      expect(resultado.status).toBe('concluida');
    });

    it('lança 409 se já estiver concluída', async () => {
      repository.buscarPorId.mockResolvedValue(tarefaExemplo({ status: 'concluida' }));
      await expect(service.concluir('1')).rejects.toMatchObject({ status: 409 });
      expect(repository.atualizar).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    it('remove tarefa existente', async () => {
      repository.remover.mockResolvedValue(true);
      await expect(service.remover('1')).resolves.toBeUndefined();
    });

    it('lança 404 se nada foi removido', async () => {
      repository.remover.mockResolvedValue(false);
      await expect(service.remover('1')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('estatisticas', () => {
    it('inclui status sem tarefas com valor zero e soma o total', async () => {
      repository.contarPorStatus.mockResolvedValue([
        { status: 'pendente', quantidade: 3 },
        { status: 'concluida', quantidade: 2 },
      ]);

      await expect(service.estatisticas()).resolves.toEqual({
        total: 5,
        porStatus: { pendente: 3, em_andamento: 0, concluida: 2 },
      });
    });
  });
});
