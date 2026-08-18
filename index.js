// Nosso "banco de dados" será um array (lista) vazio
let estoque = [];

// 1. Função para ADICIONAR um produto
function adicionarProduto(nome, quantidade) {
    // Procura se o produto já existe na lista
    let produto = estoque.find(item => item.nome === nome);

    if (produto) {
        // Se existir, apenas soma a nova quantidade
        produto.quantidade += quantidade;
        console.log(`Atualizado: Foram adicionados mais ${quantidade} ${nome}(s).`);
    } else {
        // Se não existir, cria um novo produto e coloca na lista
        estoque.push({ nome: nome, quantidade: quantidade });
        console.log(`Novo produto: ${quantidade} ${nome}(s) adicionado(s) com sucesso.`);
    }
}

// 2. Função para REMOVER (ou vender) um produto
function removerProduto(nome, quantidade) {
    let produto = estoque.find(item => item.nome === nome);

    if (produto) {
        if (produto.quantidade >= quantidade) {
            // Se tiver estoque suficiente, subtrai a quantidade
            produto.quantidade -= quantidade;
            console.log(`Saída: ${quantidade} ${nome}(s) removido(s).`);
        } else {
            console.log(`Erro: Não há ${nome} suficiente no estoque! Temos apenas ${produto.quantidade}.`);
        }
    } else {
        console.log(`Erro: O produto "${nome}" não foi encontrado no estoque.`);
    }
}

// 3. Função para LISTAR todos os produtos
function listarEstoque() {
    console.log("--- RELATÓRIO DE ESTOQUE ---");
    if (estoque.length === 0) {
        console.log("O estoque está vazio.");
    } else {
        // O console.table cria uma tabelinha bonita no console do navegador
        console.table(estoque); 
    }
    console.log("----------------------------");
}

// ==========================================
// TESTANDO O CÓDIGO (Simulação de uso)
// ==========================================

adicionarProduto("Caderno", 50);
adicionarProduto("Caneta Azul", 100);
adicionarProduto("Caderno", 20); // Vai somar com os 50 anteriores

removerProduto("Caneta Azul", 10);
removerProduto("Borracha", 5);   // Vai dar erro (não existe)

listarEstoque();