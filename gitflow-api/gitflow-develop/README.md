# gitflow

API simples de controle de estoque (Node.js + Express), publicada no Docker Hub via GitHub Actions.

## Rodando localmente

```bash
npm install
npm start          # http://localhost:3000
npm test
```

## Docker

```bash
docker build -t senai-gitflow-project .
docker run -p 3000:3000 senai-gitflow-project
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |
| GET | `/produtos` | Lista produtos (`?busca=termo`) |
| GET | `/produtos/:codigo` | Busca um produto |
| POST | `/produtos` | Adiciona `{codigo, nome, quantidade}` (soma se já existir) |
| POST | `/produtos/:codigo/saida` | Remove `{quantidade}` do estoque |
| GET | `/estoque/total` | Total de itens |

## Publicação no Docker Hub

Crie os secrets no repositório (Settings → Secrets and variables → Actions):

- `DOCKERHUB_USERNAME`: seu usuário do Docker Hub
- `DOCKERHUB_TOKEN`: access token (Docker Hub → Account Settings → Security)

A cada push na `main`, a imagem é publicada como `USUARIO/senai-gitflow-project:latest`.
