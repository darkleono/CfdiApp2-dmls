document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("validate-form").addEventListener("submit", validateForm);
  document.getElementById("process-xml").addEventListener("click", processXml);
  document.getElementById("validate-folder").addEventListener("click", validateFolder);

  // Agregar evento "change" al input de tipo "file" para el contador
  const folderInput = document.getElementById("folder-files");
  folderInput.addEventListener("change", function () {
    const files = this.files;
    let xmlCount = 0;
    for (const file of files) {
      if (file.type === "text/xml") {
        xmlCount++;
      }
    }

    // Mostrar contador en el HTML
    const folderTab = document.getElementById("folder-tab");
    const tablaArchivos = document.getElementById("folder-files-table");
    const contadorElemento = folderTab.querySelector(".contador-xml");

    if (contadorElemento) {
      contadorElemento.textContent = `Archivos XML encontrados: ${xmlCount}`;
    } else {
      const nuevoContador = document.createElement("p");
      nuevoContador.classList.add("contador-xml");
      nuevoContador.textContent = `Archivos XML encontrados: ${xmlCount}`;
      folderTab.insertBefore(nuevoContador, tablaArchivos);
    }
  });

  // Agregar evento "change" al input de tipo "file" para mostrar el nombre
  document.getElementById("xml-file").addEventListener("change", function () {
    const fileInput = this;
    if (fileInput.files.length) {
      const fileName = fileInput.files[0].name;
      const fileNameDisplay = document.createElement("p");
      fileNameDisplay.textContent = `Archivo seleccionado: ${fileName}`;
      fileNameDisplay.id = "nombre-archivo-seleccionado";

      const uploadTab = document.getElementById("upload-tab");
      const existingFileNameDisplay = uploadTab.querySelector("#nombre-archivo-seleccionado");
      if (existingFileNameDisplay) {
        uploadTab.replaceChild(fileNameDisplay, existingFileNameDisplay);
      } else {
        const processXmlButton = document.getElementById("process-xml");
        uploadTab.insertBefore(fileNameDisplay, processXmlButton.nextSibling);
      }
    } else {
      const uploadTab = document.getElementById("upload-tab");
      const fileNameDisplay = uploadTab.querySelector("#nombre-archivo-seleccionado");
      if (fileNameDisplay) {
        uploadTab.removeChild(fileNameDisplay);
      }
    }
  });

  // Alternar modo oscuro y cambiar ícono
  const toggleButton = document.getElementById("dark-mode-toggle");
  toggleButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const sunPath = document.getElementById("sun-path");
    const moonPath = document.getElementById("moon-path");

    if (document.body.classList.contains("dark-mode")) {
      sunPath.style.display = "block";
      moonPath.style.display = "none";
    } else {
      sunPath.style.display = "none";
      moonPath.style.display = "block";
    }
  });

  // Inicializar el ícono correctamente al cargar la página
  const sunPath = document.getElementById("sun-path");
  const moonPath = document.getElementById("moon-path");

  if (document.body.classList.contains("dark-mode")) {
    sunPath.style.display = "block";
    moonPath.style.display = "none";
  } else {
    sunPath.style.display = "none";
    moonPath.style.display = "block";
  }
});

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => (tab.style.display = "none"));
  document.getElementById(tabId).style.display = "block";
}

async function validateForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const data = {
    rfc_emisor: formData.get("rfcEmisor"),
    rfc_receptor: formData.get("rfcReceptor"),
    total: formData.get("total"),
    folio_fiscal: formData.get("uuid"),
  };

  try {
    const response = await fetch("/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const result = await response.json();
    const resultadoTexto = formatApiResponse(result);

    document.getElementById("form-result").textContent = resultadoTexto;
  } catch (error) {
    document.getElementById("form-result").textContent = "Error: " + error.message;
  }
}

async function processXml() {
  const fileInput = document.getElementById("xml-file");
  if (!fileInput.files.length) {
    alert("Por favor selecciona un archivo XML.");
    return;
  }

  const file = fileInput.files[0];
  const xmlContent = await file.text();

  try {
    const response = await fetch("/api/validar-xml", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: xmlContent,
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const result = await response.json();
    const resultadoTexto = formatApiResponse(result);

    document.getElementById("xml-result").textContent = resultadoTexto;
  } catch (error) {
    document.getElementById("xml-result").textContent = "Error: " + error.message;
  }
}

async function validateFolder() {
  const fileInput = document.getElementById("folder-files");
  const files = fileInput.files;

  if (!files.length) {
    alert("Por favor selecciona una carpeta con archivos XML.");
    return;
  }

  const tableBody = document.querySelector("#folder-files-table tbody");
  tableBody.innerHTML = "";

  for (const file of files) {
    if (file.type !== "text/xml") continue;

    const row = document.createElement("tr");
    const fileNameCell = document.createElement("td");
    const statusCell = document.createElement("td");

    fileNameCell.textContent = file.name;
    statusCell.textContent = "Validando...";

    row.appendChild(fileNameCell);
    row.appendChild(statusCell);
    tableBody.appendChild(row);

    try {
      const xmlContent = await file.text();

      const response = await fetch("/api/validar-xml", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
        },
        body: xmlContent,
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const result = await response.json();

      const resultadoTexto = formatApiResponse(result);

      statusCell.textContent = resultadoTexto;
    } catch (error) {
      statusCell.textContent = "Error: " + error.message;
    }
  }
}

function formatApiResponse(result) {
  const estado = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"];
  const cancelable = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"];
  const codigoEstatus = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"];
  const estatusCancelacion = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EstatusCancelacion"]["_text"];

  return `${estado}\n${cancelable}\n${codigoEstatus}\n${cancelable !== "Cancelable con aceptación" ? `${estatusCancelacion || "No disponible"}\n` : ""}`;
}
