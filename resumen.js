import { db, ref, onValue, remove } from "./firebase-config.js";

const tablaProd = document.querySelector("#tablaProduccion tbody");
const tablaGast = document.querySelector("#tablaGastos tbody");
const totalKilos = document.getElementById("totalKilos");
const totalCajas = document.getElementById("totalCajas");
const totalIngresos = document.getElementById("totalIngresos");
const totalGastos = document.getElementById("totalGastos");

function cargarResumen() {
  onValue(ref(db, "produccion/"), snapshot => {
    const data = snapshot.val();
    tablaProd.innerHTML = "";
    let kilos = 0, cajas = 0, ingresos = 0;

    if (data) {
      Object.entries(data).forEach(([id, prod]) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${prod.campoNombre || ""}</td>
          <td>${prod.variedad}</td>
          <td>${prod.kilos}</td>
          <td>${prod.cajas}</td>
          <td>${prod.precio.toFixed(2)}</td>
          <td>${prod.fecha}</td>
          <td>
            <button class="edit-btn" onclick="editarProd('${id}')">Editar</button>
            <button class="delete-btn" onclick="eliminarProd('${id}')">Eliminar</button>
          </td>
        `;
        tablaProd.appendChild(fila);
        kilos += prod.kilos;
        cajas += prod.cajas;
        ingresos += prod.kilos * prod.precio;
      });
    }

    totalKilos.textContent = kilos;
    totalCajas.textContent = cajas;
    totalIngresos.textContent = ingresos.toFixed(2) + " €";
  });

  onValue(ref(db, "gastos/"), snapshot => {
    const data = snapshot.val();
    tablaGast.innerHTML = "";
    let total = 0;

    if (data) {
      Object.entries(data).forEach(([id, gasto]) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${gasto.campoNombre || ""}</td>
          <td>${gasto.tipo}</td>
          <td>${gasto.importe.toFixed(2)} €</td>
          <td>${gasto.fecha}</td>
          <td>
            <button class="edit-btn" onclick="editarGasto('${id}')">Editar</button>
            <button class="delete-btn" onclick="eliminarGasto('${id}')">Eliminar</button>
          </td>
        `;
        tablaGast.appendChild(fila);
        total += gasto.importe;
      });
    }

    totalGastos.textContent = total.toFixed(2) + " €";
  });
}

window.eliminarProd = function(id) {
  if (confirm("¿Eliminar este registro de producción?")) {
    remove(ref(db, "produccion/" + id));
  }
};

window.eliminarGasto = function(id) {
  if (confirm("¿Eliminar este gasto?")) {
    remove(ref(db, "gastos/" + id));
  }
};

window.editarProd = function(id) {
  alert("Función de edición de producción aún no implementada.");
};

window.editarGasto = function(id) {
  alert("Función de edición de gasto aún no implementada.");
};

cargarResumen();
