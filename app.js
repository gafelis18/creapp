document.addEventListener("DOMContentLoaded", () => {
  const campoForm = document.getElementById("campoForm");
  const listaCampos = document.getElementById("listaCampos");
  const campos = JSON.parse(localStorage.getItem("campos") || "[]");

  function guardarCampos(campos) {
    localStorage.setItem("campos", JSON.stringify(campos));
  }

  function renderizarCampos() {
    if (listaCampos) {
      listaCampos.innerHTML = "";
      campos.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = `${c.nombre} (Provincia ${c.provincia}, Municipio ${c.municipio}, Polígono ${c.poligono}, Parcela ${c.parcela})`;
        listaCampos.appendChild(li);
      });
    }
  }

  if (campoForm) {
    campoForm.addEventListener("submit", e => {
      e.preventDefault();
      const nombre = document.getElementById("nombreCampo").value;
      const provincia = document.getElementById("provincia").value;
      const municipio = document.getElementById("municipio").value;
      const poligono = document.getElementById("poligono").value;
      const parcela = document.getElementById("parcela").value;

      campos.push({ nombre, provincia, municipio, poligono, parcela });
      guardarCampos(campos);
      renderizarCampos();
      campoForm.reset();
    });

    renderizarCampos();
  }
});
