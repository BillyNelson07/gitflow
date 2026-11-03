'use strict';

const {
  validarCriacao,
  validarAtualizacao,
  validarFiltros,
  converterId,
} = require('../src/models/tarefa.model');

describe('tarefa.model', () => {
  describe('validarCriacao', () => {
    it('aceita dados válidos e aplica valores padrão', () => {
      const { erros, dados } = validarCriacao({ titulo: '  Estudar Node  ' });
      expect(erros).toEqual([]);
      expect(dados).toEqual({
        titulo: 'Estudar Node',
        descricao: null,
        status: 'pendente',
        prioridade: 'media',
      });
    });

    it('rejeita título ausente', () => {
      const { erros } = validarCriacao({});
      expect(erros).toContain('titulo é obrigatório.');
    });

    it('rejeita título curto demais', () => {
      const { erros } = validarCriacao({ titulo: 'ab' });
      expect(erros).toContain('titulo deve ter entre 3 e 100 caracteres.');
    });

    it('rejeita status e prioridade inválidos', () => {
      const { erros } = validarCriacao({ titulo: 'Tarefa ok', status: 'x', prioridade: 'y' });
      expect(erros).toHaveLength(2);
    });
  });

  describe('validarAtualizacao', () => {
    it('aceita atualização parcial', () => {
      const { erros, dados } = validarAtualizacao({ status: 'em_andamento' });
      expect(erros).toEqual([]);
      expect(dados).toEqual({ status: 'em_andamento' });
    });

    it('rejeita corpo vazio', () => {
      const { erros } = validarAtualizacao({});
      expect(erros).toHaveLength(1);
    });

    it('rejeita campo inválido', () => {
      const { erros } = validarAtualizacao({ prioridade: 'urgente' });
      expect(erros).toHaveLength(1);
    });
  });

  describe('validarFiltros', () => {
    it('usa paginação padrão', () => {
      const { erros, filtros } = validarFiltros({});
      expect(erros).toEqual([]);
      expect(filtros).toMatchObject({ pagina: 1, limite: 10 });
    });

    it('converte pagina e limite de texto para número', () => {
      const { filtros } = validarFiltros({ pagina: '2', limite: '5', busca: ' docker ' });
      expect(filtros).toMatchObject({ pagina: 2, limite: 5, busca: 'docker' });
    });

    it('rejeita limite acima do máximo e página inválida', () => {
      const { erros } = validarFiltros({ pagina: '0', limite: '1000' });
      expect(erros).toHaveLength(2);
    });
  });

  describe('converterId', () => {
    it('converte inteiros positivos', () => {
      expect(converterId('7')).toBe(7);
    });

    it.each(['abc', '0', '-1', '1.5', ''])('retorna null para %p', (valor) => {
      expect(converterId(valor)).toBeNull();
    });
  });
});
