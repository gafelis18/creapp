import { db, ref, onValue } from "./firebase-config.js";

const resumenCampos = document.getElementById("resumenCampos");

function cargarResumen() {
  onValue(ref(db, "campos/"), snapshotCampos => {
    const campos = snapshotCampos.val();
    if (!campos) return;

    onValue(ref(db, "produccion/"), snapshotProd => {
      const produccion = snapshotProd.val() || {};

      onValue(ref(db, "gastos/"), snapshotGastos => {
        const gastos = snapshotGastos.val() || {};
        const ingresos = {};
        const gastosTotales = {};
        const kilos = {};
        const cajas = {};

        for (const [id, campo] of Object.entries(campos)) {
          ingresos[id] = 0;
          gastosTotales[id] = 0;
          kilos[id] = 0;
          cajas[id] = 0;
        }

        for (const [id, prod] of Object.entries(produccion)) {
          if (ingresos[prod.campoId] !== undefined) {
            ingresos[prod.campoId] += (prod.kilos || 0) * (prod.precio || 0);
            kilos[prod.campoId] += prod.kilos || 0;
            cajas[prod.campoId] += prod.cajas || 0;
          }
        }

        for (const [id, gasto] of Object.entries(gastos)) {
          if (gastosTotales[gasto.campoId] !== undefined) {
            gastosTotales[gasto.campoId] += gasto.importe || 0;
          }
        }

        resumenCampos.innerHTML = "";

        for (const [id, campo] of Object.entries(campos)) {
          const ingreso = ingresos[id] || 0;
          const gasto = gastosTotales[id] || 0;
          const beneficio = ingreso - gasto;

          resumenCampos.innerHTML += `
            <div class="campo-resumen">
              <h3>${campo.nombre}</h3>
              <p><strong>Kilos:</strong> ${kilos[id].toFixed(2)}</p>
              <p><strong>Cajas:</strong> ${cajas[id]}</p>
              <p><strong>Ingresos:</strong> ${ingreso.toFixed(2)} €</p>
              <p><strong>Gastos:</strong> ${gasto.toFixed(2)} €</p>
              <p><strong>Beneficio:</strong> ${beneficio.toFixed(2)} €</p>
            </div>
          `;
        }
      });
    });
  });
}

cargarResumen();
