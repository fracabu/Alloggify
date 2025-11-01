import type { VercelRequest, VercelResponse } from '@vercel/node';

const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, schedina } = req.body;

        if (!token || !schedina) {
            return res.status(400).json({ error: 'Missing required fields: token, schedina' });
        }

        // Build SOAP envelope
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <Test xmlns="https://alloggiatiweb.poliziadistato.it/service/">
      <token>${escapeXml(token)}</token>
      <schedine>${escapeXml(schedina)}</schedine>
    </Test>
  </soap12:Body>
</soap12:Envelope>`;

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
            const faultMessage = faultMatch ? faultMatch[1] : 'Errore validazione';
            return res.status(400).json({
                success: false,
                message: faultMessage
            });
        }

        // Extract result
        const resultMatch = xmlText.match(/<TestResult>(.*?)<\/TestResult>/s);
        const resultText = resultMatch ? resultMatch[1] : '';

        const isSuccess = resultText.toLowerCase().includes('ok') ||
                         resultText.toLowerCase().includes('success');

        return res.status(200).json({
            success: isSuccess,
            message: isSuccess ? 'Validazione completata con successo' : (resultText || 'Errore durante la validazione')
        });

    } catch (error) {
        console.error('Error in alloggiati-test:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
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
