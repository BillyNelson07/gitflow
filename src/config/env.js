'use strict';

/**
 * Configurações da aplicação, lidas das variáveis de ambiente.
 * Dentro do docker compose, DB_HOST aponta para o nome do serviço ("db").
 */
const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tarefas_db',
  },
};

module.exports = config;
