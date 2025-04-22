import { db, ref, onValue } from "./firebase-config.js";

const resumenContainer = document.getElementById("resumenCampos");
const campanaSelect = document.getElementById("campanaSeleccionada");

campanaSelect.addEventListener("change", cargarResumen);
window.addEventListener("DOMContentLoaded", cargarResumen);

function cargarResumen() {
  const campana = campanaSelect.value;

  onValue(ref(db, "campos/"), snapCampos => {
    const campos = snapCampos.val() || {};

    onValue(ref(db, "produccion/"), snapProd => {
      const produccion = snapProd.val() || {};

      onValue(ref(db, "gastos/"), snapGastos => {
        const gastos = snapGastos.val() || {};
        resumenContainer.innerHTML = "";

        let totalGlobalIngresos = 0;
        let totalGlobalGastos = 0;

        Object.entries(campos).forEach(([id, campo]) => {
          let totalKilos = 0;
          let totalCajas = 0;
          let totalIngresos = 0;
          let totalGastos = 0;
          const variedades = {};

          for (const prod of Object.values(produccion)) {
            if (prod.campoId === id && (prod.campana === campana || (!prod.campana && campana === "2024/2025"))) {
              totalKilos += prod.kilos || 0;
              totalCajas += prod.cajas || 0;
              totalIngresos += (prod.kilos || 0) * (prod.precio || 0);
              if (!variedades[prod.variedad]) variedades[prod.variedad] = 0;
              variedades[prod.variedad] += prod.kilos || 0;
            }
          }

          for (const gasto of Object.values(gastos)) {
            if (gasto.campoId === id && (gasto.campana === campana || (!gasto.campana && campana === "2024/2025"))) {
              totalGastos += gasto.importe || 0;
            }
          }

          totalGlobalIngresos += totalIngresos;
          totalGlobalGastos += totalGastos;

          const div = document.createElement("div");
          div.className = "campo-resumen";
          div.innerHTML = `
            <h3>${campo.nombre} (${campo.provincia})</h3>
            <p><strong>Kilos:</strong> ${totalKilos.toFixed(2)}</p>
            <p><strong>Cajas:</strong> ${totalCajas}</p>
            <p><strong>Ingresos:</strong> ${totalIngresos.toFixed(2)} €</p>
            <p><strong>Gastos:</strong> ${totalGastos.toFixed(2)} €</p>
            <p><strong>Beneficio:</strong> ${(totalIngresos - totalGastos).toFixed(2)} €</p>
            <ul>
              ${Object.entries(variedades).map(([v, k]) => `<li>${v}: ${k.toFixed(2)} kg</li>`).join("")}
            </ul>
          `;
          resumenContainer.appendChild(div);
        });

        const resumenTotal = document.createElement("div");
        resumenTotal.className = "campo-resumen";
        resumenTotal.innerHTML = `
          <h3>Total Global Campaña ${campana}</h3>
          <p><strong>Ingresos Totales:</strong> ${totalGlobalIngresos.toFixed(2)} €</p>
          <p><strong>Gastos Totales:</strong> ${totalGlobalGastos.toFixed(2)} €</p>
          <p><strong>Beneficio Total:</strong> ${(totalGlobalIngresos - totalGlobalGastos).toFixed(2)} €</p>
        `;
        resumenContainer.appendChild(resumenTotal);
      });
    });
  });
}
