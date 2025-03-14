const perguntaElement = document.getElementById('pergunta');
const opcoes = document.querySelectorAll('button');
const resultadoElement = document.getElementById('resultado');
const timerElement = document.getElementById('timer'); // Adicione um elemento no HTML para exibir o timer
const container = document.getElementById("jokerContainer");
const numPergunta = document.getElementById("numPergunta");

let valores = ["0 €", "200 €", "500 €", "1000 €", "3000 €", "10000 €", "50000 €"].reverse(); 
let perguntas = [];
let pontuacao = 0;
let perguntaAtual = 0;
let tempoRestante = 60; // Tempo inicial para cada pergunta
let timerInterval;
let indicePremio = 1;
let count = 1; // Variável global para contar perguntas respondidas
let dificuldade = 1;

// Função para embaralhar um array (algoritmo Fisher-Yates)
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca elementos
    }
    return array;
}

// Função para carregar perguntas de um ficheiro JSON
async function carregarPerguntas() {
    try {
        const response = await fetch('./perguntas.json');
        perguntas = await response.json();

        // Exemplo de filtro: só carregar perguntas de dificuldade 2
        //perguntas = perguntas.filter(p => p.dificuldade === dificuldade); 

        mostrarPergunta();
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
    }
}

// Função para iniciar o timer
function iniciarTimer() {
    clearInterval(timerInterval); // Limpa qualquer timer anterior
    tempoRestante = 60; // Reinicia o tempo
    timerElement.textContent = `Tempo restante: ${tempoRestante}s`;

    timerInterval = setInterval(() => {
        tempoRestante--;
        timerElement.textContent = `Tempo restante: ${tempoRestante}s`;

        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            resultadoElement.textContent = 'Tempo esgotado!';
            perguntaAtual++;
            removerJokers();
            setTimeout(mostrarPergunta, 3000); // Aguarda 1 segundo antes de passar para a próxima
        }
    }, 1000);
}

// Exibir a pergunta atual e as opções embaralhadas
function mostrarPergunta() {
    const pergunta = perguntas[perguntaAtual];
    const respostasEmbaralhadas = embaralharArray([...pergunta.respostas]); // Copia e embaralha as respostas

    perguntaElement.textContent = pergunta.pergunta;
    opcoes.forEach((opcao, index) => {
        resultadoElement.textContent = '';
        opcao.textContent = respostasEmbaralhadas[index] || ''; // Garante que não exceda o número de respostas
        opcao.style.display = respostasEmbaralhadas[index] ? 'inline-block' : 'none'; // Oculta botões extras

        opcao.onclick = () => verificarResposta(opcao.textContent, pergunta.respostas[pergunta.correcta - 1]);
    });

    iniciarTimer(); // Inicia o timer para a nova pergunta
}

function verificarResposta(respostaSelecionada, respostaCorrecta) {
    clearInterval(timerInterval); // Para o timer ao selecionar uma resposta
    if (count < 13) { // Verifica se ainda pode jogar
        numPergunta.textContent = `Pergunta número: ${count + 1}`;
        console.log(count);
        
        if (respostaSelecionada === respostaCorrecta) {
            resultadoElement.textContent = 'Parabéns, acertou!';
            pontuacao++;

            // Destaca o prêmio correspondente ao número de acertos
            if (indicePremio < valores.length) {
                destacarPremio(valores[valores.length - 1 - indicePremio], "#96723c");
                indicePremio++; // Atualiza para o próximo prêmio
                dificuldade++;
                console.log(dificuldade)
            }
        } else {
            resultadoElement.textContent = 'Que pena, errou!';
            removerJokers();
        }

        perguntaAtual++;
        count++; // Incrementa o número de perguntas respondidas

        if (count < 13) {
            setTimeout(mostrarPergunta, 3000); // Aguarda 3 segundos antes de mostrar a próxima pergunta
        } else {
            resultadoElement.textContent = 'Jogo terminou!';
            numPergunta.textContent = `Pergunta número: ${count}`;
        }
    }
}

// Inicia o jogo ao carregar as perguntas
carregarPerguntas();

// Criar 9 divs "Joker"
function criarJokers() {
    container.innerHTML = ''; // Limpa os jokers anteriores
    for (let i = 0; i < 9; i++) {
        const div = document.createElement("div");
        div.className = "joker";
        div.textContent = "Joker";
        container.appendChild(div);
    }
}

// Remover 3 jokers quando errar
function removerJokers() {
    let jokers = container.children;
    let quantidadeParaRemover = Math.min(3, jokers.length); // Remove no máximo 3 Jokers disponíveis
    // Se não houver mais jokers, reverter o prêmio

    for (let i = 0; i < quantidadeParaRemover; i++) {
        setTimeout(() => {
            if (jokers.length > 0) {
                let joker = jokers[jokers.length - 1]; // Pega o último elemento

                joker.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
                joker.style.opacity = "0";
                joker.style.transform = "scale(0)"; // Efeito de encolhimento

                setTimeout(() => {
                    if (container.contains(joker)) {
                        container.removeChild(joker);
                    }

                 }, 500); // Remove após a animação (0.5s)
            }
        }, i * 600); // Remove um por vez com um atraso de 600ms entre cada um
    }
    if (container.children.length === 0) {
        if (indicePremio > 1) {
            destacarPremio(valores[valores.length - indicePremio], "#064c87");
            indicePremio--; // Só decrementa depois de destacar corretamente
        }
    }
}

// Inicializa os Jokers
criarJokers();

function criarPremios() {
    const premioContainer = document.getElementById("premio");
    premioContainer.innerHTML = ''; // Limpa caso já exista conteúdo
    
    valores.forEach(valor => {
        const div = document.createElement("div");
        div.textContent = valor;
        div.style.padding = "10px";
        div.style.textAlign = "center";

        // Adiciona uma classe para referência futura
        div.classList.add("premio-item");

        // Define cores padrão
        if (valor.trim() === "0") {
            div.style.backgroundColor = "#96723c"; // Cor marrom para o prêmio 0
            div.style.color = "white";
        } else {
            div.style.backgroundColor = "#064c87"; // Cor padrão azul
            div.style.color = "white";
        }

        premioContainer.appendChild(div);
    });
}

// Função para alterar a cor do fundo de um prêmio específico
function destacarPremio(valor, cor) {
    const premios = document.querySelectorAll("#premio .premio-item");
    
    premios.forEach(div => {
        if (div.textContent.trim() === valor) {
            div.style.backgroundColor = cor;
            div.style.transition = "background-color 0.5s ease"; // Animação suave
        }
    });
}

// Criar os prêmios ao carregar a página
criarPremios();

// Exemplo de uso: Destacar o prêmio "1000 €" em verde quando o jogador acertar
// chamar essa função quando o jogador acertar uma pergunta:
destacarPremio(valores[6], "#96723c");
