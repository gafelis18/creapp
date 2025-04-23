import { db, ref, onValue, remove } from "./firebase-config.js";

const tablaProdBody = document.querySelector("#tablaProduccion tbody");
const tablaGastoBody = document.querySelector("#tablaGastos tbody");
const totalesProd = document.getElementById("totalesProduccion");
const totalesGastos = document.getElementById("totalesGastos");

let campos = {};

function cargarCampos() {
  onValue(ref(db, "campos/"), snapshot => {
    campos = snapshot.val() || {};
    cargarProduccion();
    cargarGastos();
  });
}

function cargarProduccion() {
  onValue(ref(db, "produccion/"), snapshot => {
    const data = snapshot.val() || {};
    tablaProdBody.innerHTML = "";
    totalesProd.innerHTML = "";

    let totalKilos = 0;
    let totalCajas = 0;
    let totalIngreso = 0;

    Object.entries(data).forEach(([id, prod]) => {
      const campo = campos[prod.campoId]?.nombre || "Desconocido";
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${campo}</td>
        <td>${prod.variedad}</td>
        <td>${prod.kilos}</td>
        <td>${prod.cajas}</td>
        <td>${prod.precio.toFixed(2)}</td>
        <td>${prod.fecha}</td>
        <td>
          <button class="btn editar" onclick="editarProduccion('${id}')">Editar</button>
          <button class="btn eliminar" onclick="eliminarProduccion('${id}')">Eliminar</button>
        </td>
      `;

      tablaProdBody.appendChild(row);

      totalKilos += prod.kilos;
      totalCajas += prod.cajas;
      totalIngreso += prod.kilos * prod.precio;
    });

    totalesProd.innerHTML = `
      <tr class="totales">
        <td colspan="2">Totales</td>
        <td>${totalKilos}</td>
        <td>${totalCajas}</td>
        <td colspan="2">Ingresos: ${totalIngreso.toFixed(2)} €</td>
        <td></td>
      </tr>
    `;
  });
}

function cargarGastos() {
  onValue(ref(db, "gastos/"), snapshot => {
    const data = snapshot.val() || {};
    tablaGastoBody.innerHTML = "";
    totalesGastos.innerHTML = "";

    let totalGastos = 0;

    Object.entries(data).forEach(([id, gasto]) => {
      const campo = campos[gasto.campoId]?.nombre || "Desconocido";
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${campo}</td>
        <td>${gasto.tipo}</td>
        <td>${gasto.importe.toFixed(2)} €</td>
        <td>${gasto.fecha}</td>
        <td>
          <button class="btn editar" onclick="editarGasto('${id}')">Editar</button>
          <button class="btn eliminar" onclick="eliminarGasto('${id}')">Eliminar</button>
        </td>
      `;

      tablaGastoBody.appendChild(row);
      totalGastos += gasto.importe;
    });

    totalesGastos.innerHTML = `
      <tr class="totales">
        <td colspan="2">Total</td>
        <td>${totalGastos.toFixed(2)} €</td>
        <td colspan="2"></td>
      </tr>
    `;
  });
}

window.eliminarProduccion = (id) => {
  if (confirm("¿Eliminar esta producción?")) {
    remove(ref(db, `produccion/${id}`));
  }
};

window.eliminarGasto = (id) => {
  if (confirm("¿Eliminar este gasto?")) {
    remove(ref(db, `gastos/${id}`));
  }
};

window.editarProduccion = (id) => {
  alert("Función de edición futura para producción (no implementada todavía).");
};

window.editarGasto = (id) => {
  alert("Función de edición futura para gasto (no implementada todavía).");
};

cargarCampos();
