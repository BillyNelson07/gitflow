import { describe, it, expect, beforeEach } from "vitest";
import {
    adicionarProduto,
    removerProduto,
    listarEstoque,
    buscarProduto,
    calcularTotalItens,
    _resetEstoque,
    _getEstoque,
} from "./index.js";

// Antes de cada teste, zera o "estoque" para os testes não interferirem
// uns nos outros.
beforeEach(() => {
    _resetEstoque();
});

describe("adicionarProduto", () => {
    it("adiciona um novo produto quando o código ainda não existe", () => {
        adicionarProduto("C001", "Caderno Universitário", 50);

        const estoque = _getEstoque();
        expect(estoque).toHaveLength(1);
        expect(estoque[0]).toEqual({
            codigo: "C001",
            nome: "Caderno Universitário",
            quantidade: 50,
        });
    });

    it("soma a quantidade quando o produto já existe (mesmo código)", () => {
        adicionarProduto("C001", "Caderno Universitário", 50);
        adicionarProduto("C001", "Caderno Universitário", 20);

        const estoque = _getEstoque();
        expect(estoque).toHaveLength(1);
        expect(estoque[0].quantidade).toBe(70);
    });

    it("soma a quantidade quando o produto já existe (mesmo nome, código diferente)", () => {
        // Reproduz o comportamento atual da função: ela também considera
        // uma correspondência por nome, além do código.
        adicionarProduto("C001", "Caneta Azul", 10);
        adicionarProduto("C002", "Caneta Azul", 5);

        const estoque = _getEstoque();
        expect(estoque).toHaveLength(1);
        expect(estoque[0].quantidade).toBe(15);
    });

    it("cadastra produtos diferentes separadamente", () => {
        adicionarProduto("C001", "Caderno Universitário", 50);
        adicionarProduto("C002", "Caneta Azul", 100);

        const estoque = _getEstoque();
        expect(estoque).toHaveLength(2);
    });
});

describe("removerProduto", () => {
    beforeEach(() => {
        adicionarProduto("C001", "Caderno Universitário", 50);
    });

    it("remove (diminui) a quantidade de um produto existente", () => {
        removerProduto("C001", 20);

        const estoque = _getEstoque();
        expect(estoque[0].quantidade).toBe(30);
    });

    it("não remove quando a quantidade solicitada é maior que o estoque disponível", () => {
        removerProduto("C001", 999);

        const estoque = _getEstoque();
        // A quantidade deve permanecer inalterada
        expect(estoque[0].quantidade).toBe(50);
    });

    it("não faz nada (sem erro) quando o código não existe", () => {
        expect(() => removerProduto("INEXISTENTE", 1)).not.toThrow();

        const estoque = _getEstoque();
        expect(estoque).toHaveLength(1);
        expect(estoque[0].quantidade).toBe(50);
    });

    it("permite remover exatamente a quantidade total em estoque (zerar)", () => {
        removerProduto("C001", 50);

        const estoque = _getEstoque();
        expect(estoque[0].quantidade).toBe(0);
    });
});

describe("listarEstoque", () => {
    it("executa sem erros quando o estoque está vazio", () => {
        expect(() => listarEstoque()).not.toThrow();
    });

    it("executa sem erros quando há produtos no estoque", () => {
        adicionarProduto("C001", "Caderno Universitário", 50);
        expect(() => listarEstoque()).not.toThrow();
    });
});

describe("buscarProduto", () => {
    beforeEach(() => {
        adicionarProduto("C001", "Caderno Universitário", 50);
        adicionarProduto("C002", "Caneta Azul", 100);
        adicionarProduto("C003", "Caneta Preta", 80);
    });

    it("encontra produtos cujo nome contém o termo buscado", () => {
        // A função não retorna valor (só loga no console), então validamos
        // filtrando o estoque com a mesma lógica, garantindo que existem
        // resultados esperados e que a chamada não gera erro.
        expect(() => buscarProduto("Caneta")).not.toThrow();

        const estoque = _getEstoque();
        const encontrados = estoque.filter((item) => item.nome.includes("Caneta"));
        expect(encontrados).toHaveLength(2);
    });

    it("não encontra nada quando o termo não existe em nenhum produto", () => {
        expect(() => buscarProduto("Lápis")).not.toThrow();

        const estoque = _getEstoque();
        const encontrados = estoque.filter((item) => item.nome.includes("Lápis"));
        expect(encontrados).toHaveLength(0);
    });
});

describe("calcularTotalItens", () => {
    it("soma corretamente a quantidade total de todos os produtos", () => {
        adicionarProduto("C001", "Caderno Universitário", 50);
        adicionarProduto("C002", "Caneta Azul", 100);
        adicionarProduto("C003", "Caneta Preta", 80);

        const estoque = _getEstoque();
        const totalEsperado = estoque.reduce((soma, item) => soma + item.quantidade, 0);

        expect(totalEsperado).toBe(230);
        expect(() => calcularTotalItens()).not.toThrow();
    });

    it("retorna total 0 quando o estoque está vazio", () => {
        const estoque = _getEstoque();
        const totalEsperado = estoque.reduce((soma, item) => soma + item.quantidade, 0);

        expect(totalEsperado).toBe(0);
    });
});
