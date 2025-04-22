import { db, ref, push, onValue } from "./firebase-config.js";

// Elementos del DOM
const campoProd = document.getElementById("campoProd");
const campoGasto = document.getElementById("campoGasto");
const tipoRegistro = document.getElementById("tipoRegistro");
const formProduccion = document.getElementById("formProduccion");
const formGasto = document.getElementById("formGasto");

// Mostrar u ocultar formularios
if (tipoRegistro) {
  tipoRegistro.addEventListener("change", () => {
    if (tipoRegistro.value === "produccion") {
      formProduccion.style.display = "block";
      formGasto.style.display = "none";
    } else {
      formProduccion.style.display = "none";
      formGasto.style.display = "block";
    }
  });
}

// Cargar campos desde Firebase
function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val() || {};
    campoProd.innerHTML = "";
    campoGasto.innerHTML = "";

    Object.entries(data).forEach(([id, campo]) => {
      const option1 = document.createElement("option");
      option1.value = id;
      option1.textContent = campo.nombre;
      campoProd.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = id;
      option2.textContent = campo.nombre;
      campoGasto.appendChild(option2);
    });
  });
}

// Guardar Producción
if (formProduccion) {
  formProduccion.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      campoId: campoProd.value,
      variedad: document.getElementById("variedad").value,
      kilos: parseFloat(document.getElementById("kilos").value),
      precio: parseFloat(document.getElementById("precio").value),
      observaciones: document.getElementById("obsProd").value,
      fecha: document.getElementById("fechaProd").value,
      timestamp: Date.now()
    };

    push(ref(db, "produccion/"), data)
      .then(() => {
        alert("Producción guardada.");
        formProduccion.reset();
      })
      .catch(err => alert("Error al guardar producción: " + err.message));
  });
}

// Guardar Gasto
if (formGasto) {
  formGasto.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      campoId: campoGasto.value,
      tipo: document.getElementById("tipoGasto").value,
      importe: parseFloat(document.getElementById("importeGasto").value),
      observaciones: document.getElementById("obsGasto").value,
      fecha: document.getElementById("fechaGasto").value,
      timestamp: Date.now()
    };

    push(ref(db, "gastos/"), data)
      .then(() => {
        alert("Gasto guardado.");
        formGasto.reset();
      })
      .catch(err => alert("Error al guardar gasto: " + err.message));
  });
}

// Iniciar
cargarCampos();
