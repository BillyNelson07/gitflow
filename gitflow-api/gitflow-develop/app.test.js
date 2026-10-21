import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "./app.js";

beforeEach(() => {
    app._resetEstoque();
});

describe("API de estoque", () => {
    it("GET /health responde ok", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });

    it("POST /produtos cria um produto", async () => {
        const res = await request(app)
            .post("/produtos")
            .send({ codigo: "C001", nome: "Caderno", quantidade: 50 });
        expect(res.status).toBe(201);
        expect(res.body.quantidade).toBe(50);
    });

    it("POST /produtos soma a quantidade se o produto já existe", async () => {
        await request(app).post("/produtos").send({ codigo: "C001", nome: "Caderno", quantidade: 50 });
        const res = await request(app)
            .post("/produtos")
            .send({ codigo: "C001", nome: "Caderno", quantidade: 20 });
        expect(res.status).toBe(200);
        expect(res.body.quantidade).toBe(70);
    });

    it("POST /produtos valida o corpo da requisição", async () => {
        const res = await request(app).post("/produtos").send({ nome: "Sem código" });
        expect(res.status).toBe(400);
    });

    it("GET /produtos/:codigo retorna 404 quando não existe", async () => {
        const res = await request(app).get("/produtos/XXX");
        expect(res.status).toBe(404);
    });

    it("POST /produtos/:codigo/saida diminui a quantidade", async () => {
        await request(app).post("/produtos").send({ codigo: "C001", nome: "Caderno", quantidade: 50 });
        const res = await request(app).post("/produtos/C001/saida").send({ quantidade: 20 });
        expect(res.status).toBe(200);
        expect(res.body.quantidade).toBe(30);
    });

    it("POST /produtos/:codigo/saida recusa saída maior que o estoque", async () => {
        await request(app).post("/produtos").send({ codigo: "C001", nome: "Caderno", quantidade: 5 });
        const res = await request(app).post("/produtos/C001/saida").send({ quantidade: 99 });
        expect(res.status).toBe(409);
    });

    it("GET /estoque/total soma todos os itens", async () => {
        await request(app).post("/produtos").send({ codigo: "C001", nome: "Caderno", quantidade: 50 });
        await request(app).post("/produtos").send({ codigo: "C002", nome: "Caneta", quantidade: 100 });
        const res = await request(app).get("/estoque/total");
        expect(res.body.total).toBe(150);
    });

    it("GET /produtos?busca= filtra pelo nome", async () => {
        await request(app).post("/produtos").send({ codigo: "C001", nome: "Caderno", quantidade: 50 });
        await request(app).post("/produtos").send({ codigo: "C002", nome: "Caneta Azul", quantidade: 10 });
        const res = await request(app).get("/produtos?busca=caneta");
        expect(res.body).toHaveLength(1);
    });
});
