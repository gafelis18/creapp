import { db, ref, onValue } from "./firebase-config.js";

// Elementos
const resumen = document.getElementById("resumenCampos");
const graficoProduccion = document.getElementById("graficoProduccion").getContext("2d");
const graficoBeneficio = document.getElementById("graficoBeneficio").getContext("2d");

// Variables de datos
let campos = {};
let produccion = [];
let gastos = [];

// Cargar todos los datos
function cargarDatos() {
  onValue(ref(db, "campos/"), snap => {
    campos = snap.val() || {};
    mostrarResumen();
  });

  onValue(ref(db, "produccion/"), snap => {
    produccion = Object.values(snap.val() || {});
    mostrarResumen();
  });

  onValue(ref(db, "gastos/"), snap => {
    gastos = Object.values(snap.val() || {});
    mostrarResumen();
  });
}

// Mostrar resumen
function mostrarResumen() {
  if (!resumen) return;

  resumen.innerHTML = "";
  const labels = [];
  const datosProduccion = [];
  const datosBeneficio = [];

  Object.entries(campos).forEach(([id, campo]) => {
    const prodCampo = produccion.filter(p => p.campoId === id);
    const gastosCampo = gastos.filter(g => g.campoId === id);

    const totalKilos = prodCampo.reduce((sum, p) => sum + (p.kilos || 0), 0);
    const ingresos = prodCampo.reduce((sum, p) => sum + (p.kilos * p.precio || 0), 0);
    const gastosTotal = gastosCampo.reduce((sum, g) => sum + (g.importe || 0), 0);
    const beneficio = ingresos - gastosTotal;

    resumen.innerHTML += `
      <div style="margin-bottom:20px">
        <h3>${campo.nombre}</h3>
        <p><strong>Kilos:</strong> ${totalKilos.toFixed(2)}</p>
        <p><strong>Ingresos:</strong> ${ingresos.toFixed(2)} €</p>
        <p><strong>Gastos:</strong> ${gastosTotal.toFixed(2)} €</p>
        <p><strong>Beneficio:</strong> ${beneficio.toFixed(2)} €</p>
      </div>
    `;

    labels.push(campo.nombre);
    datosProduccion.push(totalKilos);
    datosBeneficio.push(beneficio);
  });

  // Crear gráficos
  new Chart(graficoProduccion, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Kilos recolectados",
        data: datosProduccion
      }]
    }
  });

  new Chart(graficoBeneficio, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Beneficio (€)",
        data: datosBeneficio
      }]
    }
  });
}

// Exportar funciones (si las tienes conectadas a botones)
window.exportarExcel = function () {
  alert("Función exportarExcel aún no implementada.");
};

window.exportarPDF = function () {
  alert("Función exportarPDF aún no implementada.");
};

// Iniciar
cargarDatos();
