// ----------------------------------------------
// Firebase Firestore - Compatível com GitHub Pages
// ----------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2l8LU3vYfQjTly8JSa658mfIlVk2Dw8E",
  authDomain: "inovacao-emr.firebaseapp.com",
  projectId: "inovacao-emr",
  storageBucket: "inovacao-emr.firebasestorage.app",
  messagingSenderId: "1075399271811",
  appId: "1:1075399271811:web:f532f25547125d6a8f42b6",
  measurementId: "G-8CTLMNCZJN"
};

// Inicializa app e banco
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta tudo que os outros módulos precisam
export {
  db,
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, onSnapshot
};
