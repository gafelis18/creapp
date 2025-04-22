import { db, ref, onValue, remove } from "./firebase-config.js";

const tablaProd = document.querySelector("#tablaProduccion tbody");
const tablaGastos = document.querySelector("#tablaGastos tbody");
let campos = {};

// Cargar nombres de campos
onValue(ref(db, "campos/"), snapshot => {
  campos = snapshot.val() || {};
  cargarResumen();
});

function cargarResumen() {
  onValue(ref(db, "produccion/"), snapshot => {
    const data = snapshot.val();
    tablaProd.innerHTML = "";
    if (data) {
      Object.entries(data).forEach(([id, item]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${nombreCampo(item.campoId)}</td>
          <td>${item.variedad}</td>
          <td>${item.kilos}</td>
          <td>${item.cajas || 0}</td>
          <td>${item.precio}</td>
          <td>${item.fecha}</td>
          <td>
            <button class="edit-btn" onclick="editarRegistro('produccion', '${id}')">Editar</button>
            <button class="delete-btn" onclick="eliminarRegistro('produccion', '${id}')">Eliminar</button>
          </td>
        `;
        tablaProd.appendChild(tr);
      });
    }
  });

  onValue(ref(db, "gastos/"), snapshot => {
    const data = snapshot.val();
    tablaGastos.innerHTML = "";
    if (data) {
      Object.entries(data).forEach(([id, item]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${nombreCampo(item.campoId)}</td>
          <td>${item.tipo}</td>
          <td>${item.importe}</td>
          <td>${item.fecha}</td>
          <td>
            <button class="edit-btn" onclick="editarRegistro('gastos', '${id}')">Editar</button>
            <button class="delete-btn" onclick="eliminarRegistro('gastos', '${id}')">Eliminar</button>
          </td>
        `;
        tablaGastos.appendChild(tr);
      });
    }
  });
}

function nombreCampo(id) {
  return campos[id]?.nombre || "Desconocido";
}

window.eliminarRegistro = function (tipo, id) {
  if (confirm("¿Deseas eliminar este registro?")) {
    remove(ref(db, `${tipo}/${id}`));
  }
};

window.editarRegistro = function (tipo, id) {
  alert("Función de edición aún no implementada. Próximamente.");
};
