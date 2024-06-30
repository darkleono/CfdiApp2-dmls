document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("validate-form")
		.addEventListener("submit", validateForm);
	document.getElementById("process-xml").addEventListener("click", processXml);
	document
		.getElementById("validate-folder")
		.addEventListener("click", validateFolder);
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

		// Mostrar valores en renglones separados (sin encabezado)
		const estado = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"];
		const cancelable = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"];
		const codigoEstatus = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"];
		const estatusCancelacion = result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EstatusCancelacion"]["_text"];

		const resultadoTexto = `${estado}\n${cancelable}\n${codigoEstatus}\n${
			cancelable !== "Cancelable con aceptación"
				? `${estatusCancelacion || "No disponible"}\n`
				: ""
		}`;

		document.getElementById("form-result").textContent =
			resultadoTexto;
	} catch (error) {
		document.getElementById("form-result").textContent =
			"Error: " + error.message;
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
				"Content-Type": "text/xml", // Tipo de contenido corregido
			},
			body: xmlContent,
		});

		if (!response.ok) {
			throw new Error(`Error en la solicitud: ${response.status}`);
		}

		const result = await response.json();

		// Mostrar resultado como texto plano
		const resultadoTexto = `
                Estado: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"]}
                Cancelable: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"]}
                Código de Estatus: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"]}
                ${
			result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"][
				"a:EsCancelable"
			]["_text"] !== "Cancelable con aceptación"
				? `Estatus de Cancelación: ${
						result["s:Envelope"]["s:Body"]["ConsultaResponse"][
							"ConsultaResult"
						]["a:EstatusCancelacion"]["_text"] || "No disponible"
				  }`
				: ""
		}
            `;
		document.getElementById("xml-result").textContent =
			resultadoTexto;
	} catch (error) {
		document.getElementById("xml-result").textContent =
			"Error: " + error.message;
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
					"Content-Type": "text/xml", // Tipo de contenido corregido
				},
				body: xmlContent,
			});

			if (!response.ok) {
				throw new Error(`Error en la solicitud: ${response.status}`);
			}
			const result = await response.json();

			// Mostrar resultado como texto plano
			const resultadoTexto = `
                Estado: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"]}
                Cancelable: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"]}
                Código de Estatus: ${result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"]}
                ${
			result["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"][
				"a:EsCancelable"
			]["_text"] !== "Cancelable con aceptación"
				? `Estatus de Cancelación: ${
						result["s:Envelope"]["s:Body"]["ConsultaResponse"][
							"ConsultaResult"
						]["a:EstatusCancelacion"]["_text"] || "No disponible"
				  }`
				: ""
		}
            `;
			statusCell.textContent = resultadoTexto;
		} catch (error) {
			statusCell.textContent = "Error: " + error.message;
		}
	}
}