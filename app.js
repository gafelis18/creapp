import { db, ref, push, onValue } from "./firebase-config.js";

const campoForm = document.getElementById("campoForm");
const listaCampos = document.getElementById("listaCampos");
const addParcelaBtn = document.getElementById("addParcela");
const listaParcelas = document.getElementById("listaParcelas");

let parcelasTemp = [];

// Añadir parcela
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

// Mostrar lista de parcelas añadidas
function actualizarListaParcelas() {
  if (listaParcelas) {
    listaParcelas.innerHTML = "";
    parcelasTemp.forEach((p, i) => {
      const li = document.createElement("li");
      li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
      listaParcelas.appendChild(li);
    });
  }
}

// Guardar campo en Firebase
if (campoForm) {
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

    push(ref(db, "campos/"), campo)
      .then(() => {
        alert("Campo guardado.");
        campoForm.reset();
        parcelasTemp = [];
        actualizarListaParcelas();
      })
      .catch(err => {
        console.error("Error al guardar en Firebase:", err);
        alert("Error al guardar el campo.");
      });
  });
}

// Cargar y mostrar campos desde Firebase
function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const campos = Object.entries(data).map(([id, campo]) => ({
      id,
      ...campo
    }));

    // Guardar en localStorage también
    localStorage.setItem("campos", JSON.stringify(campos));

    // Mostrar en pantalla
    renderizarCampos(campos);
  });
}

// Mostrar campos en lista
function renderizarCampos(campos) {
  if (!listaCampos) return;
  listaCampos.innerHTML = "";
  campos.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.provincia}, ${c.municipio}) - ${c.parcelas?.length || 0} parcelas`;
    listaCampos.appendChild(li);
  });
}

// Iniciar
cargarCampos();
