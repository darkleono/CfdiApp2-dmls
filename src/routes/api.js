const express = require('express');
const router = express.Router();
const { validateCfdi } = require('../utils/validateCfdi');
const convert = require('xml-js');

// Ruta para validar CFDI mediante JSON
router.post('/validate-cfdi', async (req, res) => {
  const { rfcEmisor, rfcReceptor, total, uuid } = req.body;

  if (!rfcEmisor || !rfcReceptor || !total || !uuid) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await validateCfdi([rfcEmisor, rfcReceptor, total, uuid]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al validar CFDI: ' + error.message });
  }
});

// Ruta para validar CFDI mediante XML
router.post('/validar-xml', express.text({ type: 'application/xml' }), async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'No XML data received' });
  }

  const xmlContent = req.body;

  try {
    // Convertir XML a JSON
    const jsonData = JSON.parse(convert.xml2json(xmlContent, { compact: true, spaces: 4 }));

    // Extraer parámetros del JSON
    let comprobante = null;
    for (const key in jsonData) {
      if (key.includes("Comprobante")) {
        comprobante = jsonData[key];
        break;
      }
    }

    if (!comprobante) {
      return res.status(400).json({ error: "No se encontró el nodo Comprobante en el XML." });
    }

    const rfc_emisor = comprobante['cfdi:Emisor']['_attributes']['Rfc'];
    const rfc_receptor = comprobante['cfdi:Receptor']['_attributes']['Rfc'];
    const total = comprobante['_attributes']['Total'];
    const folio_fiscal = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID'];

    // Validar RFC
    if (!/^([A-ZÑ&]{3,4})[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z\d]{3})$/.test(rfc_emisor) ||
      !/^([A-ZÑ&]{3,4})[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z\d]{3})$/.test(rfc_receptor)) {
      return res.status(400).json({ error: 'RFC inválido' });
    }

    // Validar los parámetros 
    if (!rfc_emisor || !rfc_receptor || !total || !folio_fiscal) {
      return res.status(400).json({ error: 'Datos de comprobante faltantes o inválidos' });
    }

    // Llamar a tu función validateCfdi 
    const result = await validateCfdi([
      rfc_emisor,
      rfc_receptor,
      total,
      folio_fiscal
    ]);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error al procesar el XML:', error);
    res.status(500).json({ error: 'Error al procesar el XML: ' + error.message });
  }
});

module.exports = router;
