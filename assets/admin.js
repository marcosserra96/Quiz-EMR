/* ----------------------------------------------
   Lógica do Painel de Administração - Quiz EMR
---------------------------------------------- */
import { db, ref, set, get, push, remove, onValue, update } from "./firebase.js";

/* ----------------------------------------------
   Referências do Firebase
---------------------------------------------- */
const senhaRef = ref(db, "config/senhaAdmin");
const configRef = ref(db, "config");
const perguntasRef = ref(db, "perguntas");
const rankingRef = ref(db, "ranking");

/* ----------------------------------------------
   Elementos da página
---------------------------------------------- */
const loginContainer = document.getElementById("loginContainer");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const adminPasswordInput = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");

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

/* ----------------------------------------------
   Login do painel (corrigido)
---------------------------------------------- */
loginBtn.addEventListener("click", async () => {
  const senhaDigitada = adminPasswordInput.value.trim();
  if (!senhaDigitada) return;

  try {
    const snapshot = await get(senhaRef);
    // Garante que sempre exista uma senha inicial
    let senhaAtual = "emr2025";
    if (snapshot.exists() && snapshot.val()) {
      senhaAtual = snapshot.val();
    } else {
      await set(senhaRef, "emr2025"); // cria a senha padrão
    }

    if (senhaDigitada === senhaAtual) {
      localStorage.setItem("adminLogado", "true");
      loginContainer.style.display = "none";
      adminPanel.style.display = "block";
      carregarTudo();
    } else {
      loginMessage.textContent = "Senha incorreta.";
    }
  } catch (error) {
    console.error("Erro ao verificar senha:", error);
    loginMessage.textContent = "Erro ao conectar com o Firebase.";
  }
});

/* Se já estiver logado */
if (localStorage.getItem("adminLogado") === "true") {
  loginContainer.style.display = "none";
  adminPanel.style.display = "block";
  carregarTudo();
}

/* ----------------------------------------------
   Logout
---------------------------------------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminLogado");
  location.reload();
});

/* ----------------------------------------------
   Carrega tudo após login
---------------------------------------------- */
async function carregarTudo() {
  carregarConfiguracoes();
  carregarPerguntas();
  carregarRanking();
}

/* ----------------------------------------------
   Configurações do Quiz
---------------------------------------------- */
async function carregarConfiguracoes() {
  const snapshot = await get(configRef);
  if (snapshot.exists()) {
    const cfg = snapshot.val();
    quizTitleInput.value = cfg.quizTitle || "Quiz EMR";
    timeInput.value = cfg.timePerQuestion || 20;
    color1Input.value = cfg.color1 || "#3b82f6";
    color2Input.value = cfg.color2 || "#ec4899";
  }
}

saveConfigBtn.addEventListener("click", async () => {
  const configData = {
    quizTitle: quizTitleInput.value.trim() || "Quiz EMR",
    timePerQuestion: parseInt(timeInput.value) || 20,
    color1: color1Input.value,
    color2: color2Input.value
  };
  await update(configRef, configData);
  alert("Configurações salvas com sucesso!");
});

/* ----------------------------------------------
   Perguntas
---------------------------------------------- */
async function carregarPerguntas() {
  const snapshot = await get(perguntasRef);
  questionsList.innerHTML = "";
  if (snapshot.exists()) {
    const perguntas = snapshot.val();
    Object.keys(perguntas).forEach((id) => {
      const p = perguntas[id];
      const div = document.createElement("div");
      div.classList.add("pergunta-item");
      div.innerHTML = `
        <div class="pergunta-card">
          <strong>${p.texto}</strong>
          <ul>${p.alternativas.map((a, i) => `<li>${i} - ${a}</li>`).join("")}</ul>
          <p><em>Correta: ${p.correta}</em></p>
          <button class="start-btn excluir-pergunta" data-id="${id}" style="background:#b91c1c;">Excluir</button>
        </div>
      `;
      questionsList.appendChild(div);
    });

    document.querySelectorAll(".excluir-pergunta").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Excluir esta pergunta?")) {
          await remove(ref(db, "perguntas/" + id));
          carregarPerguntas();
        }
      });
    });
  } else {
    questionsList.innerHTML = "<p>Nenhuma pergunta cadastrada ainda.</p>";
  }
}

/* Adicionar nova pergunta */
addQuestionBtn.addEventListener("click", async () => {
  const texto = newQuestionText.value.trim();
  const alternativas = Array.from(document.querySelectorAll(".optionInput")).map(i => i.value.trim()).filter(v => v);
  const correta = parseInt(correctIndexInput.value);

  if (!texto || alternativas.length < 2) {
    alert("Preencha o texto e pelo menos duas alternativas.");
    return;
  }

  await push(perguntasRef, { texto, alternativas, correta });
  newQuestionText.value = "";
  document.querySelectorAll(".optionInput").forEach(i => i.value = "");
  correctIndexInput.value = 0;
  alert("Pergunta adicionada!");
  carregarPerguntas();
});

/* ----------------------------------------------
   Ranking
---------------------------------------------- */
function carregarRanking() {
  onValue(rankingRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ranking = Object.values(data)
        .sort((a, b) => b.pontuacao - a.pontuacao || a.tempo - b.tempo);
      let html = `
        <table class="ranking-table-admin">
          <tr><th>Nome</th><th>Pontuação</th><th>Tempo (s)</th></tr>
          ${ranking.map(r => `<tr><td>${r.nome}</td><td>${r.pontuacao}</td><td>${r.tempo}</td></tr>`).join("")}
        </table>
      `;
      rankingContainer.innerHTML = html;
    } else {
      rankingContainer.innerHTML = "<p>Nenhum participante ainda.</p>";
    }
  });
}

/* Limpar ranking */
clearRankingBtn.addEventListener("click", async () => {
  if (confirm("Tem certeza que deseja limpar o ranking?")) {
    await remove(rankingRef);
    alert("Ranking limpo com sucesso!");
  }
});

/* ----------------------------------------------
   Alterar senha do painel
---------------------------------------------- */
changePasswordBtn.addEventListener("click", async () => {
  const novaSenha = newPasswordInput.value.trim();
  if (!novaSenha) {
    alert("Digite uma nova senha.");
    return;
  }
  await set(senhaRef, novaSenha);
  newPasswordInput.value = "";
  alert("Senha alterada com sucesso!");
});
