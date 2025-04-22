import { db, ref, onValue } from "./firebase-config.js";

const resumenCampos = document.getElementById("resumenCampos");
const graficoProduccion = document.getElementById("graficoProduccion").getContext("2d");
const graficoBeneficio = document.getElementById("graficoBeneficio").getContext("2d");
const campanaSelect = document.getElementById("campanaSeleccionada");

campanaSelect.addEventListener("change", cargarDatos);
window.addEventListener("DOMContentLoaded", cargarDatos);

function cargarDatos() {
  const campana = campanaSelect.value;
  onValue(ref(db, "campos/"), snapshotCampos => {
    const campos = snapshotCampos.val();
    if (!campos) return;

    onValue(ref(db, "produccion/"), snapshotProd => {
      const produccion = snapshotProd.val() || {};

      onValue(ref(db, "gastos/"), snapshotGastos => {
        const gastos = snapshotGastos.val() || {};
        const resumen = {};
        const labels = [];
        const datosProduccion = [];
        const datosBeneficio = [];

        for (const [id, campo] of Object.entries(campos)) {
          resumen[id] = {
            nombre: campo.nombre,
            kilos: 0,
            ingresos: 0,
            gastos: 0
          };
        }

        for (const [id, prod] of Object.entries(produccion)) {
          if (resumen[prod.campoId] && (prod.campana === campana || (!prod.campana && campana === "2024/2025"))) {
            const kilos = prod.kilos || 0;
            const precio = prod.precio || 0;
            resumen[prod.campoId].kilos += kilos;
            resumen[prod.campoId].ingresos += kilos * precio;
          }
        }

        for (const [id, gasto] of Object.entries(gastos)) {
          if (resumen[gasto.campoId] && (gasto.campana === campana || (!gasto.campana && campana === "2024/2025"))) {
            resumen[gasto.campoId].gastos += gasto.importe || 0;
          }
        }

        for (const campo of Object.values(resumen)) {
          labels.push(campo.nombre);
          datosProduccion.push(campo.kilos);
          datosBeneficio.push(campo.ingresos - campo.gastos);
        }

        crearGrafico("Producción por campo (kg)", labels, datosProduccion, graficoProduccion);
        crearGrafico("Beneficio por campo (€)", labels, datosBeneficio, graficoBeneficio);
      });
    });
  });
}

function crearGrafico(titulo, etiquetas, datos, ctx) {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: datos,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
