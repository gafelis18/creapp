import { db, ref, push, onValue } from "./firebase-config.js";

const tipoRegistro = document.getElementById("tipoRegistro");
const formProduccion = document.getElementById("formProduccion");
const formGasto = document.getElementById("formGasto");
const campoProd = document.getElementById("campoProd");
const campoGasto = document.getElementById("campoGasto");

if (tipoRegistro) {
  tipoRegistro.addEventListener("change", () => {
    const tipo = tipoRegistro.value;
    formProduccion.style.display = tipo === "produccion" ? "block" : "none";
    formGasto.style.display = tipo === "gasto" ? "block" : "none";
  });
}

function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    const data = snapshot.val();
    if (!data) return;

    campoProd.innerHTML = "";
    campoGasto.innerHTML = "";

    Object.entries(data).forEach(([id, campo]) => {
      const opt1 = document.createElement("option");
      const opt2 = document.createElement("option");
      opt1.value = id;
      opt1.textContent = campo.nombre;
      opt2.value = id;
      opt2.textContent = campo.nombre;
      campoProd.appendChild(opt1);
      campoGasto.appendChild(opt2);
    });
  });
}

if (formProduccion) {
  formProduccion.addEventListener("submit", e => {
    e.preventDefault();
    const campana = document.getElementById("campana").value;

    const produccion = {
      campoId: campoProd.value,
      variedad: document.getElementById("variedad").value,
      kilos: parseFloat(document.getElementById("kilos").value),
      cajas: parseFloat(document.getElementById("cajas").value),
      precio: parseFloat(document.getElementById("precio").value),
      observaciones: document.getElementById("obsProd").value,
      fecha: document.getElementById("fechaProd").value,
      campana: campana,
      timestamp: Date.now()
    };

    push(ref(db, "produccion/"), produccion).then(() => {
      alert("Producción guardada.");
      formProduccion.reset();
    }).catch(err => {
      alert("Error al guardar producción: " + err.message);
    });
  });
}

if (formGasto) {
  formGasto.addEventListener("submit", e => {
    e.preventDefault();
    const campana = document.getElementById("campana").value;

    const gasto = {
      campoId: campoGasto.value,
      tipo: document.getElementById("tipoGasto").value,
      importe: parseFloat(document.getElementById("importeGasto").value),
      observaciones: document.getElementById("obsGasto").value,
      fecha: document.getElementById("fechaGasto").value,
      campana: campana,
      timestamp: Date.now()
    };

    push(ref(db, "gastos/"), gasto).then(() => {
      alert("Gasto guardado.");
      formGasto.reset();
    }).catch(err => {
      alert("Error al guardar gasto: " + err.message);
    });
  });
}

cargarCampos();
