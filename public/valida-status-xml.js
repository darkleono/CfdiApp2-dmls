// valida-status-xml.js
document.addEventListener('DOMContentLoaded', (event) => {
    const xmlInput = document.getElementById('xmlInput');
    const consultaBtn = document.getElementById('consultaBtn');
    const resultadoDiv = document.getElementById('cfdi-results-xml');
    
consultaBtn.addEventListener('click', () => {
  const file = xmlInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const xmlContent = e.target.result;

      try {
        // 1. Convertir XML a JSON (usando xml-js)
        const convert = require('xml-js'); 
        const jsonResult = convert.xml2json(xmlContent, { compact: true, spaces: 4 });

        // 2. Extraer datos del JSON (AJUSTA ESTO A TU ESTRUCTURA DE JSON)
        const rfcEmisor = jsonResult.Comprobante.Emisor.Rfc._text; 
        const rfcReceptor = jsonResult.Comprobante.Receptor.Rfc._text;
        const total = jsonResult.Comprobante.Total._text;
        const folioFiscal = jsonResult.Comprobante.Complemento.TimbreFiscalDigital.UUID._text; 

        // 3. Llamar a la API para validar el CFDI
        try {
          const response = await fetch('/api/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              rfc_emisor: rfcEmisor,
              rfc_receptor: rfcReceptor,
              total: total,
              folio_fiscal: folioFiscal,
            }),
          });

          if (!response.ok) {
            throw new Error('Error al validar el CFDI en la API');
          }

          const data = await response.json();

          // 4. Mostrar resultados (AJUSTA ESTO A LA RESPUESTA DE TU API)
          const estado = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"];
          const cancelable = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"];
          const codigoEstatus = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"];
          const estatusCancelacion = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EstatusCancelacion"]["_text"];

          resultadoDiv.innerHTML = `
            <h3>Resultados de la Consulta con XML:</h3>
            <p><strong>Estado:</strong> ${estado}</p>
            <p><strong>Cancelable:</strong> ${cancelable}</p>
            <p><strong>Código de Estatus:</strong> ${codigoEstatus}</p>
            ${cancelable !== 'Cancelable con aceptación' ? `<p><strong>Estatus de Cancelación:</strong> ${estatusCancelacion || 'No disponible'}</p>` : ''}
          `;


        } catch (error) {
          console.error("Error al consultar la API:", error);
          resultadoDiv.innerHTML = `<p>Error al validar el CFDI: ${error.message}</p>`;
        }

      } catch (error) {
        console.error("Error al procesar el XML:", error);
        resultadoDiv.innerHTML = "<p>Error al procesar el XML: Formato inválido o datos faltantes</p>";
      }
    };

    reader.readAsText(file);
  } else {
    alert("Por favor, selecciona un archivo XML.");
  }
});