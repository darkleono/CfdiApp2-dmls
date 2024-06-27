const cfdiForm = document.getElementById('cfdi-form');
const cfdiResults = document.getElementById('cfdi-results');

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
    cfdiResults.innerHTML = `
      <h3>Resultados:</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (error) {
    cfdiResults.innerHTML = `
      <h3>Error:</h3>
      <p>${error.message}</p>
    `;
  }
});