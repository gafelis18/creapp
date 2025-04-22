import { db, ref, onValue, remove, update } from "./firebase-config.js";

const resumenCampos = document.getElementById("resumenCampos");

function cargarResumen() {
  onValue(ref(db, "campos/"), snapshotCampos => {
    const campos = snapshotCampos.val();
    if (!campos) return;

    onValue(ref(db, "produccion/"), snapshotProd => {
      const produccion = snapshotProd.val() || {};

      onValue(ref(db, "gastos/"), snapshotGastos => {
        const gastos = snapshotGastos.val() || {};
        const resumen = {};

        for (const [id, campo] of Object.entries(campos)) {
          resumen[id] = {
            nombre: campo.nombre,
            kilos: 0,
            cajas: 0,
            ingresos: 0,
            gastos: 0,
            producciones: [],
            gastosItems: []
          };
        }

        for (const [id, prod] of Object.entries(produccion)) {
          if (resumen[prod.campoId]) {
            resumen[prod.campoId].kilos += prod.kilos || 0;
            resumen[prod.campoId].cajas += prod.cajas || 0;
            resumen[prod.campoId].ingresos += (prod.kilos || 0) * (prod.precio || 0);
            resumen[prod.campoId].producciones.push({ id, ...prod });
          }
        }

        for (const [id, gasto] of Object.entries(gastos)) {
          if (resumen[gasto.campoId]) {
            resumen[gasto.campoId].gastos += gasto.importe || 0;
            resumen[gasto.campoId].gastosItems.push({ id, ...gasto });
          }
        }

        resumenCampos.innerHTML = "";

        for (const [id, campo] of Object.entries(resumen)) {
          const beneficio = campo.ingresos - campo.gastos;

          const produccionesHTML = campo.producciones.map(p =>
            `<li>
              ${p.variedad} - ${p.kilos} kg, ${p.cajas} cajas, ${p.precio}€/kg (${p.fecha})
              <button onclick="editarProduccion('${p.id}', '${p.variedad}', ${p.kilos}, ${p.cajas}, ${p.precio}, '${p.fecha}', '${p.observaciones || ""}')">Editar</button>
              <button onclick="eliminarProduccion('${p.id}')">Eliminar</button>
            </li>`).join("");

          const gastosHTML = campo.gastosItems.map(g =>
            `<li>
              ${g.tipo} - ${g.importe} € (${g.fecha})
              <button onclick="editarGasto('${g.id}', '${g.tipo}', ${g.importe}, '${g.fecha}', '${g.observaciones || ""}')">Editar</button>
              <button onclick="eliminarGasto('${g.id}')">Eliminar</button>
            </li>`).join("");

          resumenCampos.innerHTML += `
            <div class="campo-resumen">
              <h3>${campo.nombre}</h3>
              <p><strong>Kilos:</strong> ${campo.kilos.toFixed(2)}</p>
              <p><strong>Cajas:</strong> ${campo.cajas}</p>
              <p><strong>Ingresos:</strong> ${campo.ingresos.toFixed(2)} €</p>
              <p><strong>Gastos:</strong> ${campo.gastos.toFixed(2)} €</p>
              <p><strong>Beneficio:</strong> ${beneficio.toFixed(2)} €</p>
              <h4>Producciones</h4>
              <ul>${produccionesHTML}</ul>
              <h4>Gastos</h4>
              <ul>${gastosHTML}</ul>
            </div>
          `;
        }
      });
    });
  });
}

window.eliminarProduccion = function(id) {
  if (confirm("¿Eliminar esta producción?")) {
    remove(ref(db, `produccion/${id}`));
  }
};

window.eliminarGasto = function(id) {
  if (confirm("¿Eliminar este gasto?")) {
    remove(ref(db, `gastos/${id}`));
  }
};

window.editarProduccion = function(id, variedad, kilos, cajas, precio, fecha, obs) {
  const nuevaVariedad = prompt("Variedad:", variedad);
  const nuevoKilos = parseFloat(prompt("Kilos:", kilos));
  const nuevoCajas = parseInt(prompt("Cajas:", cajas));
  const nuevoPrecio = parseFloat(prompt("Precio €/kg:", precio));
  const nuevaFecha = prompt("Fecha:", fecha);
  const nuevasObs = prompt("Observaciones:", obs || "");

  if (!isNaN(nuevoKilos) && !isNaN(nuevoPrecio)) {
    update(ref(db, `produccion/${id}`), {
      variedad: nuevaVariedad,
      kilos: nuevoKilos,
      cajas: nuevoCajas,
      precio: nuevoPrecio,
      fecha: nuevaFecha,
      observaciones: nuevasObs
    });
  }
};

window.editarGasto = function(id, tipo, importe, fecha, obs) {
  const nuevoTipo = prompt("Tipo de gasto:", tipo);
  const nuevoImporte = parseFloat(prompt("Importe (€):", importe));
  const nuevaFecha = prompt("Fecha:", fecha);
  const nuevasObs = prompt("Observaciones:", obs || "");

  if (!isNaN(nuevoImporte)) {
    update(ref(db, `gastos/${id}`), {
      tipo: nuevoTipo,
      importe: nuevoImporte,
      fecha: nuevaFecha,
      observaciones: nuevasObs
    });
  }
};

cargarResumen();
