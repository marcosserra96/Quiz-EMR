/* ----------------------------------------------
   Conexão com o Firebase - Quiz EMR
   ---------------------------------------------- */

// Importa módulos necessários (compatíveis com GitHub Pages via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get, remove, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/* ----------------------------------------------
   Configuração do Firebase
   ---------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyC2l8LU3vYfQjTly8JSa658mfIlVk2Dw8E",
  authDomain: "inovacao-emr.firebaseapp.com",
  projectId: "inovacao-emr",
  storageBucket: "inovacao-emr.firebasestorage.app",
  messagingSenderId: "1075399271811",
  appId: "1:1075399271811:web:f532f25547125d6a8f42b6",
  measurementId: "G-8CTLMNCZJN",
  databaseURL: "https://inovacao-emr-default-rtdb.firebaseio.com/"
};

/* ----------------------------------------------
   Inicialização
   ---------------------------------------------- */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ----------------------------------------------
   Exports para outros scripts
   ---------------------------------------------- */
export {
  db,
  ref,
  set,
  push,
  onValue,
  get,
  remove,
  update
};
