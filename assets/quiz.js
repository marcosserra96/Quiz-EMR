/* ----------------------------------------------
   Lógica principal do Quiz EMR
---------------------------------------------- */

import { db, ref, get, set, push, onValue } from "./firebase.js";

let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;
let tempoRestante = 20;
let timer;
let tempoTotal = 0;

const playerName = localStorage.getItem("quizPlayer");
const rankingRef = ref(db, "ranking");
const perguntasRef = ref(db, "perguntas");
const configRef = ref(db, "config");

// Se não tiver nome, volta para o início
if (!playerName) {
  window.location.href = "index.html";
}

/* ----------------------------------------------
   Inicialização
---------------------------------------------- */
window.addEventListener("load", async () => {
  await carregarPerguntas();
  verificarDuplicidade();
});

/* ----------------------------------------------
   Carrega perguntas do Firebase
---------------------------------------------- */
async function carregarPerguntas() {
  try {
    const snapshot = await get(perguntasRef);
    if (snapshot.exists()) {
      perguntas = Object.values(snapshot.val());
      iniciarQuiz();
    } else {
      alert("Nenhuma pergunta cadastrada no momento.");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Erro ao carregar perguntas:", error);
  }
}

/* ----------------------------------------------
   Verifica se o jogador já participou
---------------------------------------------- */
async function verificarDuplicidade() {
  try {
    const snapshot = await get(rankingRef);
    if (snapshot.exists()) {
      const ranking = Object.values(snapshot.val());
      const jaJogou = ranking.some(r => r.nome.toLowerCase() === playerName.toLowerCase());
      if (jaJogou) {
        alert("Você já participou do quiz!");
        window.location.href = "index.html";
      }
    }
  } catch (error) {
    console.error("Erro ao verificar duplicidade:", error);
  }
}

/* ----------------------------------------------
   Inicia o quiz
---------------------------------------------- */
function iniciarQuiz() {
  exibirPergunta();
}

/* ----------------------------------------------
   Exibe pergunta atual
---------------------------------------------- */
function exibirPergunta() {
  const quizContainer = document.createElement("div");
  quizContainer.classList.add("quiz-container");

  const pergunta = perguntas[perguntaAtual];
  quizContainer.innerHTML = `
    <div class="quiz-header">
      <h2>Pergunta ${perguntaAtual + 1} de ${perguntas.length}</h2>
      <div id="timer" class="timer">⏱️ ${tempoRestante}s</div>
    </div>
    <h3 class="question">${pergunta.texto}</h3>
    <div class="options">
      ${pergunta.alternativas
        .map(
          (alt, i) => `
          <button class="option-btn" data-index="${i}">
            ${alt}
          </button>`
        )
        .join("")}
    </div>
  `;

  document.body.innerHTML = "";
  document.body.appendChild(quizContainer);

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", e => verificarResposta(e));
  });

  iniciarCronometro();
}

/* ----------------------------------------------
   Controle do tempo
---------------------------------------------- */
function iniciarCronometro() {
  timer = setInterval(() => {
    tempoRestante--;
    tempoTotal++;
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = `⏱️ ${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(timer);
      proximaPergunta();
    }
  }, 1000);
}

/* ----------------------------------------------
   Verifica resposta
---------------------------------------------- */
function verificarResposta(e) {
  clearInterval(timer);
  const indiceSelecionado = parseInt(e.target.dataset.index);
  const pergunta = perguntas[perguntaAtual];
  const botoes = document.querySelectorAll(".option-btn");

  botoes.forEach((btn, i) => {
    if (i === pergunta.correta) {
      btn.classList.add("correta");
    } else if (i === indiceSelecionado) {
      btn.classList.add("errada");
    }
    btn.disabled = true;
  });

  if (indiceSelecionado === pergunta.correta) pontuacao++;

  setTimeout(proximaPergunta, 1200);
}

/* ----------------------------------------------
   Próxima pergunta ou fim
---------------------------------------------- */
function proximaPergunta() {
  tempoRestante = 20;
  perguntaAtual++;
  if (perguntaAtual < perguntas.length) {
    exibirPergunta();
  } else {
    finalizarQuiz();
  }
}

/* ----------------------------------------------
   Finaliza o quiz
---------------------------------------------- */
async function finalizarQuiz() {
  clearInterval(timer);
  const resultado = {
    nome: playerName,
    pontuacao: pontuacao,
    tempo: tempoTotal
  };

  await push(rankingRef, resultado);

  document.body.innerHTML = `
    <div class="resultado-container">
      <h2>🎉 Parabéns, ${playerName}!</h2>
      <p>Você acertou <strong>${pontuacao}</strong> de ${perguntas.length} perguntas.</p>
      <p>Seu tempo total foi de <strong>${tempoTotal}</strong> segundos.</p>
      <button id="voltarBtn" class="start-btn">Voltar ao início</button>
    </div>
  `;

  document.getElementById("voltarBtn").addEventListener("click", () => {
    localStorage.removeItem("quizPlayer");
    window.location.href = "index.html";
  });
}
