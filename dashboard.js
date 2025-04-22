import { db, ref, onValue } from "./firebase-config.js";

const resumenCampos = document.getElementById("resumenCampos");

const graficoProduccion = document.getElementById("graficoProduccion").getContext("2d");
const graficoBeneficio = document.getElementById("graficoBeneficio").getContext("2d");

function cargarDatos() {
  onValue(ref(db, "campos/"), snapshot => {
    const campos = snapshot.val();
    if (!campos) return;

    onValue(ref(db, "produccion/"), snapshotProd => {
      const produccion = snapshotProd.val() || {};
      const resumen = {};
      const labels = [];
      const kilosPorCampo = [];
      const cajasPorCampo = [];

      for (const [id, campo] of Object.entries(campos)) {
        resumen[id] = {
          nombre: campo.nombre,
          kilos: 0,
          cajas: 0,
        };
      }

      for (const prod of Object.values(produccion)) {
        if (resumen[prod.campoId]) {
          resumen[prod.campoId].kilos += prod.kilos || 0;
          resumen[prod.campoId].cajas += prod.cajas || 0;
        }
      }

      resumenCampos.innerHTML = "";
      for (const campo of Object.values(resumen)) {
        resumenCampos.innerHTML += `
          <div style="margin-bottom:10px;">
            <strong>${campo.nombre}</strong><br>
            Kilos: ${campo.kilos.toFixed(2)}<br>
            Cajas: ${campo.cajas}
          </div>
        `;
        labels.push(campo.nombre);
        kilosPorCampo.push(campo.kilos);
        cajasPorCampo.push(campo.cajas);
      }

      // Gráfico de kilos
      new Chart(graficoProduccion, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Kilos por Campo",
            data: kilosPorCampo
          }]
        }
      });

      // Gráfico de cajas
      new Chart(graficoBeneficio, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Cajas por Campo",
            data: cajasPorCampo
          }]
        }
      });

    });
  });
}

cargarDatos();
