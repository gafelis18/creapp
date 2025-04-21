document.addEventListener("DOMContentLoaded", () => {
  const campoForm = document.getElementById("campoForm");
  const listaCampos = document.getElementById("listaCampos");
  const listaParcelas = document.getElementById("listaParcelas");
  const addParcelaBtn = document.getElementById("addParcela");

  let parcelasTemporales = [];
  let campos = JSON.parse(localStorage.getItem("campos") || "[]");

  function guardarCampos() {
    localStorage.setItem("campos", JSON.stringify(campos));
  }

  function renderizarCampos() {
    listaCampos.innerHTML = "";
    campos.forEach((campo, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${campo.nombre}</strong> - ${campo.parcelas.length} parcelas<br/>
        Provincia: ${campo.provincia}, Municipio: ${campo.municipio}
        <br/>
        <button onclick="eliminarCampo(${index})">Eliminar</button>
      `;
      listaCampos.appendChild(li);
    });
  }

  window.eliminarCampo = function(index) {
    if (confirm("¿Seguro que quieres eliminar este campo?")) {
      campos.splice(index, 1);
      guardarCampos();
      renderizarCampos();
    }
  };

  function renderizarParcelas() {
    listaParcelas.innerHTML = "";
    parcelasTemporales.forEach((p, i) => {
      const li = document.createElement("li");
      li.textContent = `Polígono ${p.poligono}, Parcela ${p.parcela}`;
      listaParcelas.appendChild(li);
    });
  }

  addParcelaBtn.addEventListener("click", () => {
    const poligono = document.getElementById("poligono").value;
    const parcela = document.getElementById("parcela").value;

    if (poligono && parcela) {
      parcelasTemporales.push({ poligono, parcela });
      renderizarParcelas();
      document.getElementById("poligono").value = "";
      document.getElementById("parcela").value = "";
    } else {
      alert("Debes rellenar polígono y parcela");
    }
  });

  campoForm.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombreCampo").value;
    const provincia = document.getElementById("provincia").value;
    const municipio = document.getElementById("municipio").value;

    if (parcelasTemporales.length === 0) {
      alert("Añade al menos una parcela al campo.");
      return;
    }

    const nuevoCampo = {
      nombre,
      provincia,
      municipio,
      parcelas: [...parcelasTemporales]
    };

    campos.push(nuevoCampo);
    guardarCampos();
    renderizarCampos();
    campoForm.reset();
    parcelasTemporales = [];
    renderizarParcelas();
  });

  renderizarCampos();
});
