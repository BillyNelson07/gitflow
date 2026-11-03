# Imagem oficial do Node.js (versão LTS leve)
FROM node:20-alpine

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copia só os arquivos de dependências primeiro (aproveita o cache de camadas)
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

# Copia o código da aplicação (o que não é necessário fica fora via .dockerignore)
COPY src ./src

# Roda como usuário sem privilégios
USER node

# Porta em que a API escuta
EXPOSE 3000

CMD ["npm", "start"]
