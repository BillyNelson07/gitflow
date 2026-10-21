# Usar a imagem oficial do Node.js (versão leve)
FROM node:18-alpine

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copiar os arquivos de dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que a API vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
