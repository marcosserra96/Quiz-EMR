import { db, collection, getDocs, addDoc, query, orderBy } from "./firebase.js";

const playerName = localStorage.getItem("quizPlayer");
if (!playerName) window.location.href = "index.html";

let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;
let tempoRestante = 20;
let timer;
let tempoTotal = 0;

async function carregarPerguntas() {
  const colRef = collection(db, "perguntas");
  const snapshot = await getDocs(colRef);
  perguntas = snapshot.docs.map(d => d.data());
  iniciarQuiz();
}

function iniciarQuiz() {
  exibirPergunta();
}

function exibirPergunta() {
  const p = perguntas[perguntaAtual];
  document.body.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>Pergunta ${perguntaAtual + 1} de ${perguntas.length}</h2>
        <div id="timer">⏱️ ${tempoRestante}s</div>
      </div>
      <h3 class="question">${p.texto}</h3>
      <div class="options">
        ${p.alternativas.map((alt, i) => `
          <button class="option-btn" data-index="${i}">${alt}</button>`).join("")}
      </div>
    </div>
  `;
  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", verificarResposta);
  });
  iniciarCronometro();
}

function iniciarCronometro() {
  timer = setInterval(() => {
    tempoRestante--;
    tempoTotal++;
    const t = document.getElementById("timer");
    if (t) t.textContent = `⏱️ ${tempoRestante}s`;
    if (tempoRestante <= 0) {
      clearInterval(timer);
      proximaPergunta();
    }
  }, 1000);
}

function verificarResposta(e) {
  clearInterval(timer);
  const index = parseInt(e.target.dataset.index);
  const p = perguntas[perguntaAtual];
  const botoes = document.querySelectorAll(".option-btn");
  botoes.forEach((btn, i) => {
    if (i === p.correta) btn.classList.add("correta");
    else if (i === index) btn.classList.add("errada");
    btn.disabled = true;
  });
  if (index === p.correta) pontuacao++;
  setTimeout(proximaPergunta, 1000);
}

function proximaPergunta() {
  tempoRestante = 20;
  perguntaAtual++;
  if (perguntaAtual < perguntas.length) exibirPergunta();
  else finalizarQuiz();
}

async function finalizarQuiz() {
  document.body.innerHTML = `
    <div class="resultado-container">
      <h2>🎉 Parabéns, ${playerName}!</h2>
      <p>Você acertou <strong>${pontuacao}</strong> de ${perguntas.length} perguntas.</p>
      <p>Tempo total: <strong>${tempoTotal}</strong> segundos</p>
      <button id="voltarBtn" class="start-btn">Voltar</button>
    </div>
  `;
  await addDoc(collection(db, "ranking"), {
    nome: playerName,
    pontuacao,
    tempo: tempoTotal
  });
  document.getElementById("voltarBtn").addEventListener("click", () => {
    localStorage.removeItem("quizPlayer");
    window.location.href = "index.html";
  });
}

carregarPerguntas();
