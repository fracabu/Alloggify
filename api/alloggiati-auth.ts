const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

// Vercel serverless function configuration
export const config = {
    maxDuration: 30, // 30 seconds timeout
};

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[AUTH] Starting authentication request');
        console.log('[AUTH] Request method:', req.method);
        console.log('[AUTH] Request body keys:', Object.keys(req.body || {}));

        const { utente, password, wskey } = req.body;

        if (!utente || !password || !wskey) {
            console.error('[AUTH] Missing credentials:', { utente: !!utente, password: !!password, wskey: !!wskey });
            return res.status(400).json({ error: 'Missing required fields: utente, password, wskey' });
        }

        console.log('[AUTH] Credentials received for user:', utente);

        // Build SOAP envelope (corrected format from official documentation)
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:GenerateToken>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:Password>${escapeXml(password)}</all:Password>
      <all:WsKey>${escapeXml(wskey)}</all:WsKey>
    </all:GenerateToken>
  </soap:Body>
</soap:Envelope>`;

        // Call SOAP service
        console.log('Calling SOAP endpoint:', SOAP_ENDPOINT);
        console.log('SOAP Request:', soapEnvelope);

        const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
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
        const expiresMatch = xmlText.match(/<expires>(.*?)<\/expires>/s);

        if (!tokenMatch || !expiresMatch) {
            return res.status(500).json({
                error: 'Invalid response: missing token or expires',
                response: xmlText.substring(0, 500) // First 500 chars for debugging
            });
        }

        const token = tokenMatch[1];
        const scadenza = expiresMatch[1];

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
