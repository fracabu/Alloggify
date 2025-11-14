/**
 * Alloggiati Web - Ricevuta Endpoint
 * POST /api/alloggiati/ricevuta
 *
 * Downloads receipt PDF for a specific date
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { escapeXml, callSoap } from '../../lib/soap';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse body if string
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch {
                return res.status(400).json({ error: 'Invalid JSON body' });
            }
        }

        const { utente, token, data } = body;

        if (!utente || !token || !data) {
            return res.status(400).json({
                error: 'Missing required fields: utente, token, data'
            });
        }

        console.log('[RICEVUTA] Requesting receipt for date:', data);

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

        const xmlText = await callSoap(soapEnvelope, 'Ricevuta');

        // Extract PDF (base64 encoded byte array)
        const pdfMatch = xmlText.match(/<PDF>(.*?)<\/PDF>/s);

        if (!pdfMatch || !pdfMatch[1]) {
            return res.status(404).json({
                success: false,
                message: 'Nessuna ricevuta disponibile per questa data'
            });
        }

        const pdfBase64 = pdfMatch[1];

        console.log('[RICEVUTA] ✅ Receipt downloaded successfully');

        return res.status(200).json({
            success: true,
            message: 'Ricevuta scaricata con successo',
            pdf: pdfBase64
        });

    } catch (error: any) {
        console.error('[RICEVUTA] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}
