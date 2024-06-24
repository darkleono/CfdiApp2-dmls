const cfdiForm = document.getElementById('cfdi-form');
const cfdiResults = document.getElementById('cfdi-results');
const uploadInput = document.getElementById('upload-xml');
const processButton = document.getElementById('process-xml');

// Manejo del cambio de tema
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const formContainer = document.querySelector('.form-container');
const h2Elements = document.querySelectorAll('h2');
const labelElements = document.querySelectorAll('label');
const inputElements = document.querySelectorAll('input');
const buttonElements = document.querySelectorAll('button');
const resultsElements = document.querySelectorAll('.results');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  formContainer.classList.toggle('dark');
  h2Elements.forEach(h2 => h2.classList.toggle('dark'));
  labelElements.forEach(label => label.classList.toggle('dark'));
  inputElements.forEach(input => input.classList.toggle('dark'));
  buttonElements.forEach(button => button.classList.toggle('dark'));
  resultsElements.forEach(results => results.classList.toggle('dark'));
});

// Manejo del cambio de pestaña
$('.nav-tabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
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

    cfdiResults.innerHTML = `
      <h3>Resultados:</h3>
      <p><strong>Estado:</strong> ${estado}</p>
      <p><strong>Cancelable:</strong> ${cancelable}</p>
      <p><strong>Código de Estatus:</strong> ${codigoEstatus}</p>
      ${cancelable !== 'Cancelable con aceptación' ? `<p><strong>Estatus de Cancelación:</strong> ${estatusCancelacion || 'No disponible'}</p>` : ''}
    `;
  } catch (error) {
    cfdiResults.innerHTML = `
      <h3>Error:</h3>
      <p>${error.message}</p>
    `;
  }
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
    cfdiResults.innerHTML = `
      <h3>Error:</h3>
      <p>El total debe ser un número decimal con dos decimales.</p>
    `;
    return;
  }

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

          // Mostrar la respuesta del servidor
          cfdiResults.innerHTML = `
            <h3>Respuesta del servidor:</h3>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          `;

        } catch (error) {
          cfdiResults.innerHTML = `
            <h3>Error:</h3>
            <p>${error.message}</p>
          `;
        }
      };
      reader.readAsText(file);

    } catch (error) {
      cfdiResults.innerHTML = `
        <h3>Error:</h3>
        <p>${error.message}</p>
      `;
    }
  } else {
    cfdiResults.innerHTML = '<p>Por favor, selecciona un archivo XML.</p>';
  }
});