// Nosso "banco de dados" será um array (lista) vazio
let estoque = [];

// 1. Função para ADICIONAR um produto (agora exigindo o código)
function adicionarProduto(codigo, nome, quantidade) {
    let produto = estoque.find(item => item.codigo === codigo || item.nome === nome);

    if (produto) {
        produto.quantidade += quantidade;
        console.log(`Atualizado: Foram adicionados mais ${quantidade} ${nome}(s) (Código: ${codigo}).`);
    } else {
        estoque.push({ codigo: codigo, nome: nome, quantidade: quantidade });
        console.log(`Novo produto: ${quantidade} ${nome}(s) adicionado(s) com sucesso (Código: ${codigo}).`);
    }
}

// 2. Função para REMOVER (ou vender) um produto pelo código
function removerProduto(codigo, quantidade) {
    let produto = estoque.find(item => item.codigo === codigo);

    if (produto) {
        if (produto.quantidade >= quantidade) {
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
        console.table(estoque); 
    }
    console.log("----------------------------");
}

// 4. Função para buscar produtos por parte do nome (Já corrigida)
function buscarProduto(termoBusca) {
    console.log(`--- BUSCA POR: "${termoBusca}" ---`); 
    let resultado = estoque.filter(item => item.nome.includes(termoBusca));

    if (resultado.length > 0) {
        console.log("Produtos encontrados:", resultado);
    } else {
        console.log("Nenhum produto encontrado com esse termo.");
    }
    console.log("----------------------------------");
}

// ==========================================
// 🆕 NOVA FUNCIONALIDADE COM BUG PROPOSITAL
// ==========================================

// 5. Função para somar a quantidade total de itens no estoque
function calcularTotalItens() {
    let total = 0;

    for (let i = 0; i < estoque.length; i++) {
        total += estoque[i].quantidade; 
    }

    console.log(`--- TOTAL DE ITENS NO ESTOQUE ---`);
    console.log(`Total geral: ${total}`);
    console.log(`---------------------------------`);
}

// ==========================================
// TESTANDO O CÓDIGO (Simulação de uso)
// ==========================================

adicionarProduto("C001", "Caderno Universitário", 50);
adicionarProduto("C002", "Caneta Azul", 100);
adicionarProduto("C003", "Caneta Preta", 80);

calcularTotalItens();
listarEstoque();