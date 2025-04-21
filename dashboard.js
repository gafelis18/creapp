document.addEventListener("DOMContentLoaded", () => {
  const resumen = document.getElementById("resumenCampos");

  const campos = JSON.parse(localStorage.getItem("campos") || "[]");
  const producciones = JSON.parse(localStorage.getItem("producciones") || "[]");
  const gastos = JSON.parse(localStorage.getItem("gastos") || "[]");

  let totalPorCampo = {};
  let totalPorVariedad = {};

  campos.forEach(campo => {
    const nombre = campo.nombre;

    const prodCampo = producciones.filter(p => p.campo === nombre);
    const gastoCampo = gastos.filter(g => g.campo === nombre);

    const kilos = prodCampo.reduce((sum, p) => sum + p.kilos, 0);
    const ingresos = prodCampo.reduce((sum, p) => sum + (p.kilos * p.precio), 0);
    const totalGastos = gastoCampo.reduce((sum, g) => sum + g.importe, 0);
    const beneficio = ingresos - totalGastos;

    totalPorCampo[nombre] = { kilos, ingresos, totalGastos, beneficio };

    prodCampo.forEach(p => {
      const clave = `${nombre} - ${p.variedad}`;
      totalPorVariedad[clave] = (totalPorVariedad[clave] || 0) + p.kilos;
    });

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${nombre}</h3>
      <p><strong>Kilos:</strong> ${kilos.toFixed(2)} kg</p>
      <p><strong>Ingresos:</strong> ${ingresos.toFixed(2)} €</p>
      <p><strong>Gastos:</strong> ${totalGastos.toFixed(2)} €</p>
      <p><strong>Beneficio:</strong> ${beneficio.toFixed(2)} €</p>
      <hr/>
    `;
    resumen.appendChild(div);
  });

  // Gráfico de Producción por Variedad
  const ctxProd = document.getElementById('graficoProduccion').getContext('2d');
  new Chart(ctxProd, {
    type: 'bar',
    data: {
      labels: Object.keys(totalPorVariedad),
      datasets: [{
        label: 'Kilos por variedad',
        data: Object.values(totalPorVariedad),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Gráfico de Beneficio por Campo
  const ctxBenef = document.getElementById('graficoBeneficio').getContext('2d');
  new Chart(ctxBenef, {
    type: 'pie',
    data: {
      labels: Object.keys(totalPorCampo),
      datasets: [{
        label: 'Beneficio por campo',
        data: Object.values(totalPorCampo).map(c => c.beneficio),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  });

  // Exportar a Excel
  window.exportarExcel = function () {
    let csv = "Campo,Variedad,Kilos,Precio,Fecha,Observaciones\n";
    producciones.forEach(p => {
      csv += `"${p.campo}","${p.variedad}",${p.kilos},${p.precio},"${p.fecha}","${p.observaciones}"\n`;
    });

    csv += "\nCampo,Tipo de Gasto,Importe,Fecha,Notas\n";
    gastos.forEach(g => {
      csv += `"${g.campo}","${g.tipo}",${g.importe},"${g.fecha}","${g.notas}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "creapp_datos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar a PDF
  window.exportarPDF = function () {
    const resumenTexto = document.getElementById("resumenCampos").innerText;
    const nuevaVentana = window.open('', '_blank');
    nuevaVentana.document.write(`<pre>${resumenTexto}</pre>`);
    nuevaVentana.document.close();
    nuevaVentana.print();
  };
});
