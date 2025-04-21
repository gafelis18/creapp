// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, push, get, child, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1rMQN-ujvfRZ5uiZIzLpj3G1ugY8jCGo",
  authDomain: "creapp-a7c8e.firebaseapp.com",
  projectId: "creapp-a7c8e",
  storageBucket: "creapp-a7c8e.firebasestorage.app",
  messagingSenderId: "225843364342",
  appId: "1:225843364342:web:17b35614d0a7c89589c7d7",
  measurementId: "G-9X18N9QQ03",
  databaseURL: "https://creapp-a7c8e-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, push, get, child, onValue, update, remove };
