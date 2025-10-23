import {
  db,
  collection, getDocs, addDoc, doc, getDoc
} from "./firebase.js";

let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;
let tempoRestante = 20;
let tempoTotal = 0;
let timer;

const playerName = localStorage.getItem("quizPlayer");

if (!playerName) {
  window.location.href = "index.html";
}

/* ----------------------------------------------
   Carrega perguntas e inicia quiz
---------------------------------------------- */
window.addEventListener("load", async () => {
  const perguntasSnapshot = await getDocs(collection(db, "perguntas"));
  perguntas = perguntasSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!perguntas.length) {
    alert("Nenhuma pergunta cadastrada.");
    window.location.href = "index.html";
    return;
  }

  // Verifica se o jogador já participou
  const rankingSnapshot = await getDocs(collection(db, "ranking"));
  const ranking = rankingSnapshot.docs.map(d => d.data());
  const jaJogou = ranking.some(r => r.nome.toLowerCase() === playerName.toLowerCase());

  if (jaJogou) {
    alert("Você já participou do quiz!");
    window.location.href = "index.html";
    return;
  }

  exibirPergunta();
});

/* ----------------------------------------------
   Exibe pergunta atual
---------------------------------------------- */
function exibirPergunta() {
  const pergunta = perguntas[perguntaAtual];

  document.body.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>Pergunta ${perguntaAtual + 1} de ${perguntas.length}</h2>
        <div id="timer">⏱️ ${tempoRestante}s</div>
      </div>
      <h3>${pergunta.texto}</h3>
      <div class="options">
        ${pergunta.alternativas
          .map((alt, i) => `<button class="option-btn" data-index="${i}">${alt}</button>`)
          .join("")}
      </div>
    </div>
  `;

  document.querySelectorAll(".option-btn").forEach(btn =>
    btn.addEventListener("click", e => verificarResposta(e))
  );

  iniciarCronometro();
}

/* ----------------------------------------------
   Cronômetro
---------------------------------------------- */
function iniciarCronometro() {
  timer = setInterval(() => {
    tempoRestante--;
    tempoTotal++;
    document.getElementById("timer").textContent = `⏱️ ${tempoRestante}s`;

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
  const indice = parseInt(e.target.dataset.index);
  const pergunta = perguntas[perguntaAtual];
  const botoes = document.querySelectorAll(".option-btn");

  botoes.forEach((btn, i) => {
    if (i === pergunta.correta) btn.classList.add("correta");
    else if (i === indice) btn.classList.add("errada");
    btn.disabled = true;
  });

  if (indice === pergunta.correta) pontuacao++;

  setTimeout(proximaPergunta, 1000);
}

/* ----------------------------------------------
   Próxima pergunta ou fim
---------------------------------------------- */
function proximaPergunta() {
  tempoRestante = 20;
  perguntaAtual++;
  if (perguntaAtual < perguntas.length) exibirPergunta();
  else finalizarQuiz();
}

/* ----------------------------------------------
   Finaliza quiz e salva no Firestore
---------------------------------------------- */
async function finalizarQuiz() {
  clearInterval(timer);

  await addDoc(collection(db, "ranking"), {
    nome: playerName,
    pontuacao,
    tempo: tempoTotal
  });

  document.body.innerHTML = `
    <div class="resultado-container">
      <h2>🎉 Parabéns, ${playerName}!</h2>
      <p>Você acertou <strong>${pontuacao}</strong> de ${perguntas.length} perguntas.</p>
      <p>Tempo total: <strong>${tempoTotal}</strong> segundos.</p>
      <button id="voltarBtn" class="start-btn">Voltar ao início</button>
    </div>
  `;

  document.getElementById("voltarBtn").addEventListener("click", () => {
    localStorage.removeItem("quizPlayer");
    window.location.href = "index.html";
  });
}
