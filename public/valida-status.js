const cfdiForm = document.getElementById('cfdi-form');
const cfdiResults = document.getElementById('cfdi-results');

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
});