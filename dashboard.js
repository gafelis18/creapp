import { db, ref, onValue } from "./firebase-config.js";

const resumen = document.getElementById("resumenCampos");
const graficoProduccion = document.getElementById("graficoProduccion").getContext("2d");
const graficoBeneficio = document.getElementById("graficoBeneficio").getContext("2d");

let campos = {};
let produccion = [];
let gastos = [];

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

// EXPORTAR EXCEL
window.exportarExcel = function () {
  const resumenData = [];
  Object.entries(campos).forEach(([id, campo]) => {
    const prodCampo = produccion.filter(p => p.campoId === id);
    const gastosCampo = gastos.filter(g => g.campoId === id);
    const totalKilos = prodCampo.reduce((sum, p) => sum + (p.kilos || 0), 0);
    const ingresos = prodCampo.reduce((sum, p) => sum + (p.kilos * p.precio || 0), 0);
    const gastosTotal = gastosCampo.reduce((sum, g) => sum + (g.importe || 0), 0);
    const beneficio = ingresos - gastosTotal;

    resumenData.push({
      Campo: campo.nombre,
      Provincia: campo.provincia,
      Municipio: campo.municipio,
      Kilos: totalKilos,
      Ingresos: ingresos.toFixed(2),
      Gastos: gastosTotal.toFixed(2),
      Beneficio: beneficio.toFixed(2)
    });
  });

  const ws = XLSX.utils.json_to_sheet(resumenData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, "resumen_creapp.xlsx");
};

// EXPORTAR PDF
window.exportarPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const resumenData = [];
  Object.entries(campos).forEach(([id, campo]) => {
    const prodCampo = produccion.filter(p => p.campoId === id);
    const gastosCampo = gastos.filter(g => g.campoId === id);
    const totalKilos = prodCampo.reduce((sum, p) => sum + (p.kilos || 0), 0);
    const ingresos = prodCampo.reduce((sum, p) => sum + (p.kilos * p.precio || 0), 0);
    const gastosTotal = gastosCampo.reduce((sum, g) => sum + (g.importe || 0), 0);
    const beneficio = ingresos - gastosTotal;

    resumenData.push([
      campo.nombre,
      campo.provincia,
      campo.municipio,
      totalKilos,
      ingresos.toFixed(2),
      gastosTotal.toFixed(2),
      beneficio.toFixed(2)
    ]);
  });

  doc.autoTable({
    head: [["Campo", "Provincia", "Municipio", "Kilos", "Ingresos €", "Gastos €", "Beneficio €"]],
    body: resumenData
  });

  doc.save("resumen_creapp.pdf");
};

// INICIAR
cargarDatos();
