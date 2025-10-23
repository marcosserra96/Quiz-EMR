// ----------------------------------------------
// ui.js - Utilidades visuais: Toasts e Modais
// ----------------------------------------------

// 🔔 Toast de feedback
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);
  toast.textContent = message;

  const container = document.querySelector(".toast-container") || (() => {
    const c = document.createElement("div");
    c.classList.add("toast-container");
    document.body.appendChild(c);
    return c;
  })();

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ⚠️ Modal de confirmação estilizado
export function showConfirm(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("div");
  modal.classList.add("modal");

  modal.innerHTML = `
    <p>${message}</p>
    <div class="modal-buttons">
      <button id="confirmYes" class="btn-dark">Confirmar</button>
      <button id="confirmNo" class="btn-outline">Cancelar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById("confirmYes").addEventListener("click", () => {
    onConfirm(true);
    overlay.remove();
  });

  document.getElementById("confirmNo").addEventListener("click", () => {
    overlay.remove();
  });
}

// 🎨 Estilo básico aplicado globalmente
const style = document.createElement("style");
style.innerHTML = `
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  background: #0f172a;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-success { background: #059669; }
.toast-error { background: #b91c1c; }
.toast-info { background: #2563eb; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.modal {
  background: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  text-align: center;
  max-width: 300px;
  font-family: 'Poppins', sans-serif;
}

.modal p {
  margin-bottom: 20px;
  color: #0f172a;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}
`;
document.head.appendChild(style);
