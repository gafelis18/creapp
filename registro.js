document.addEventListener("DOMContentLoaded", () => {
  const tipoRegistro = document.getElementById("tipoRegistro");
  const formProduccion = document.getElementById("formProduccion");
  const formGasto = document.getElementById("formGasto");
  const campoProd = document.getElementById("campoProd");
  const campoGasto = document.getElementById("campoGasto");

  const campos = JSON.parse(localStorage.getItem("campos") || "[]");
  const producciones = JSON.parse(localStorage.getItem("producciones") || "[]");
  const gastos = JSON.parse(localStorage.getItem("gastos") || "[]");

  function cargarCamposEnSelect(select) {
    select.innerHTML = "";
    campos.forEach(c => {
      const option = document.createElement("option");
      option.value = c.nombre;
      option.textContent = c.nombre;
      select.appendChild(option);
    });
  }

  cargarCamposEnSelect(campoProd);
  cargarCamposEnSelect(campoGasto);

  tipoRegistro.addEventListener("change", () => {
    if (tipoRegistro.value === "produccion") {
      formProduccion.style.display = "block";
      formGasto.style.display = "none";
    } else {
      formProduccion.style.display = "none";
      formGasto.style.display = "block";
    }
  });

  // Guardar Producción
  document.getElementById("formProd").addEventListener("submit", e => {
    e.preventDefault();

    const nuevaProd = {
      campo: campoProd.value,
      variedad: document.getElementById("variedad").value,
      kilos: Number(document.getElementById("kilos").value),
      precio: Number(document.getElementById("precio").value),
      fecha: document.getElementById("fechaProd").value,
      observaciones: document.getElementById("obsProd").value
    };

    producciones.push(nuevaProd);
    localStorage.setItem("producciones", JSON.stringify(producciones));
    alert("Producción guardada");
    e.target.reset();
  });

  // Guardar Gasto
  document.getElementById("formGastoForm").addEventListener("submit", e => {
    e.preventDefault();

    const nuevoGasto = {
      campo: campoGasto.value,
      tipo: document.getElementById("tipoGasto").value,
      importe: Number(document.getElementById("importeGasto").value),
      fecha: document.getElementById("fechaGasto").value,
      notas: document.getElementById("obsGasto").value
    };

    gastos.push(nuevoGasto);
    localStorage.setItem("gastos", JSON.stringify(gastos));
    alert("Gasto guardado");
    e.target.reset();
  });
});
