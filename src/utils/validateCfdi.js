const convert = require('xml-js');
const soapRequest = require('easy-soap-request');
const { url, headers, xml, errors } = require('../../const');

async function validateCfdi(values) {
  try {
    const { response } = await soapRequest({ url, headers, xml: xml(values) });
    const { body } = response;
    return convert.xml2json(body, { compact: true, spaces: 4 });
  } catch (error) {
    console.error(error);
    throw new Error(errors.apiTimeOut);
  }
}

module.exports = { validateCfdi };