// Nosso "banco de dados" continua sendo uma lista vazia
let estoque = [];

// 1. Função para ADICIONAR um produto (agora pede o CÓDIGO)
function adicionarProduto(codigo, nome, quantidade) {
    // Procura se o produto já existe na lista buscando pelo CÓDIGO
    let produto = estoque.find(item => item.codigo === codigo);

    if (produto) {
        // Se o código já existir, apenas soma a nova quantidade
        produto.quantidade += quantidade;
        console.log(`Atualizado: Mais ${quantidade} unidade(s) adicionada(s) ao produto [${codigo}] ${produto.nome}.`);
    } else {
        // Se não existir, cria o produto com o código e coloca na lista
        estoque.push({ codigo: codigo, nome: nome, quantidade: quantidade });
        console.log(`Novo produto: [${codigo}] ${nome} adicionado com sucesso (${quantidade} unidades).`);
    }
}

// 2. Função para REMOVER (ou vender) um produto pelo CÓDIGO
function removerProduto(codigo, quantidade) {
    // Busca o produto pelo código
    let produto = estoque.find(item => item.codigo === codigo);

    if (produto) {
        if (produto.quantidade >= quantidade) {
            // Se tiver estoque suficiente, subtrai a quantidade
            produto.quantidade -= quantidade;
            console.log(`Saída: ${quantidade} unidade(s) do produto [${codigo}] ${produto.nome} removida(s).`);
        } else {
            console.log(`Erro: Estoque insuficiente para o produto [${codigo}] ${produto.nome}! Temos apenas ${produto.quantidade}.`);
        }
    } else {
        console.log(`Erro: Nenhum produto encontrado com o código ${codigo}.`);
    }
}

// 3. Função para LISTAR todos os produtos
function listarEstoque() {
    console.log("\n--- RELATÓRIO DE ESTOQUE ---");
    if (estoque.length === 0) {
        console.log("O estoque está vazio.");
    } else {
        // O console.table vai mostrar as colunas: index, codigo, nome, e quantidade
        console.table(estoque); 
    }
    console.log("----------------------------\n");
}

// ==========================================
// TESTANDO O CÓDIGO 
// ==========================================

// Adicionando produtos (Código, Nome, Quantidade)
adicionarProduto(101, "Caderno Universitário", 50);
adicionarProduto(102, "Caneta Azul", 100);
adicionarProduto(103, "Mochila Preta", 10);

// Tentando adicionar mais cadernos usando o mesmo código
adicionarProduto(101, "Caderno Universitário", 20); // Vai somar com os 50 anteriores

// Removendo produtos pelo código
removerProduto(102, 15); // Tira 15 canetas
removerProduto(999, 5);  // Vai dar erro (código não existe)

// Listando tudo no final
listarEstoque();