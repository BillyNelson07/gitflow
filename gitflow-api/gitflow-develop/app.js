const express = require("express");

// "Banco de dados" em memória (mesma ideia do index.js)
let estoque = [];

const app = express();
app.use(express.json());

// Health check (usado pela action e pelo Docker)
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Listar produtos (opcional: ?busca=termo)
app.get("/produtos", (req, res) => {
    const { busca } = req.query;
    const lista = busca
        ? estoque.filter((p) => p.nome.toLowerCase().includes(String(busca).toLowerCase()))
        : estoque;
    res.json(lista);
});

// Buscar um produto pelo código
app.get("/produtos/:codigo", (req, res) => {
    const produto = estoque.find((p) => p.codigo === req.params.codigo);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json(produto);
});

// Adicionar produto (se já existir, soma a quantidade)
app.post("/produtos", (req, res) => {
    const { codigo, nome, quantidade } = req.body || {};

    if (!codigo || !nome || !Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({
            erro: "Informe codigo, nome e quantidade (inteiro maior que 0).",
        });
    }

    const existente = estoque.find((p) => p.codigo === codigo || p.nome === nome);
    if (existente) {
        existente.quantidade += quantidade;
        return res.status(200).json(existente);
    }

    const novo = { codigo, nome, quantidade };
    estoque.push(novo);
    res.status(201).json(novo);
});

// Registrar saída (venda) de um produto
app.post("/produtos/:codigo/saida", (req, res) => {
    const { quantidade } = req.body || {};
    const produto = estoque.find((p) => p.codigo === req.params.codigo);

    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({ erro: "Informe quantidade (inteiro maior que 0)." });
    }
    if (produto.quantidade < quantidade) {
        return res.status(409).json({
            erro: `Estoque insuficiente. Temos apenas ${produto.quantidade}.`,
        });
    }

    produto.quantidade -= quantidade;
    res.json(produto);
});

// Total de itens no estoque
app.get("/estoque/total", (req, res) => {
    const total = estoque.reduce((soma, p) => soma + p.quantidade, 0);
    res.json({ total });
});

// Usado apenas nos testes
app._resetEstoque = () => {
    estoque.length = 0;
};

module.exports = app;
