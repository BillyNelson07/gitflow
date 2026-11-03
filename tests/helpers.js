'use strict';

/** Cria uma tarefa de exemplo, permitindo sobrescrever campos. */
function tarefaExemplo(sobrescritas = {}) {
  return {
    id: 1,
    titulo: 'Estudar Docker Compose',
    descricao: 'Ler a documentação oficial',
    status: 'pendente',
    prioridade: 'media',
    criado_em: '2026-11-03T12:00:00.000Z',
    atualizado_em: '2026-11-03T12:00:00.000Z',
    ...sobrescritas,
  };
}

/** Repository falso: todos os métodos são mocks do Jest. */
function criarRepositoryFalso() {
  return {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    contarPorStatus: jest.fn(),
  };
}

module.exports = { tarefaExemplo, criarRepositoryFalso };
