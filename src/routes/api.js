const express = require('express');
const router = express.Router();
const { validateCfdi } = require('../utils/validateCfdi');
const { errors } = require('../../const');
const convert = require('xml-js');

// Ruta para validar CFDI mediante parámetros
router.post('/status', async (req, res) => {
  const { rfc_emisor, rfc_receptor, total, folio_fiscal } = req.body;

  // Validar los parámetros
  if (!rfc_emisor || !rfc_receptor || !total || !folio_fiscal) {
    return res.status(400).json({ error: errors.noFormatData });
  }

  // Validar RFC
  if (!/^([A-ZÑ&]{3,4})[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z\d]{3})$/.test(rfc_emisor) ||
      !/^([A-ZÑ&]{3,4})[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z\d]{3})$/.test(rfc_receptor)) {
    return res.status(400).json({ error: 'RFC inválido' });
  }

  try {
    const result = await validateCfdi([
      rfc_emisor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      rfc_receptor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      total, // No se debe convertir a minúsculas
      folio_fiscal.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ')
    ]);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para validar CFDI mediante XML
router.post('/validar-xml', express.text({ type: 'text/xml' }), async (req, res) => {
  try {
    // 1. Obtener el contenido XML del cuerpo de la solicitud
    const xmlContent = req.body;

    // 2. Validar que se recibió contenido XML
    if (!xmlContent) {
      return res.status(400).json({ error: 'No se proporcionó ningún contenido XML.' });
    }

    // 3. Convertir XML a JSON
    const jsonData = JSON.parse(convert.xml2json(xmlContent, { compact: true, spaces: 4 }));

    // 4. Extraer parámetros del JSON
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
      return res.status(400).json({ error: errors.noFormatData });
    }

    // Llamar a tu función validateCfdi 
    const result = await validateCfdi([
      rfc_emisor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      rfc_receptor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      total, // No se debe convertir a minúsculas
      folio_fiscal.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ')
    ]);

    // Enviar respuesta
    res.status(200).send(result);

  } catch (error) {
    console.error('Error al procesar el XML:', error);
    res.status(500).json({ error: 'Error al procesar el XML: ' + error.message });
  }
});

module.exports = router;
