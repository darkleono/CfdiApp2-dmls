const express = require("express");
const router = express.Router();
const { validateCfdi } = require("../utils/validateCfdi");
const { errors } = require("../../const");

router.get("/status/:rfc_emisor/:rfc_receptor/:total/:folio_fiscal", async (req, res) => {
  const values = [];
  const { rfc_emisor, rfc_receptor, total, folio_fiscal } = req.params;

  if (!rfc_emisor || !rfc_receptor || !total || !folio_fiscal) {
    return res.status(400).json({ error: errors.noFormatData });
  }

  values[0] = rfc_emisor.toLowerCase().replace(/&/gi, "&amp;").replace(/ñ/gi, "&ntilde;");
  values[1] = rfc_receptor.toLowerCase().replace(/&/gi, "&amp;").replace(/ñ/gi, "&ntilde;");
  values[2] = total.toLowerCase().replace(/&/gi, "&amp;").replace(/ñ/gi, "&ntilde;");
  values[3] = folio_fiscal.toLowerCase().replace(/&/gi, "&amp;").replace(/ñ/gi, "&ntilde;");

  try {
    const result = await validateCfdi(values);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
