/**
 * Alloggiati Web - Tabelle Endpoint
 * POST /api/alloggiati/tabelle
 *
 * Downloads reference tables (Luoghi, Tipi Documento, etc.)
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

        const { utente, token, tipo } = body;

        if (!utente || !token || tipo === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: utente, token, tipo'
            });
        }

        // Map numeric tipo to table name
        const tipoMap: { [key: number]: string } = {
            0: 'Luoghi',
            1: 'Tipi_Documento',
            2: 'Tipi_Alloggiato',
            3: 'TipoErrore',
            4: 'ListaAppartamenti'
        };

        const tipoName = typeof tipo === 'number' ? tipoMap[tipo] : tipo;

        console.log('[TABELLE] Downloading table:', tipoName);

        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:Tabella>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:token>${escapeXml(token)}</all:token>
      <all:tipo>${escapeXml(tipoName)}</all:tipo>
    </all:Tabella>
  </soap:Body>
</soap:Envelope>`;

        console.log('[TABELLE] SOAP Request:', soapEnvelope);

        const xmlText = await callSoap(soapEnvelope, 'Tabella');

        console.log('[TABELLE] SOAP Response:', xmlText);

        // Extract CSV data
        const csvMatch = xmlText.match(/<CSV>(.*?)<\/CSV>/s);
        const csvData = csvMatch ? csvMatch[1] : '';

        // Extract result
        const resultMatch = xmlText.match(/<TabellaResult>(.*?)<\/TabellaResult>/s);
        const resultXml = resultMatch ? resultMatch[1] : '';

        const esitoMatch = resultXml.match(/<esito>(.*?)<\/esito>/);
        const esito = esitoMatch ? esitoMatch[1] === 'true' : false;

        if (!esito || !csvData) {
            return res.status(200).json({
                success: false,
                message: 'Errore scaricamento tabella'
            });
        }

        console.log('[TABELLE] ✅ Table downloaded successfully');

        return res.status(200).json({
            success: true,
            data: csvData
        });

    } catch (error: any) {
        console.error('[TABELLE] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}
