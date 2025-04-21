import { db, ref, push, onValue } from "./firebase-config.js";

const campoForm = document.getElementById("campoForm");
const listaCampos = document.getElementById("listaCampos");
const addParcelaBtn = document.getElementById("addParcela");
const listaParcelas = document.getElementById("listaParcelas");

let parcelasTemp = [];

// Añadir parcela al campo
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

// Mostrar parcelas añadidas
function actualizarListaParcelas() {
  listaParcelas.innerHTML = "";
  parcelasTemp.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
    listaParcelas.appendChild(li);
  });
}

// Guardar campo
campoForm.addEventListener("submit", e => {
  e.preventDefault();

  const nombre = document.getElementById("nombreCampo").value;
  const provincia = document.getElementById("provincia").value;
  const municipio = document.getElementById("municipio").value;

  const campo = {
    nombre,
    provincia,
    municipio,
    parcelas: parcelasTemp,
    timestamp: Date.now()
  };

  // Guardar en Firebase
  push(ref(db, "campos/"), campo);

  // Guardar en localStorage
  const locales = JSON.parse(localStorage.getItem("campos") || "[]");
  locales.push(campo);
  localStorage.setItem("campos", JSON.stringify(locales));

  campoForm.reset();
  parcelasTemp = [];
  actualizarListaParcelas();
  cargarCampos();
  alert("Campo guardado.");
});

// Mostrar campos en lista
function cargarCampos() {
  onValue(ref(db, "campos/"), snap => {
    const data = snap.val() || {};
    const campos = Object.values(data);
    localStorage.setItem("campos", JSON.stringify(campos));
    renderizarCampos(campos);
  });
}

// Mostrar lista
function renderizarCampos(campos) {
  if (!listaCampos) return;
  listaCampos.innerHTML = "";
  campos.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.provincia}, ${c.municipio}) - ${c.parcelas?.length || 0} parcela(s)`;
    listaCampos.appendChild(li);
  });
}

// Iniciar
cargarCampos();
