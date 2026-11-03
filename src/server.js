'use strict';

const config = require('./config/env');
const { criarPool, aguardarBanco } = require('./config/database');
const TarefaRepository = require('./repositories/tarefa.repository');
const TarefaService = require('./services/tarefa.service');
const criarApp = require('./app');

async function iniciar() {
  const pool = criarPool(config.db);
  await aguardarBanco(pool);

  const tarefaRepository = new TarefaRepository(pool);
  await tarefaRepository.criarTabela();

  const tarefaService = new TarefaService(tarefaRepository);
  const app = criarApp({
    tarefaService,
    verificarBanco: () => pool.query('SELECT 1'),
  });

  const servidor = app.listen(config.port, () => {
    console.log(`Servidor rodando na porta ${config.port}`);
  });

  const encerrar = () => {
    console.log('Encerrando servidor...');
    servidor.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGTERM', encerrar);
  process.on('SIGINT', encerrar);
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a aplicação:', erro);
  process.exit(1);
});
