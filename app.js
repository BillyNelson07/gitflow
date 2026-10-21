const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'API simples rodando perfeitamente!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
