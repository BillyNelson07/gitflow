'use strict';

const { Pool } = require('pg');

/** Cria o pool de conexões com o PostgreSQL. */
function criarPool(dbConfig) {
  return new Pool(dbConfig);
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tenta conectar ao banco algumas vezes antes de desistir.
 * Útil quando a API sobe antes de o Postgres terminar de inicializar.
 */
async function aguardarBanco(pool, { tentativas = 10, intervaloMs = 2000 } = {}) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('Conexão com o PostgreSQL estabelecida.');
      return;
    } catch (erro) {
      console.log(`Aguardando o PostgreSQL (${tentativa}/${tentativas}): ${erro.message}`);
      if (tentativa === tentativas) throw erro;
      await esperar(intervaloMs);
    }
  }
}

module.exports = { criarPool, aguardarBanco };
