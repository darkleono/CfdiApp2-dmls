document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('validate-form').addEventListener('submit', validateForm);
  document.getElementById('process-xml').addEventListener('click', processXml);
  document.getElementById('validate-folder').addEventListener('click', validateFolder);
});

function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

async function validateForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const data = {
    rfcEmisor: formData.get('rfcEmisor'),
    rfcReceptor: formData.get('rfcReceptor'),
    total: formData.get('total'),
    uuid: formData.get('uuid')
  };

  const response = await fetch('/api/validate-cfdi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  document.getElementById('form-result').textContent = JSON.stringify(result, null, 2);
}

async function processXml() {
  const fileInput = document.getElementById('xml-file');
  if (!fileInput.files.length) {
    alert('Por favor selecciona un archivo XML.');
    return;
  }

  const file = fileInput.files[0];
  const xmlContent = await file.text();

  const response = await fetch('/api/validar-xml', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    body: xmlContent
  });

  const result = await response.json();
  document.getElementById('xml-result').textContent = JSON.stringify(result, null, 2);
}

async function validateFolder() {
  const fileInput = document.getElementById('folder-files');
  const files = fileInput.files;

  if (!files.length) {
    alert('Por favor selecciona una carpeta con archivos XML.');
    return;
  }

  const tableBody = document.querySelector('#folder-files-table tbody');
  tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

  for (const file of files) {
    if (file.type !== 'text/xml') continue;

    const row = document.createElement('tr');
    const fileNameCell = document.createElement('td');
    const statusCell = document.createElement('td');

    fileNameCell.textContent = file.name;
    statusCell.textContent = 'Validando...';

    row.appendChild(fileNameCell);
    row.appendChild(statusCell);
    tableBody.appendChild(row);

    try {
      const xmlContent = await file.text();

      const response = await fetch('/api/validar-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: xmlContent
      });

      const result = await response.json();
      statusCell.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      statusCell.textContent = 'Error: ' + error.message;
    }
  }
}
