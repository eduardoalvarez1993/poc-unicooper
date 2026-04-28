import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBK00nmw76j2RbMGVJ5Oy7OWbO3RuzVIbE",
  authDomain: "unicooper---poc.firebaseapp.com",
  projectId: "unicooper---poc",
  storageBucket: "unicooper---poc.firebasestorage.app",
  messagingSenderId: "226878785058",
  appId: "1:226878785058:web:2d1f577e0bf27f0b26ac7b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
};
