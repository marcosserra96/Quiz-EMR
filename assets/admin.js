import {
  db,
  collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, onSnapshot
} from "./firebase.js";

const senhaDoc = doc(db, "config", "geral");
const perguntasCol = collection(db, "perguntas");
const rankingCol = collection(db, "ranking");

/* ELEMENTOS */
const loginContainer = document.getElementById("loginContainer");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const adminPasswordInput = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");

const quizTitleInput = document.getElementById("quizTitleInput");
const timeInput = document.getElementById("timeInput");
const color1Input = document.getElementById("color1");
const color2Input = document.getElementById("color2");
const saveConfigBtn = document.getElementById("saveConfigBtn");

const newQuestionText = document.getElementById("newQuestionText");
const correctIndexInput = document.getElementById("correctIndex");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const newOptionsContainer = document.getElementById("newOptionsContainer");
const questionsList = document.getElementById("questionsList");

const rankingContainer = document.getElementById("rankingContainer");
const clearRankingBtn = document.getElementById("clearRankingBtn");

const newPasswordInput = document.getElementById("newPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");

/* LOGIN */
loginBtn.addEventListener("click", async () => {
  const senhaDigitada = adminPasswordInput.value.trim();
  if (!senhaDigitada) return;

  const snapshot = await getDoc(senhaDoc);
  let dados = snapshot.exists() ? snapshot.data() : {};
  let senhaAtual = dados.senhaAdmin || "emr2025";

  if (!dados.senhaAdmin) {
    await setDoc(senhaDoc, { senhaAdmin: "emr2025" }, { merge: true });
  }

  if (senhaDigitada === senhaAtual) {
    localStorage.setItem("adminLogado", "true");
    loginContainer.style.display = "none";
    adminPanel.style.display = "block";
    carregarTudo();
  } else {
    loginMessage.textContent = "Senha incorreta.";
  }
});

if (localStorage.getItem("adminLogado") === "true") {
  loginContainer.style.display = "none";
  adminPanel.style.display = "block";
  carregarTudo();
}

/* CARREGAR */
async function carregarTudo() {
  const snapshot = await getDoc(senhaDoc);
  if (snapshot.exists()) {
    const cfg = snapshot.data();
    quizTitleInput.value = cfg.quizTitle || "Quiz EMR";
    timeInput.value = cfg.timePerQuestion || 20;
    color1Input.value = cfg.color1 || "#0284c7";
    color2Input.value = cfg.color2 || "#06b6d4";
  }

  carregarPerguntas();
  carregarRanking();
}

/* SALVAR CONFIG */
saveConfigBtn.addEventListener("click", async () => {
  await updateDoc(senhaDoc, {
    quizTitle: quizTitleInput.value.trim(),
    timePerQuestion: parseInt(timeInput.value),
    color1: color1Input.value,
    color2: color2Input.value
  });
  alert("Configurações salvas!");
});

/* PERGUNTAS */
async function carregarPerguntas() {
  const snapshot = await getDocs(perguntasCol);
  questionsList.innerHTML = "";
  snapshot.forEach(docItem => {
    const p = docItem.data();
    const div = document.createElement("div");
    div.classList.add("pergunta-card");
    div.innerHTML = `
      <strong>${p.texto}</strong>
      <ul>${p.alternativas.map((a, i) => `<li>${i} - ${a}</li>`).join("")}</ul>
      <p>Correta: ${p.correta}</p>
      <button data-id="${docItem.id}" class="start-btn" style="background:#b91c1c;">Excluir</button>
    `;
    div.querySelector("button").addEventListener("click", async () => {
      if (confirm("Excluir esta pergunta?")) {
        await deleteDoc(doc(db, "perguntas", docItem.id));
        carregarPerguntas();
      }
    });
    questionsList.appendChild(div);
  });
}

addQuestionBtn.addEventListener("click", async () => {
  const texto = newQuestionText.value.trim();
  const alternativas = Array.from(document.querySelectorAll(".optionInput")).map(i => i.value.trim()).filter(v => v);
  const correta = parseInt(correctIndexInput.value);

  if (!texto || alternativas.length < 2) {
    alert("Preencha a pergunta e ao menos duas alternativas.");
    return;
  }

  await addDoc(perguntasCol, { texto, alternativas, correta });
  alert("Pergunta adicionada!");
  carregarPerguntas();
});

/* RANKING */
function carregarRanking() {
  onSnapshot(rankingCol, snapshot => {
    let html = `
      <table class="ranking-table-admin">
        <tr><th>Nome</th><th>Pontuação</th><th>Tempo</th></tr>
    `;
    snapshot.forEach(doc => {
      const r = doc.data();
      html += `<tr><td>${r.nome}</td><td>${r.pontuacao}</td><td>${r.tempo}</td></tr>`;
    });
    html += "</table>";
    rankingContainer.innerHTML = html;
  });
}

clearRankingBtn.addEventListener("click", async () => {
  if (confirm("Deseja limpar o ranking?")) {
    const snapshot = await getDocs(rankingCol);
    snapshot.forEach(d => deleteDoc(d.ref));
    alert("Ranking limpo!");
  }
});

/* ALTERAR SENHA */
changePasswordBtn.addEventListener("click", async () => {
  const nova = newPasswordInput.value.trim();
  if (!nova) {
    alert("Digite uma nova senha.");
    return;
  }
  await updateDoc(senhaDoc, { senhaAdmin: nova });
  newPasswordInput.value = "";
  alert("Senha alterada com sucesso!");
});
