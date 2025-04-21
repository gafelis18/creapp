// Guardar campos
document.addEventListener("DOMContentLoaded", () => {
  const campoForm = document.getElementById("campoForm");
  const listaCampos = document.getElementById("listaCampos");
  const campoSelect = document.getElementById("campoSeleccionado");

  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const campos = JSON.parse(localStorage.getItem("campos") || "[]");

  function guardarCampos(campos) {
    localStorage.setItem("campos", JSON.stringify(campos));
  }

  function renderizarCampos() {
    if (listaCampos) {
      listaCampos.innerHTML = "";
      campos.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = `${c.nombre} (Polígono ${c.poligono}, Parcela ${c.parcela})`;
        listaCampos.appendChild(li);
      });
    }

    if (campoSelect) {
      campoSelect.innerHTML = "";
      campos.forEach(c => {
        const option = document.createElement("option");
        option.value = c.nombre;
        option.textContent = c.nombre;
        campoSelect.appendChild(option);
      });
    }
  }

  if (campoForm) {
    campoForm.addEventListener("submit", e => {
      e.preventDefault();
      const nombre = document.getElementById("nombreCampo").value;
      const poligono = document.getElementById("poligono").value;
      const parcela = document.getElementById("parcela").value;

      campos.push({ nombre, poligono, parcela });
      guardarCampos(campos);
      renderizarCampos();
      campoForm.reset();
    });

    renderizarCampos();
  }

  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", e => {
      e.preventDefault();

      const campo = document.getElementById("campoSeleccionado").value;
      const variedad = document.getElementById("variedad").value;
      const kilos = parseFloat(document.getElementById("kilos").value);
      const gasto = parseFloat(document.getElementById("gasto").value);
      const destino = document.getElementById("destino").value;
      const precio = parseFloat(document.getElementById("precioVenta").value || 0);
      const anio = parseInt(document.getElementById("anio").value);

      registros.push({ campo, variedad, kilos, gasto, destino, precio, anio });
      localStorage.setItem("registros", JSON.stringify(registros));
      alert("Registro guardado correctamente");
      registroForm.reset();
    });

    renderizarCampos();
  }

  // Dashboard
  const resumen = document.getElementById("resumen");
  if (resumen) {
    const totales = {};

    registros.forEach(r => {
      const clave = `${r.campo}-${r.anio}`;
      if (!totales[clave]) {
        totales[clave] = {
          campo: r.campo,
          anio: r.anio,
          kilos: 0,
          gasto: 0,
          ingreso: 0,
          beneficio: 0,
          porVariedad: {}
        };
      }

      const ingreso = r.precio * r.kilos;
      totales[clave].kilos += r.kilos;
      totales[clave].gasto += r.gasto;
      totales[clave].ingreso += ingreso;
      totales[clave].beneficio += ingreso - r.gasto;

      if (!totales[clave].porVariedad[r.variedad]) {
        totales[clave].porVariedad[r.variedad] = 0;
      }
      totales[clave].porVariedad[r.variedad] += r.kilos;
    });

    Object.values(totales).forEach(t => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${t.campo} - Año ${t.anio}</h3>
        <p><strong>Kilos:</strong> ${t.kilos}</p>
        <p><strong>Ingreso:</strong> ${t.ingreso.toFixed(2)} €</p>
        <p><strong>Gasto:</strong> ${t.gasto.toFixed(2)} €</p>
        <p><strong>Beneficio:</strong> ${t.beneficio.toFixed(2)} €</p>
        <p><strong>Kilos por variedad:</strong></p>
        <ul>
          ${Object.entries(t.porVariedad)
            .map(([v, k]) => `<li>${v}: ${k} kg</li>`)
            .join("")}
        </ul>
        <hr/>
      `;
      resumen.appendChild(div);
    });
  }
});
