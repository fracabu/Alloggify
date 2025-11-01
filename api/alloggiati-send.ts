const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, schedina } = req.body;

        if (!token || !schedina) {
            return res.status(400).json({ error: 'Missing required fields: token, schedina' });
        }

        // Build SOAP envelope (corrected format from official documentation)
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:Send>
      <all:token>${escapeXml(token)}</all:token>
      <all:schedine>${escapeXml(schedina)}</all:schedine>
    </all:Send>
  </soap:Body>
</soap:Envelope>`;

        const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
            },
            body: soapEnvelope,
        });

        const xmlText = await response.text();

        // Check for SOAP fault
        if (xmlText.includes('soap:Fault') || xmlText.includes('soap12:Fault')) {
            const faultMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/);
            const faultMessage = faultMatch ? faultMatch[1] : 'Errore invio';
            return res.status(400).json({
                success: false,
                message: faultMessage
            });
        }

        // Extract result and ricevuta
        const resultMatch = xmlText.match(/<SendResult>(.*?)<\/SendResult>/s);
        const ricevutaMatch = xmlText.match(/<ricevuta>(.*?)<\/ricevuta>/);

        const resultText = resultMatch ? resultMatch[1] : '';
        const ricevuta = ricevutaMatch ? ricevutaMatch[1] : undefined;

        return res.status(200).json({
            success: true,
            message: 'Schedina inviata con successo!',
            ricevuta,
            rawResult: resultText
        });

    } catch (error: any) {
        console.error('Error in alloggiati-send:', error);
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
