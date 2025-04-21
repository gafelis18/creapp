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
        <strong>${campo.nombre}</strong> (${campo.parcelas.length} parcelas)<br/>
        Provincia: ${campo.provincia}, Municipio: ${campo.municipio}<br/>
        <button onclick="editarCampo(${index})">Editar</button>
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

  window.editarCampo = function(index) {
    const campo = campos[index];
    document.getElementById("nombreCampo").value = campo.nombre;
    document.getElementById("provincia").value = campo.provincia;
    document.getElementById("municipio").value = campo.municipio;
    parcelasTemporales = [...campo.parcelas];
    campos.splice(index, 1);
    guardarCampos();
    renderizarParcelas();
    renderizarCampos();
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

    if (!nombre || !provincia || !municipio || parcelasTemporales.length === 0) {
      alert("Completa todos los datos del campo y añade al menos una parcela.");
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
