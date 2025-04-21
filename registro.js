import { db, ref, push, onValue } from "./firebase-config.js";

// Referencias a campos
const campoProd = document.getElementById("campoProd");
const campoGasto = document.getElementById("campoGasto");
const tipoRegistro = document.getElementById("tipoRegistro");
const formProduccion = document.getElementById("formProduccion");
const formGasto = document.getElementById("formGasto");

// Cargar campos desde Firebase y localStorage
function cargarCampos() {
  const camposRef = ref(db, "campos/");
  onValue(camposRef, snapshot => {
    const data = snapshot.val() || {};
    const campos = Object.entries(data).map(([id, campo]) => ({ id, ...campo }));

    // Guardar en localStorage
    localStorage.setItem("campos", JSON.stringify(campos));

    // Cargar en selectores
    campoProd.innerHTML = "";
    campoGasto.innerHTML = "";
    campos.forEach(c => {
      const opt = new Option(c.nombre, c.id);
      campoProd.appendChild(opt.cloneNode(true));
      campoGasto.appendChild(opt.cloneNode(true));
    });
  });
}

// Evento para tipo de registro
if (tipoRegistro) {
  tipoRegistro.addEventListener("change", e => {
    if (e.target.value === "gasto") {
      formProduccion.style.display = "none";
      formGasto.style.display = "block";
    } else {
      formProduccion.style.display = "block";
      formGasto.style.display = "none";
    }
  });
}

// Guardar producción
document.getElementById("formProd").addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    campoId: campoProd.value,
    variedad: document.getElementById("variedad").value,
    kilos: parseFloat(document.getElementById("kilos").value),
    precio: parseFloat(document.getElementById("precio").value),
    fecha: document.getElementById("fechaProd").value,
    observaciones: document.getElementById("obsProd").value,
    timestamp: Date.now()
  };
  push(ref(db, "produccion/"), data);
  e.target.reset();
  alert("Producción guardada.");
});

// Guardar gasto
document.getElementById("formGastoForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    campoId: campoGasto.value,
    tipo: document.getElementById("tipoGasto").value,
    importe: parseFloat(document.getElementById("importeGasto").value),
    fecha: document.getElementById("fechaGasto").value,
    observaciones: document.getElementById("obsGasto").value,
    timestamp: Date.now()
  };
  push(ref(db, "gastos/"), data);
  e.target.reset();
  alert("Gasto guardado.");
});

// Iniciar
cargarCampos();
