/**
 * Alloggiati Web - Unified SOAP API Endpoint
 * POST /api/alloggiati
 *
 * Handles all SOAP operations via 'action' parameter:
 * - action: 'auth' → Generate token
 * - action: 'test' → Validate schedina
 * - action: 'send' → Submit schedina
 * - action: 'ricevuta' → Download receipt
 * - action: 'tabelle' → Download reference tables
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { escapeXml, callSoap } from '../lib/soap';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse body if string
        let body = req.body;

        console.log('[ALLOGGIATI] Raw body type:', typeof body);
        console.log('[ALLOGGIATI] Raw body:', body ? JSON.stringify(body).substring(0, 200) : 'empty');

        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error('[ALLOGGIATI] JSON parse error:', e);
                return res.status(400).json({ error: 'Invalid JSON body' });
            }
        }

        const { action } = body || {};

        console.log('[ALLOGGIATI] Action:', action);

        if (!action) {
            return res.status(400).json({
                error: 'Missing required field: action',
                validActions: ['auth', 'test', 'send', 'ricevuta', 'tabelle'],
                receivedBody: body
            });
        }

        // Route to appropriate handler
        switch (action) {
            case 'auth':
                return await handleAuth(body, res);
            case 'test':
                return await handleTest(body, res);
            case 'send':
                return await handleSend(body, res);
            case 'ricevuta':
                return await handleRicevuta(body, res);
            case 'tabelle':
                return await handleTabelle(body, res);
            default:
                return res.status(400).json({
                    error: `Unknown action: ${action}`,
                    validActions: ['auth', 'test', 'send', 'ricevuta', 'tabelle']
                });
        }

    } catch (error: any) {
        console.error('[ALLOGGIATI] Error:', error.message);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// ============================================
// AUTH - Generate Token
// ============================================
async function handleAuth(body: any, res: VercelResponse) {
    console.log('[AUTH] Starting authentication request');
    console.log('[AUTH] Body keys:', Object.keys(body || {}));

    const { utente, password, wskey } = body;

    console.log('[AUTH] Extracted - utente:', utente ? 'present' : 'missing');
    console.log('[AUTH] Extracted - password:', password ? 'present' : 'missing');
    console.log('[AUTH] Extracted - wskey:', wskey ? 'present' : 'missing');

    if (!utente || !password || !wskey) {
        return res.status(400).json({
            error: 'Missing required fields: utente, password, wskey',
            received: { utente: !!utente, password: !!password, wskey: !!wskey }
        });
    }

    console.log('[AUTH] Credentials received for user:', utente);

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

    const xmlText = await callSoap(soapEnvelope, 'GenerateToken');

    const tokenMatch = xmlText.match(/<token>(.*?)<\/token>/s);
    const expiresMatch = xmlText.match(/<expires>(.*?)<\/expires>/s);

    if (!tokenMatch || !expiresMatch) {
        return res.status(500).json({
            error: 'Invalid response: missing token or expires',
            response: xmlText.substring(0, 500)
        });
    }

    console.log('[AUTH] ✅ Token generated successfully');

    return res.status(200).json({
        success: true,
        token: tokenMatch[1],
        scadenza: expiresMatch[1]
    });
}

// ============================================
// TEST - Validate Schedina
// ============================================
async function handleTest(body: any, res: VercelResponse) {
    const { utente, token, schedine } = body;

    if (!utente || !token || !schedine) {
        return res.status(400).json({
            error: 'Missing required fields: utente, token, schedine'
        });
    }

    const schedineArray = Array.isArray(schedine) ? schedine : [schedine];
    const elencoSchedineXml = schedineArray.map((s: string) =>
        `<all:string>${escapeXml(s)}</all:string>`
    ).join('\n            ');

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:Test>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:token>${escapeXml(token)}</all:token>
      <all:ElencoSchedine>
            ${elencoSchedineXml}
      </all:ElencoSchedine>
    </all:Test>
  </soap:Body>
</soap:Envelope>`;

    const xmlText = await callSoap(soapEnvelope, 'Test');

    const resultMatch = xmlText.match(/<result>(.*?)<\/result>/s);
    const resultXml = resultMatch ? resultMatch[1] : '';

    const schedineValideMatch = resultXml.match(/<SchedineValide>(.*?)<\/SchedineValide>/);
    const schedineValide = schedineValideMatch ? parseInt(schedineValideMatch[1]) : 0;

    const dettaglioMatch = resultXml.match(/<Dettaglio>(.*?)<\/Dettaglio>/s);
    const dettaglioXml = dettaglioMatch ? dettaglioMatch[1] : '';

    const esitoOpMatch = dettaglioXml.match(/<EsitoOperazioneServizio>(.*?)<\/EsitoOperazioneServizio>/s);
    const esitoOpXml = esitoOpMatch ? esitoOpMatch[1] : '';

    const esitoMatch = esitoOpXml.match(/<esito>(.*?)<\/esito>/);
    const esito = esitoMatch ? esitoMatch[1] === 'true' : false;

    const errorDesMatch = esitoOpXml.match(/<ErroreDes>(.*?)<\/ErroreDes>/);
    const errorDettaglioMatch = esitoOpXml.match(/<ErroreDettaglio>(.*?)<\/ErroreDettaglio>/);

    const errorDes = errorDesMatch ? errorDesMatch[1] : '';
    const errorDettaglio = errorDettaglioMatch ? errorDettaglioMatch[1] : '';

    if (!esito || schedineValide === 0) {
        return res.status(200).json({
            success: false,
            message: errorDettaglio ? `${errorDes}: ${errorDettaglio}` : 'Errore durante la validazione'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Validazione completata con successo! ✅'
    });
}

// ============================================
// SEND - Submit Schedina
// ============================================
async function handleSend(body: any, res: VercelResponse) {
    console.log('[SEND] ===== NEW SEND REQUEST =====');

    const { utente, token, schedine } = body;

    if (!utente || !token || !schedine) {
        return res.status(400).json({
            error: 'Missing required fields: utente, token, schedine'
        });
    }

    const schedineArray = Array.isArray(schedine) ? schedine : [schedine];
    const elencoSchedineXml = schedineArray.map((s: string) =>
        `<all:string>${escapeXml(s)}</all:string>`
    ).join('\n            ');

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:Send>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:token>${escapeXml(token)}</all:token>
      <all:ElencoSchedine>
            ${elencoSchedineXml}
      </all:ElencoSchedine>
    </all:Send>
  </soap:Body>
</soap:Envelope>`;

    const xmlText = await callSoap(soapEnvelope, 'Send');

    const resultMatch = xmlText.match(/<result>(.*?)<\/result>/s);
    const resultXml = resultMatch ? resultMatch[1] : '';

    const schedineValideMatch = resultXml.match(/<SchedineValide>(.*?)<\/SchedineValide>/);
    const schedineValide = schedineValideMatch ? parseInt(schedineValideMatch[1]) : 0;

    const dettaglioMatch = resultXml.match(/<Dettaglio>(.*?)<\/Dettaglio>/s);
    const dettaglioXml = dettaglioMatch ? dettaglioMatch[1] : '';

    const esitoOpMatch = dettaglioXml.match(/<EsitoOperazioneServizio>(.*?)<\/EsitoOperazioneServizio>/s);
    const esitoOpXml = esitoOpMatch ? esitoOpMatch[1] : '';

    const esitoMatch = esitoOpXml.match(/<esito>(.*?)<\/esito>/);
    const esito = esitoMatch ? esitoMatch[1] === 'true' : false;

    const errorDesMatch = esitoOpXml.match(/<ErroreDes>(.*?)<\/ErroreDes>/);
    const errorDettaglioMatch = esitoOpXml.match(/<ErroreDettaglio>(.*?)<\/ErroreDettaglio>/);

    const errorDes = errorDesMatch ? errorDesMatch[1] : '';
    const errorDettaglio = errorDettaglioMatch ? errorDettaglioMatch[1] : '';

    const ricevutaMatch = xmlText.match(/<ricevuta>(.*?)<\/ricevuta>/);
    const ricevuta = ricevutaMatch ? ricevutaMatch[1] : undefined;

    if (!esito || schedineValide === 0) {
        return res.status(200).json({
            success: false,
            message: errorDettaglio ? `${errorDes}: ${errorDettaglio}` : 'Errore durante l\'invio',
            ricevuta: undefined
        });
    }

    console.log('[SEND] ✅ Schedina inviata con successo!');

    return res.status(200).json({
        success: true,
        message: `Schedina inviata con successo! ${schedineValide} schedina/e accettata/e ✅`,
        ricevuta
    });
}

// ============================================
// RICEVUTA - Download Receipt PDF
// ============================================
async function handleRicevuta(body: any, res: VercelResponse) {
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

    const pdfMatch = xmlText.match(/<PDF>(.*?)<\/PDF>/s);

    if (!pdfMatch || !pdfMatch[1]) {
        return res.status(404).json({
            success: false,
            message: 'Nessuna ricevuta disponibile per questa data'
        });
    }

    console.log('[RICEVUTA] ✅ Receipt downloaded successfully');

    return res.status(200).json({
        success: true,
        message: 'Ricevuta scaricata con successo',
        pdf: pdfMatch[1]
    });
}

// ============================================
// TABELLE - Download Reference Tables
// ============================================
async function handleTabelle(body: any, res: VercelResponse) {
    const { utente, token, tipo } = body;

    if (!utente || !token || tipo === undefined) {
        return res.status(400).json({
            error: 'Missing required fields: utente, token, tipo'
        });
    }

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

    const xmlText = await callSoap(soapEnvelope, 'Tabella');

    const csvMatch = xmlText.match(/<CSV>(.*?)<\/CSV>/s);
    const csvData = csvMatch ? csvMatch[1] : '';

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
}
