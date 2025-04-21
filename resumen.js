import { db, ref, onValue, update, remove } from "./firebase-config.js";

const contenedor = document.getElementById("listadoResumen");

let campos = {};
let produccion = [];
let gastos = [];

function cargarDatos() {
  onValue(ref(db, "campos/"), snap => {
    campos = snap.val() || {};
    mostrarResumen();
  });

  onValue(ref(db, "produccion/"), snap => {
    produccion = Object.entries(snap.val() || {}).map(([id, d]) => ({ id, ...d }));
    mostrarResumen();
  });

  onValue(ref(db, "gastos/"), snap => {
    gastos = Object.entries(snap.val() || {}).map(([id, d]) => ({ id, ...d }));
    mostrarResumen();
  });
}

function mostrarResumen() {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  Object.entries(campos).forEach(([idCampo, campo]) => {
    const prodCampo = produccion.filter(p => p.campoId === idCampo);
    const gastosCampo = gastos.filter(g => g.campoId === idCampo);

    let totalIngresos = 0;
    let totalGastos = 0;

    const ingresosList = prodCampo.map(p => {
      const subtotal = (p.kilos * p.precio).toFixed(2);
      totalIngresos += parseFloat(subtotal);
      return `<li>
        ${p.fecha} | ${p.variedad} - ${p.kilos} kg x ${p.precio} € = <strong>${subtotal} €</strong>
        <button onclick="editarIngreso('${p.id}')">Editar</button>
        <button onclick="eliminarIngreso('${p.id}')">Eliminar</button>
      </li>`;
    }).join("");

    const gastosList = gastosCampo.map(g => {
      totalGastos += parseFloat(g.importe || 0);
      return `<li class="gasto">
        ${g.fecha} | ${g.tipo} - <strong>${g.importe} €</strong>
        <button onclick="editarGasto('${g.id}')">Editar</button>
        <button onclick="eliminarGasto('${g.id}')">Eliminar</button>
      </li>`;
    }).join("");

    const total = (totalIngresos - totalGastos).toFixed(2);

    contenedor.innerHTML += `
      <div class="campo-box">
        <h3>${campo.nombre}</h3>

        <h4>Ingresos</h4>
        <ul>${ingresosList || "<li>No hay ingresos</li>"}</ul>

        <h4>Gastos</h4>
        <ul>${gastosList || "<li>No hay gastos</li>"}</ul>

        <p class="total">Total ingresos: ${totalIngresos.toFixed(2)} €</p>
        <p class="total">Total gastos: ${totalGastos.toFixed(2)} €</p>
        <p class="total">Beneficio: ${total} €</p>
      </div>
    `;
  });
}

window.eliminarIngreso = id => {
  if (confirm("¿Eliminar este ingreso?")) {
    remove(ref(db, `produccion/${id}`));
  }
};

window.eliminarGasto = id => {
  if (confirm("¿Eliminar este gasto?")) {
    remove(ref(db, `gastos/${id}`));
  }
};

window.editarIngreso = id => {
  const nuevoPrecio = prompt("Nuevo precio por kg:");
  if (nuevoPrecio !== null) {
    update(ref(db, `produccion/${id}`), { precio: parseFloat(nuevoPrecio) });
  }
};

window.editarGasto = id => {
  const nuevoImporte = prompt("Nuevo importe:");
  if (nuevoImporte !== null) {
    update(ref(db, `gastos/${id}`), { importe: parseFloat(nuevoImporte) });
  }
};

cargarDatos();
