const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { utente, password, wskey } = req.body;

        if (!utente || !password || !wskey) {
            return res.status(400).json({ error: 'Missing required fields: utente, password, wskey' });
        }

        // Build SOAP envelope
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GenerateToken xmlns="https://alloggiatiweb.poliziadistato.it/service/">
      <utente>${escapeXml(utente)}</utente>
      <password>${escapeXml(password)}</password>
      <wskey>${escapeXml(wskey)}</wskey>
    </GenerateToken>
  </soap12:Body>
</soap12:Envelope>`;

        // Call SOAP service
        console.log('Calling SOAP endpoint:', SOAP_ENDPOINT);
        console.log('SOAP Request:', soapEnvelope);

        const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
                'SOAPAction': 'https://alloggiatiweb.poliziadistato.it/service/GenerateToken',
            },
            body: soapEnvelope,
        });

        console.log('SOAP Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SOAP Error Response:', errorText.substring(0, 1000));
            return res.status(response.status).json({
                error: `SOAP service error: ${response.status} ${response.statusText}`,
                details: errorText.substring(0, 500)
            });
        }

        const xmlText = await response.text();

        console.log('SOAP Response received:', xmlText.substring(0, 500));

        // Check for SOAP fault first
        if (xmlText.includes('soap:Fault') || xmlText.includes('soap12:Fault')) {
            const faultMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/);
            const faultMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';
            console.error('SOAP Fault:', faultMessage);
            return res.status(400).json({ error: `SOAP Fault: ${faultMessage}` });
        }

        // Parse XML response
        const tokenMatch = xmlText.match(/<token>(.*?)<\/token>/s);
        const scadenzaMatch = xmlText.match(/<scadenza>(.*?)<\/scadenza>/s);

        if (!tokenMatch || !scadenzaMatch) {
            return res.status(500).json({
                error: 'Invalid response: missing token or scadenza',
                response: xmlText.substring(0, 500) // First 500 chars for debugging
            });
        }

        const token = tokenMatch[1];
        const scadenza = scadenzaMatch[1];

        return res.status(200).json({
            success: true,
            token,
            scadenza
        });

    } catch (error: any) {
        console.error('Error in alloggiati-auth:', error);
        return res.status(500).json({
            error: error?.message || 'Internal server error',
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
