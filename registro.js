import { db, ref, push, onValue } from "./firebase-config.js";

const tipoRegistro = document.getElementById("tipoRegistro");
const formProduccion = document.getElementById("formProduccion");
const formGasto = document.getElementById("formGasto");
const campoProd = document.getElementById("campoProd");
const campoGasto = document.getElementById("campoGasto");

// Función para mostrar popup
function mostrarPopup(mensaje, color = "#4CAF50") {
  const popup = document.getElementById("popupMensaje");
  if (!popup) return;
  popup.textContent = mensaje;
  popup.style.backgroundColor = color;
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Alternar formularios
if (tipoRegistro) {
  tipoRegistro.addEventListener("change", () => {
    const tipo = tipoRegistro.value;
    formProduccion.style.display = tipo === "produccion" ? "block" : "none";
    formGasto.style.display = tipo === "gasto" ? "block" : "none";
  });
}

// Cargar campos
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

// Validar campos requeridos
function camposVacios(campos) {
  return campos.some(valor => valor === "" || valor === null || valor === undefined);
}

// Guardar Producción
if (formProduccion) {
  formProduccion.addEventListener("submit", e => {
    e.preventDefault();

    const variedad = document.getElementById("variedad").value.trim();
    const kilos = parseFloat(document.getElementById("kilos").value);
    const precio = parseFloat(document.getElementById("precio").value);
    const observaciones = document.getElementById("obsProd").value;
    const fecha = document.getElementById("fechaProd").value;

    if (camposVacios([campoProd.value, variedad, kilos, precio, fecha])) {
      mostrarPopup("Completa todos los campos requeridos", "#e53935");
      return;
    }

    const produccion = {
      campoId: campoProd.value,
      variedad,
      kilos,
      precio,
      observaciones,
      fecha,
      timestamp: Date.now()
    };

    push(ref(db, "produccion/"), produccion)
      .then(() => {
        mostrarPopup("Producción guardada correctamente");
        formProduccion.reset();
      })
      .catch(err => {
        mostrarPopup("Error al guardar producción", "#e53935");
        console.error(err);
      });
  });
}

// Guardar Gasto
if (formGasto) {
  formGasto.addEventListener("submit", e => {
    e.preventDefault();

    const tipo = document.getElementById("tipoGasto").value.trim();
    const importe = parseFloat(document.getElementById("importeGasto").value);
    const observaciones = document.getElementById("obsGasto").value;
    const fecha = document.getElementById("fechaGasto").value;

    if (camposVacios([campoGasto.value, tipo, importe, fecha])) {
      mostrarPopup("Completa todos los campos requeridos", "#e53935");
      return;
    }

    const gasto = {
      campoId: campoGasto.value,
      tipo,
      importe,
      observaciones,
      fecha,
      timestamp: Date.now()
    };

    push(ref(db, "gastos/"), gasto)
      .then(() => {
        mostrarPopup("Gasto guardado correctamente");
        formGasto.reset();
      })
      .catch(err => {
        mostrarPopup("Error al guardar gasto", "#e53935");
        console.error(err);
      });
  });
}

// Iniciar
cargarCampos();
