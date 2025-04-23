import { db, ref, onValue, remove } from "./firebase-config.js";

const tablaProdBody = document.querySelector("#tablaProduccion tbody");
const tablaGastosBody = document.querySelector("#tablaGastos tbody");
const totalKilos = document.getElementById("totalKilos");
const totalCajas = document.getElementById("totalCajas");
const totalIngresos = document.getElementById("totalIngresos");
const totalGastos = document.getElementById("totalGastos");

let campos = {};

onValue(ref(db, "campos"), (snapshot) => {
  campos = snapshot.val() || {};
});

onValue(ref(db, "produccion"), (snapshot) => {
  tablaProdBody.innerHTML = "";
  let totalKg = 0, totalCj = 0, ingresos = 0;
  const data = snapshot.val();

  if (data) {
    Object.entries(data).forEach(([id, prod]) => {
      const campo = campos[prod.campoId]?.nombre || "Sin nombre";
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${campo}</td>
        <td>${prod.variedad}</td>
        <td>${prod.kilos}</td>
        <td>${prod.cajas}</td>
        <td>${prod.precio.toFixed(2)}</td>
        <td>${prod.fecha}</td>
        <td>
          <button class="btn editar" onclick="editarRegistro('produccion','${id}')">Editar</button>
          <button class="btn eliminar" onclick="eliminarRegistro('produccion','${id}')">Eliminar</button>
        </td>
      `;
      tablaProdBody.appendChild(fila);
      totalKg += prod.kilos;
      totalCj += prod.cajas;
      ingresos += prod.kilos * prod.precio;
    });
  }

  totalKilos.textContent = totalKg;
  totalCajas.textContent = totalCj;
  totalIngresos.textContent = `Ingresos: ${ingresos.toFixed(2)} €`;
});

onValue(ref(db, "gastos"), (snapshot) => {
  tablaGastosBody.innerHTML = "";
  let totalG = 0;
  const data = snapshot.val();

  if (data) {
    Object.entries(data).forEach(([id, gasto]) => {
      const campo = campos[gasto.campoId]?.nombre || "Sin nombre";
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${campo}</td>
        <td>${gasto.tipo}</td>
        <td>${gasto.importe.toFixed(2)} €</td>
        <td>${gasto.fecha}</td>
        <td>
          <button class="btn editar" onclick="editarRegistro('gastos','${id}')">Editar</button>
          <button class="btn eliminar" onclick="eliminarRegistro('gastos','${id}')">Eliminar</button>
        </td>
      `;
      tablaGastosBody.appendChild(fila);
      totalG += gasto.importe;
    });
  }

  totalGastos.textContent = `${totalG.toFixed(2)} €`;
});

// Funciones globales
window.eliminarRegistro = (tipo, id) => {
  if (confirm("¿Seguro que quieres eliminar este registro?")) {
    remove(ref(db, `${tipo}/${id}`));
  }
};

window.editarRegistro = (tipo, id) => {
  alert("Función de edición no implementada aún.");
};
