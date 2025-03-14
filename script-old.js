const perguntaElement = document.getElementById('pergunta');
const opcoes = document.querySelectorAll('button');
const resultadoElement = document.getElementById('resultado');

let perguntas = [];
let pontuacao = 0;
let perguntaAtual = 0;
let dificuldadeSelecionada = 1; // Dificuldade padrão: 1

// Função para embaralhar um array (algoritmo Fisher-Yates)
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para carregar perguntas de um ficheiro JSON
async function carregarPerguntas() {
    try {
        const response = await fetch('./perguntas.json');
        const todasPerguntas = await response.json();

        // Filtra perguntas pela dificuldade selecionada
        perguntas = todasPerguntas.filter(pergunta => pergunta.dificuldade === dificuldadeSelecionada);
        perguntas = embaralharArray(perguntas);

        if (perguntas.length === 0) {
            resultadoElement.textContent = 'Não há perguntas para esta dificuldade.';
        } else {
            mostrarPergunta();
        }
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
    }
}

// Exibir a pergunta atual e as opções embaralhadas
function mostrarPergunta() {
    if (perguntaAtual >= perguntas.length) {
        resultadoElement.textContent = `Fim do jogo! A sua pontuação: ${pontuacao}`;
        return;
    }

    const pergunta = perguntas[perguntaAtual];
    const respostasEmbaralhadas = embaralharArray([...pergunta.respostas]);

    perguntaElement.textContent = pergunta.pergunta;
    opcoes.forEach((opcao, index) => {
        resultadoElement.textContent = '';
        opcao.textContent = respostasEmbaralhadas[index] || '';
        opcao.style.display = respostasEmbaralhadas[index] ? 'inline-block' : 'none';

        opcao.onclick = () => verificarResposta(opcao.textContent, pergunta.respostas[pergunta.correcta - 1], pergunta.dificuldade);
    });
}

// Verificar resposta e atualizar pontuação com base na dificuldade
function verificarResposta(respostaSelecionada, respostaCorrecta, dificuldade) {
    if (respostaSelecionada === respostaCorrecta) {
        resultadoElement.textContent = 'Parabéns, acertou!';
        pontuacao += dificuldade; // Pontuação baseada na dificuldade
    } else {
        resultadoElement.textContent = 'Que pena, errou!';
    }

    perguntaAtual++;
    setTimeout(mostrarPergunta, 1000);
}

// Função para alterar dificuldade e reiniciar o jogo
function alterarDificuldade(novaDificuldade) {
    dificuldadeSelecionada = novaDificuldade;
    pontuacao = 0;
    perguntaAtual = 0;
    carregarPerguntas();
}

// Inicia o jogo com a dificuldade padrão
carregarPerguntas();
