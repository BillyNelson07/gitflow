// Nosso "banco de dados" será um array (lista) vazio
let estoque = [];

// 1. Função para ADICIONAR um produto (agora exigindo o código)
function adicionarProduto(codigo, nome, quantidade) {
    // Procura se o produto já existe na lista pelo código ou pelo nome
    let produto = estoque.find(item => item.codigo === codigo || item.nome === nome);

    if (produto) {
        // Se existir, apenas soma a nova quantidade
        produto.quantidade += quantidade;
        console.log(`Atualizado: Foram adicionados mais ${quantidade} ${nome}(s) (Código: ${codigo}).`);
    } else {
        // Se não existir, cria um novo produto com código, nome e quantidade
        estoque.push({ codigo: codigo, nome: nome, quantidade: quantidade });
        console.log(`Novo produto: ${quantidade} ${nome}(s) adicionado(s) com sucesso (Código: ${codigo}).`);
    }
}

// 2. Função para REMOVER (ou vender) um produto pelo código
function removerProduto(codigo, quantidade) {
    let produto = estoque.find(item => item.codigo === codigo);

    if (produto) {
        if (produto.quantidade >= quantidade) {
            // Se tiver estoque suficiente, subtrai a quantidade
            produto.quantidade -= quantidade;
            console.log(`Saída: ${quantidade} ${produto.nome}(s) removido(s).`);
        } else {
            console.log(`Erro: Não há ${produto.nome} suficiente no estoque! Temos apenas ${produto.quantidade}.`);
        }
    } else {
        console.log(`Erro: O produto com código "${codigo}" não foi encontrado no estoque.`);
    }
}

// 3. Função para LISTAR todos os produtos
function listarEstoque() {
    console.log("--- RELATÓRIO DE ESTOQUE ---");
    if (estoque.length === 0) {
        console.log("O estoque está vazio.");
    } else {
        // O console.table cria uma tabela bonita no console
        console.table(estoque); 
    }
    console.log("----------------------------");
}

// ==========================================
// TESTANDO O CÓDIGO (Simulação de uso)
// ==========================================

adicionarProduto("C001", "Caderno", 50);
adicionarProduto("C002", "Caneta Azul", 100);
adicionarProduto("C001", "Caderno", 20); // Vai somar com os 50 anteriores usando o mesmo código

removerProduto("C002", 10);
removerProduto("C999", 5);   // Vai dar erro (código não existe)

listarEstoque();