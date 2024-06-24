const cfdiForm = document.getElementById('cfdi-form');
const cfdiResults = document.getElementById('cfdi-results');
const uploadInput = document.getElementById('upload-xml');
const processButton = document.getElementById('process-xml');

// Manejo del cambio de tema
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const formContainer = document.querySelector('.form-container');
const elementsToToggle = [
  body, formContainer, ...document.querySelectorAll('h2, label, input, button, .results')
];

themeToggle.addEventListener('click', () => {
  elementsToToggle.forEach(element => element.classList.toggle('dark'));
});

// Manejo del cambio de pestaña
$('.nav-tabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
  
  // Limpiar resultados al cambiar de pestaña
  limpiarResultados();
});

// Función para validar el CFDI con la API (usando datos del formulario)
async function validarCFDIDatos(rfc_emisor, rfc_receptor, total, folio_fiscal) {
  try {
    const response = await fetch('/api/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfc_emisor,
        rfc_receptor,
        total,
        folio_fiscal,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al validar el CFDI');
    }

    const data = await response.json();

    // Extraer los datos relevantes 
    const estado = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"];
    const cancelable = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"];
    const codigoEstatus = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"];
    const estatusCancelacion = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EstatusCancelacion"]["_text"];

    mostrarResultado(estado, cancelable, codigoEstatus, estatusCancelacion);
  } catch (error) {
    mostrarError(error.message);
  }
}

// Función para mostrar resultados
function mostrarResultado(estado, cancelable, codigoEstatus, estatusCancelacion) {
  cfdiResults.innerHTML = `
    <h3>Resultados:</h3>
    <p><strong>Estado:</strong> ${estado}</p>
    <p><strong>Cancelable:</strong> ${cancelable}</p>
    <p><strong>Código de Estatus:</strong> ${codigoEstatus}</p>
    ${cancelable !== 'Cancelable con aceptación' ? `<p><strong>Estatus de Cancelación:</strong> ${estatusCancelacion || 'No disponible'}</p>` : ''}
  `;
}

// Función para mostrar mensaje de error
function mostrarError(mensaje) {
  cfdiResults.innerHTML = `
    <h3>Error:</h3>
    <p>${mensaje}</p>
  `;
}

// Función para limpiar resultados
function limpiarResultados() {
  cfdiResults.innerHTML = '';
}

// Manejo del formulario
cfdiForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const rfc_emisor = document.getElementById('rfc_emisor').value;
  const rfc_receptor = document.getElementById('rfc_receptor').value;
  const total = document.getElementById('total').value;
  const folio_fiscal = document.getElementById('folio_fiscal').value;

  // Validación manual del total
  if (!/^\d+\.\d{2}$/.test(total)) {
    mostrarError('El total debe ser un número decimal con dos decimales.');
    return;
  }

  // Limpiar resultados previos
  limpiarResultados();

  // Llamar a la función para validar el CFDI
  validarCFDIDatos(rfc_emisor, rfc_receptor, total, folio_fiscal);
});

// Manejo de la carga del archivo XML
processButton.addEventListener('click', async () => {
  const file = uploadInput.files[0];

  if (file) {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const xmlContent = e.target.result;

        try {
          // Enviar el contenido XML como texto plano
          const response = await fetch('/api/validar-xml', {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml' // Importante: Especificar el tipo de contenido
            },
            body: xmlContent
          });

          if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
          }

          const data = await response.json();

          // Extraer los datos relevantes 
          const estado = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:Estado"]["_text"];
          const cancelable = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EsCancelable"]["_text"];
          const codigoEstatus = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:CodigoEstatus"]["_text"];
          const estatusCancelacion = data["s:Envelope"]["s:Body"]["ConsultaResponse"]["ConsultaResult"]["a:EstatusCancelacion"]["_text"];

          mostrarResultado(estado, cancelable, codigoEstatus, estatusCancelacion);

        } catch (error) {
          mostrarError(error.message);
        }
      };
      reader.readAsText(file);

    } catch (error) {
      mostrarError(error.message);
    }
  } else {
    mostrarError('Por favor, selecciona un archivo XML.');
  }
});
