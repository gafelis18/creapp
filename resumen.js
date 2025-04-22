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
        const totales = { kilos: 0, cajas: 0, ingresos: 0, gastos: 0 };
        const porVariedad = {};

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
            const kilos = prod.kilos || 0;
            const cajas = prod.cajas || 0;
            const precio = prod.precio || 0;
            const variedad = prod.variedad || "Sin especificar";

            resumen[prod.campoId].kilos += kilos;
            resumen[prod.campoId].cajas += cajas;
            resumen[prod.campoId].ingresos += kilos * precio;
            resumen[prod.campoId].producciones.push({ id, ...prod });

            totales.kilos += kilos;
            totales.cajas += cajas;
            totales.ingresos += kilos * precio;

            if (!porVariedad[variedad]) {
              porVariedad[variedad] = { kilos: 0, cajas: 0 };
            }
            porVariedad[variedad].kilos += kilos;
            porVariedad[variedad].cajas += cajas;
          }
        }

        for (const [id, gasto] of Object.entries(gastos)) {
          if (resumen[gasto.campoId]) {
            const importe = gasto.importe || 0;
            resumen[gasto.campoId].gastos += importe;
            resumen[gasto.campoId].gastosItems.push({ id, ...gasto });
            totales.gastos += importe;
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

        resumenCampos.innerHTML += `
          <div class="campo-resumen" style="background:#d9edf7;">
            <h3>Total Global</h3>
            <p><strong>Kilos:</strong> ${totales.kilos.toFixed(2)}</p>
            <p><strong>Cajas:</strong> ${totales.cajas}</p>
            <p><strong>Ingresos:</strong> ${totales.ingresos.toFixed(2)} €</p>
            <p><strong>Gastos:</strong> ${totales.gastos.toFixed(2)} €</p>
            <p><strong>Beneficio:</strong> ${(totales.ingresos - totales.gastos).toFixed(2)} €</p>
          </div>
        `;

        resumenCampos.innerHTML += `
          <div class="campo-resumen" style="background:#fef7e0;">
            <h3>Totales por Variedad</h3>
            ${Object.entries(porVariedad).map(([v, d]) =>
              `<p><strong>${v}:</strong> ${d.kilos.toFixed(2)} kg, ${d.cajas} cajas</p>`).join("")}
          </div>
        `;
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
