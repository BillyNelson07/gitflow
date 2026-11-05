'use strict';

const { erroValidacao, erroNaoEncontrado, erroConflito } = require('../errors/app-error');
const {
  STATUS,
  STATUS_VALIDOS,
  validarCriacao,
  validarAtualizacao,
  validarFiltros,
  converterId,
} = require('../models/tarefa.model');

/**
 * Service: regras de negócio. Valida entrada, aplica regras e
 * delega a persistência ao repository.
 */
class TarefaService {
  constructor(tarefaRepository) {
    this.repository = tarefaRepository;
  }

  async listar(query) {
    const { erros, filtros } = validarFiltros(query);
    if (erros.length) throw erroValidacao(erros);

    const { pagina, limite, ...demaisFiltros } = filtros;
    const { itens, total } = await this.repository.listar({
      ...demaisFiltros,
      limite,
      offset: (pagina - 1) * limite,
    });

    return {
      itens,
      paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async buscarPorId(idParam) {
    const id = this.#validarId(idParam);
    const tarefa = await this.repository.buscarPorId(id);
    if (!tarefa) throw erroNaoEncontrado(`Tarefa ${id} não encontrada.`);
    return tarefa;
  }

  async criar(corpo) {
    const { erros, dados } = validarCriacao(corpo);
    if (erros.length) throw erroValidacao(erros);
    return this.repository.criar(dados);
  }

  async atualizar(idParam, corpo) {
    const id = this.#validarId(idParam);
    const { erros, dados } = validarAtualizacao(corpo);
    if (erros.length) throw erroValidacao(erros);

    const atualizada = await this.repository.atualizar(id, dados);
    if (!atualizada) throw erroNaoEncontrado(`Tarefa ${id} não encontrada.`);
    return atualizada;
  }

  async concluir(idParam) {
    const tarefa = await this.buscarPorId(idParam);
    if (tarefa.status === STATUS.CONCLUIDA) {
      throw erroConflito(`Tarefa ${tarefa.id} já está marcada como concluída.`);
    }
    return this.repository.atualizar(tarefa.id, { status: STATUS.CONCLUIDA });
  }

  async remover(idParam) {
    const id = this.#validarId(idParam);
    const removida = await this.repository.remover(id);
    if (!removida) throw erroNaoEncontrado(`Tarefa ${id} não encontrada.`);
  }

  /** Retorna a quantidade de tarefas por status (incluindo status zerados) e o total geral. */
  async estatisticas() {
    const contagens = await this.repository.contarPorStatus();
    const porStatus = Object.fromEntries(STATUS_VALIDOS.map((status) => [status, 0]));
    contagens.forEach(({ status, quantidade }) => {
      porStatus[status] = quantidade;
    });
    const total = Object.values(porStatus).reduce((soma, qtd) => soma + qtd, 0);
    return { total, porStatus };
  }

  #validarId(idParam) {
    const id = converterId(idParam);
    if (id === null) throw erroValidacao(['id deve ser um inteiro positivo.']);
    return id;
  }
}

module.exports = TarefaService;
