import { db, ref, push, onValue, remove, update } from "./firebase-config.js";

const campoForm = document.getElementById("campoForm");
const listaCampos = document.getElementById("listaCampos");
const addParcelaBtn = document.getElementById("addParcela");
const listaParcelas = document.getElementById("listaParcelas");

let parcelasTemp = [];
let camposData = [];
let campoEditandoId = null;

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

// Mostrar parcelas añadidas
function actualizarListaParcelas() {
  if (!listaParcelas) return;
  listaParcelas.innerHTML = "";
  parcelasTemp.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
    listaParcelas.appendChild(li);
  });
}

// Guardar o actualizar campo
if (campoForm) {
  campoForm.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombreCampo").value;
    const provincia = document.getElementById("provincia").value;
    const municipio = document.getElementById("municipio").value;

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

    if (campoEditandoId) {
      update(ref(db, `campos/${campoEditandoId}`), campo)
        .then(() => alert("Campo actualizado correctamente."))
        .catch(err => alert("Error al actualizar: " + err.message));
    } else {
      push(ref(db, "campos/"), campo)
        .then(() => alert("Campo guardado correctamente."))
        .catch(err => alert("Error al guardar: " + err.message));
    }

    campoForm.reset();
    parcelasTemp = [];
    campoEditandoId = null;
    actualizarListaParcelas();
  });
}

// Cargar campos desde Firebase
function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val();
    if (!data) {
      listaCampos.innerHTML = "<li>No hay campos guardados todavía.</li>";
      return;
    }

    camposData = Object.entries(data).map(([id, campo]) => ({ id, ...campo }));
    localStorage.setItem("campos", JSON.stringify(camposData));
    renderizarCampos();
  });
}

// Mostrar campos guardados
function renderizarCampos() {
  listaCampos.innerHTML = "";
  camposData.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${c.nombre} (${c.provincia}, ${c.municipio}) - ${c.parcelas?.length || 0} parcelas
      <button onclick="editarCampo('${c.id}')">Editar</button>
      <button onclick="eliminarCampo('${c.id}')">Eliminar</button>
    `;
    listaCampos.appendChild(li);
  });
}

// Editar campo
window.editarCampo = function (id) {
  const campo = camposData.find(c => c.id === id);
  if (!campo) return;

  document.getElementById("nombreCampo").value = campo.nombre;
  document.getElementById("provincia").value = campo.provincia;
  document.getElementById("municipio").value = campo.municipio;
  parcelasTemp = campo.parcelas || [];
  actualizarListaParcelas();
  campoEditandoId = id;
  window.scrollTo(0, 0);
};

// Eliminar campo
window.eliminarCampo = function (id) {
  if (confirm("¿Eliminar este campo?")) {
    remove(ref(db, `campos/${id}`));
  }
};

// Iniciar
cargarCampos();
