import { db, ref, push, onValue, remove, update } from "./firebase-config.js";

const campoForm = document.getElementById("campoForm");
const listaCampos = document.getElementById("listaCampos");
const listaParcelas = document.getElementById("listaParcelas");
const addParcelaBtn = document.getElementById("addParcela");

let parcelas = [];

// Añadir parcela al array temporal
if (addParcelaBtn) {
  addParcelaBtn.addEventListener("click", () => {
    const poligono = document.getElementById("poligono").value.trim();
    const parcela = document.getElementById("parcela").value.trim();

    if (poligono && parcela) {
      parcelas.push({ poligono, parcela });
      renderParcelas();
      document.getElementById("poligono").value = "";
      document.getElementById("parcela").value = "";
    }
  });
}

// Mostrar parcelas en lista
function renderParcelas() {
  listaParcelas.innerHTML = "";
  parcelas.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
    listaParcelas.appendChild(li);
  });
}

// Guardar nuevo campo
if (campoForm) {
  campoForm.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("nombreCampo").value.trim();
    const provincia = document.getElementById("provincia").value.trim();
    const municipio = document.getElementById("municipio").value.trim();

    if (!nombre || !provincia || !municipio || parcelas.length === 0) {
      alert("Completa todos los campos y añade al menos una parcela.");
      return;
    }

    const nuevoCampo = {
      nombre,
      provincia,
      municipio,
      parcelas
    };

    push(ref(db, "campos/"), nuevoCampo).then(() => {
      campoForm.reset();
      parcelas = [];
      renderParcelas();
      cargarCampos();
    });
  });
}

// Mostrar campos guardados con botones
function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val();
    listaCampos.innerHTML = "";
    if (!data) return;

    Object.entries(data).forEach(([id, campo]) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${campo.nombre}</strong> (${campo.provincia}, ${campo.municipio})<br />
        <button onclick="editarCampo('${id}')">Editar</button>
        <button onclick="eliminarCampo('${id}')">Eliminar</button>
      `;
      listaCampos.appendChild(li);
    });
  });
}

window.eliminarCampo = function(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este campo?")) {
    remove(ref(db, `campos/${id}`));
  }
};

window.editarCampo = function(id) {
  onValue(ref(db, `campos/${id}`), snapshot => {
    const campo = snapshot.val();
    if (!campo) return;

    document.getElementById("nombreCampo").value = campo.nombre;
    document.getElementById("provincia").value = campo.provincia;
    document.getElementById("municipio").value = campo.municipio;
    parcelas = campo.parcelas || [];
    renderParcelas();

    campoForm.onsubmit = function(e) {
      e.preventDefault();

      const nuevo = {
        nombre: document.getElementById("nombreCampo").value.trim(),
        provincia: document.getElementById("provincia").value.trim(),
        municipio: document.getElementById("municipio").value.trim(),
        parcelas
      };

      update(ref(db, `campos/${id}`), nuevo).then(() => {
        campoForm.reset();
        parcelas = [];
        renderParcelas();
        campoForm.onsubmit = null;
        window.location.reload();
      });
    };
  }, { onlyOnce: true });
};

cargarCampos();
