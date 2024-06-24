const express = require('express');
const router = express.Router();
const { validateCfdi } = require('../utils/validateCfdi');
const { errors } = require('../../const');

router.post('/status', async (req, res) => {
  const { rfc_emisor, rfc_receptor, total, folio_fiscal } = req.body;

  // Validar los parámetros
  if (!rfc_emisor || !rfc_receptor || !total || !folio_fiscal) {
    return res.status(400).json({ error: errors.noFormatData });
  }

  try {
    const result = await validateCfdi([
      rfc_emisor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      rfc_receptor.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      total.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ'),
      folio_fiscal.toLowerCase().replace(/&/gi, '&').replace(/ñ/gi, 'ñ')
    ]);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;