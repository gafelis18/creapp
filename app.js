import { db, ref, push, onValue } from "./firebase-config.js";

const campoForm = document.getElementById("campoForm");
const listaCampos = document.getElementById("listaCampos");
const addParcelaBtn = document.getElementById("addParcela");
const listaParcelas = document.getElementById("listaParcelas");

let parcelasTemp = [];
let campos = [];

// Añadir parcela temporalmente
if (addParcelaBtn) {
  addParcelaBtn.addEventListener("click", () => {
    const poligono = document.getElementById("poligono").value.trim();
    const parcela = document.getElementById("parcela").value.trim();

    if (poligono && parcela) {
      parcelasTemp.push({ poligono, parcela });
      actualizarListaParcelas();
      document.getElementById("poligono").value = "";
      document.getElementById("parcela").value = "";
    }
  });
}

// Mostrar lista de parcelas
function actualizarListaParcelas() {
  listaParcelas.innerHTML = "";
  parcelasTemp.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
    listaParcelas.appendChild(li);
  });
}

// Guardar campo en Firebase
if (campoForm) {
  campoForm.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombreCampo").value.trim();
    const provincia = document.getElementById("provincia").value.trim();
    const municipio = document.getElementById("municipio").value.trim();

    if (!nombre || !provincia || !municipio) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const campo = {
      nombre,
      provincia,
      municipio,
      parcelas: parcelasTemp,
      timestamp: Date.now()
    };

    push(ref(db, "campos/"), campo)
      .then(() => {
        alert("Campo guardado correctamente.");
        campoForm.reset();
        parcelasTemp = [];
        actualizarListaParcelas();
      })
      .catch(err => {
        console.error("Error al guardar:", err);
        alert("Error al guardar el campo.");
      });
  });
}

// Cargar campos desde Firebase
function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val() || {};
    campos = Object.entries(data).map(([id, campo]) => ({ id, ...campo }));
    localStorage.setItem("campos", JSON.stringify(campos));
    mostrarCampos();
  });
}

// Mostrar en lista de campos
function mostrarCampos() {
  if (!listaCampos) return;
  listaCampos.innerHTML = "";
  campos.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.provincia}, ${c.municipio}) - ${c.parcelas?.length || 0} parcelas`;
    listaCampos.appendChild(li);
  });
}

// Iniciar carga
cargarCampos();
