const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { utente, token, data } = req.body;

        if (!utente || !token || !data) {
            return res.status(400).json({ error: 'Missing required fields: utente, token, data' });
        }

        // Build SOAP envelope (corrected format from official documentation)
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:Ricevuta>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:token>${escapeXml(token)}</all:token>
      <all:Data>${escapeXml(data)}</all:Data>
    </all:Ricevuta>
  </soap:Body>
</soap:Envelope>`;

        console.log('Calling SOAP Ricevuta endpoint:', SOAP_ENDPOINT);
        console.log('Data ricevuta:', data);

        const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
            },
            body: soapEnvelope,
        });

        console.log('SOAP Response status:', response.status);

        const xmlText = await response.text();

        // Check for SOAP fault
        if (xmlText.includes('soap:Fault') || xmlText.includes('soap12:Fault')) {
            const faultMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/);
            const faultMessage = faultMatch ? faultMatch[1] : 'Errore download ricevuta';
            console.error('SOAP Fault:', faultMessage);
            return res.status(400).json({
                success: false,
                message: faultMessage
            });
        }

        // Extract PDF (base64 encoded byte array)
        const pdfMatch = xmlText.match(/<PDF>(.*?)<\/PDF>/s);

        if (!pdfMatch || !pdfMatch[1]) {
            return res.status(404).json({
                success: false,
                message: 'Nessuna ricevuta disponibile per questa data'
            });
        }

        const pdfBase64 = pdfMatch[1];

        return res.status(200).json({
            success: true,
            message: 'Ricevuta scaricata con successo',
            pdf: pdfBase64
        });

    } catch (error: any) {
        console.error('Error in alloggiati-ricevuta:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        });
    }
}

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
