const url = "https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc";

const headers = {
  "user-agent": "sampleTest",
  "Content-Type": "text/xml;charset=UTF-8",
  soapAction: "http://tempuri.org/IConsultaCFDIService/Consulta",
};

const xml = (values) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
     <soapenv:Header/>
     <soapenv:Body>
        <tem:Consulta>
           <tem:expresionImpresa><![CDATA[?re=${values[0]}?rr=${values[1]}?tt=${values[2]}?id=${values[3]}]]>
           </tem:expresionImpresa>
        </tem:Consulta>
     </soapenv:Body>
  </soapenv:Envelope>`;
};

const errors = {
  apiTimeOut: "Error de conexión con el servicio",
  noFormatData: "Bad request",
};

module.exports = { url, headers, xml, errors };
