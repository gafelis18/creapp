// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1rMQN-ujvfRZ5uiZIzLpj3G1ugY8jCGo",
  authDomain: "creapp-a7c8e.firebaseapp.com",
  projectId: "creapp-a7c8e",
  storageBucket: "creapp-a7c8e.appspot.com",
  messagingSenderId: "225843364342",
  appId: "1:225843364342:web:17b35614d0a7c89589c7d7",
  measurementId: "G-9X18N9QQ03",
  databaseURL: "https://creapp-a7c8e-default-rtdb.europe-west1.firebasedatabase.app"
};

// Inicializar la app
const app = initializeApp(firebaseConfig);

// Inicializar la base de datos
const db = getDatabase(app);

// Exportar funciones para usarlas en otros archivos
export { db, ref, push, onValue, update, remove };
