# API de Tarefas — Atividade 2 (Docker Compose)

API REST em Node.js/Express com **arquitetura em camadas** e banco **PostgreSQL**,
orquestrados com **Docker Compose**.

## Estrutura

```
src/
├── server.js                  # ponto de entrada: conecta no banco e sobe o servidor
├── app.js                     # monta o Express (sem abrir porta -> fácil de testar)
├── config/                    # variáveis de ambiente e pool do PostgreSQL
├── routes/                    # camada HTTP: recebe a requisição e chama o service
├── services/                  # regras de negócio
├── repositories/              # acesso ao banco (SQL)
├── models/                    # schema da tabela, constantes e validações
├── middlewares/               # tratamento de erros e 404
└── errors/                    # AppError (erros com status HTTP)
tests/                         # testes unitários e de rotas (Jest + Supertest)
tests/integration/             # testes com PostgreSQL real
```

Fluxo de uma requisição: `routes -> services -> repositories -> PostgreSQL`

## Como rodar (Docker Compose)

Pré-requisito: Docker Desktop (ou Docker + Compose) instalado.

```bash
docker compose up --build
```

Isso sobe dois containers na mesma rede (`rede-app`):

| Serviço | Container          | Porta na sua máquina | Observação                                   |
|---------|--------------------|----------------------|----------------------------------------------|
| `db`    | `tarefas-postgres` | 5432                 | PostgreSQL 16, dados no volume `pgdata`      |
| `api`   | `tarefas-api`      | 3000                 | só inicia depois que o `db` estiver saudável |

A API acessa o banco pelo hostname **`db`** (nome do serviço), e não por `localhost`.

Se já existir um Postgres na sua máquina usando a 5432, rode com outra porta:

```bash
DB_HOST_PORT=5433 docker compose up --build
```

Para parar: `docker compose down` (mantém os dados) ou `docker compose down -v` (apaga os dados).

## Endpoints

| Método | Rota                    | Descrição                                                                       |
|--------|-------------------------|---------------------------------------------------------------------------------|
| GET    | `/`                     | mensagem da API                                                                 |
| GET    | `/health`               | status da API e da conexão com o banco                                          |
| GET    | `/tarefas`              | lista com filtros `status`, `prioridade`, `busca` e paginação `pagina`, `limite` |
| GET    | `/tarefas/estatisticas` | total de tarefas e contagem por status                                          |
| GET    | `/tarefas/:id`          | busca uma tarefa                                                                |
| POST   | `/tarefas`              | cria tarefa                                                                     |
| PUT    | `/tarefas/:id`          | atualiza (parcial) uma tarefa                                                   |
| PATCH  | `/tarefas/:id/concluir` | marca como concluída (409 se já concluída)                                      |
| DELETE | `/tarefas/:id`          | remove tarefa                                                                   |

Valores aceitos: `status` = `pendente | em_andamento | concluida`, `prioridade` = `baixa | media | alta`.

### Exemplos

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Apresentar para o professor","prioridade":"alta"}'

curl "http://localhost:3000/tarefas?status=pendente&busca=professor"
curl -X PATCH http://localhost:3000/tarefas/1/concluir
curl http://localhost:3000/tarefas/estatisticas
```

## Mostrando a comunicação entre os containers

```bash
docker compose ps                                  # os dois containers rodando (db "healthy")
docker compose logs api                            # "Conexão com o PostgreSQL estabelecida."
docker exec -it tarefas-postgres psql -U postgres -d tarefas_db -c "SELECT * FROM tarefas;"
```

Cadastre uma tarefa pela API e depois consulte a tabela direto no Postgres: o dado que
entrou pelo container `api` aparece no container `db`.

## Testes

```bash
npm install
npm test                  # unitários + rotas (não precisam de banco)
npm run test:integration  # com PostgreSQL real (ex.: docker compose up -d db)
```

Os testes de integração usam `DB_HOST=localhost` por padrão e as mesmas credenciais do compose.
