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
 *
 * PROTECTED: Requires JWT authentication
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { escapeXml, callSoap } from '../lib/soap';
import { requireAuth } from '../lib/auth';
import { incrementScanCount, logScan, logUserAction } from '../lib/db';
import { decryptWskey } from '../lib/encryption';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ REQUIRE AUTHENTICATION
    const user = await requireAuth(req, res);
    if (!user) {
        // requireAuth already sent 401 response
        return;
    }

    console.log(`[ALLOGGIATI] Authenticated request from user: ${user.email} (${user.userId})`);


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

        // Route to appropriate handler (pass user for logging)
        switch (action) {
            case 'auth':
                return await handleAuth(body, user, res);
            case 'test':
                return await handleTest(body, user, res);
            case 'send':
                return await handleSend(body, user, res);
            case 'ricevuta':
                return await handleRicevuta(body, user, res);
            case 'tabelle':
                return await handleTabelle(body, user, res);
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
async function handleAuth(body: any, user: any, res: VercelResponse) {
    console.log('[AUTH] Starting authentication request');
    console.log('[AUTH] User:', user.email);
    console.log('[AUTH] Body keys:', Object.keys(body || {}));

    // Support both OLD (direct credentials) and NEW (property_id) methods
    let utente, password, wskey;

    if (body.propertyId) {
        // NEW METHOD: Get credentials from properties table
        const { propertyId } = body;

        const { rows } = await sql`
            SELECT wskey_encrypted, alloggiati_username, property_name
            FROM properties
            WHERE id = ${propertyId} AND user_id = ${user.userId}
            LIMIT 1
        `;

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: 'Struttura non trovata o non autorizzata'
            });
        }

        const property = rows[0];

        // Decrypt WSKEY
        try {
            wskey = decryptWskey(property.wskey_encrypted);
        } catch (error) {
            console.error('[AUTH] Failed to decrypt WSKEY:', error);
            return res.status(500).json({
                error: 'Decryption error',
                message: 'Errore nella decrittazione delle credenziali'
            });
        }

        utente = property.alloggiati_username;

        // Get password from environment or form (password not stored in DB for security)
        password = body.password || process.env.ALLOGGIATI_PASSWORD;

        if (!password) {
            return res.status(400).json({
                error: 'Missing password',
                message: 'Password Alloggiati Web richiesta'
            });
        }

        console.log(`[AUTH] Using property credentials: ${property.property_name}`);

        // Update last_used_at for property
        await sql`
            UPDATE properties
            SET last_used_at = NOW()
            WHERE id = ${propertyId}
        `;
    } else {
        // OLD METHOD: Direct credentials (backward compatibility)
        ({ utente, password, wskey } = body);
    }

    console.log('[AUTH] Extracted - utente:', utente ? 'present' : 'missing');
    console.log('[AUTH] Extracted - password:', password ? 'present' : 'missing');
    console.log('[AUTH] Extracted - wskey:', wskey ? 'present' : 'missing');

    // Log action
    try {
        await logUserAction(user.userId, 'alloggiati_auth', { utente });
    } catch (error) {
        console.error('[AUTH] Failed to log action:', error);
    }

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
async function handleTest(body: any, user: any, res: VercelResponse) {
    const { utente, token, schedine } = body;

    // Log action
    try {
        await logUserAction(user.userId, 'alloggiati_test', { utente });
    } catch (error) {
        console.error('[TEST] Failed to log action:', error);
    }

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
async function handleSend(body: any, user: any, res: VercelResponse) {
    console.log('[SEND] ===== NEW SEND REQUEST =====');
    console.log('[SEND] User:', user.email, 'ID:', user.userId);

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
        // Log failed send attempt
        try {
            await logUserAction(user.userId, 'alloggiati_send_failed', { utente, error: errorDettaglio });
        } catch (err) {
            console.error('[SEND] Failed to log failed send:', err);
        }

        return res.status(200).json({
            success: false,
            message: errorDettaglio ? `${errorDes}: ${errorDettaglio}` : 'Errore durante l\'invio',
            ricevuta: undefined
        });
    }

    console.log('[SEND] ✅ Schedina inviata con successo!');

    // ✅ INCREMENT SCAN COUNT (only on successful send)
    try {
        await incrementScanCount(user.userId);
        console.log('[SEND] ✅ Scan count incremented for user:', user.userId);
    } catch (error) {
        console.error('[SEND] ❌ Failed to increment scan count:', error);
        // Don't fail the request, just log error
    }

    // ✅ SAVE RECEIPT PDF (if ricevuta available)
    if (ricevuta && body.propertyId && body.schedineData) {
        try {
            console.log('[SEND] Downloading and saving receipt PDF...');

            // Download receipt PDF via SOAP
            const receiptDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const ricevutaSoapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:GetReceipt>
      <all:Utente>${escapeXml(utente)}</all:Utente>
      <all:token>${escapeXml(token)}</all:token>
      <all:Data>${receiptDate}</all:Data>
    </all:GetReceipt>
  </soap:Body>
</soap:Envelope>`;

            const pdfXmlText = await callSoap(ricevutaSoapEnvelope, 'GetReceipt');
            const pdfMatch = pdfXmlText.match(/<result>(.*?)<\/result>/s);
            const pdfBase64 = pdfMatch ? pdfMatch[1].trim() : null;

            if (pdfBase64) {
                // Extract guest data from schedineData (passed from frontend)
                const schedData = body.schedineData || {};
                const guestName = schedData.nome || null;
                const guestSurname = schedData.cognome || null;
                const guestBirthDate = schedData.dataNascita || null;
                const guestNationality = schedData.cittadinanza || null;
                const checkinDate = schedData.dataArrivo || null;
                const checkoutDate = schedData.dataPartenza || null;

                // Calculate nights if dates available
                let nights = null;
                if (checkinDate && checkoutDate) {
                    const checkin = new Date(checkinDate);
                    const checkout = new Date(checkoutDate);
                    nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
                }

                // Get property name
                const { rows: propRows } = await sql`
                    SELECT property_name FROM properties WHERE id = ${body.propertyId} LIMIT 1
                `;
                const propertyName = propRows[0]?.property_name || null;

                // Calculate file size
                const fileSize = Buffer.from(pdfBase64, 'base64').length;

                // Save to receipts table
                await sql`
                    INSERT INTO receipts (
                        user_id,
                        property_id,
                        receipt_number,
                        receipt_date,
                        receipt_pdf_base64,
                        file_size,
                        guest_name,
                        guest_surname,
                        guest_birth_date,
                        guest_nationality,
                        property_name,
                        checkin_date,
                        checkout_date,
                        nights,
                        submission_timestamp,
                        soap_response_code
                    ) VALUES (
                        ${user.userId},
                        ${body.propertyId},
                        ${ricevuta},
                        ${receiptDate},
                        ${pdfBase64},
                        ${fileSize},
                        ${guestName},
                        ${guestSurname},
                        ${guestBirthDate},
                        ${guestNationality},
                        ${propertyName},
                        ${checkinDate},
                        ${checkoutDate},
                        ${nights},
                        NOW(),
                        'success'
                    )
                `;

                console.log('[SEND] ✅ Receipt PDF saved to database');
            } else {
                console.warn('[SEND] ⚠️ No PDF received from GetReceipt');
            }
        } catch (error) {
            console.error('[SEND] ❌ Failed to save receipt PDF:', error);
            // Don't fail the request, just log error
        }
    }

    // Log successful send
    try {
        await logUserAction(user.userId, 'alloggiati_send_success', { utente, schedineValide, ricevuta });
    } catch (error) {
        console.error('[SEND] Failed to log success:', error);
    }

    return res.status(200).json({
        success: true,
        message: `Schedina inviata con successo! ${schedineValide} schedina/e accettata/e ✅`,
        ricevuta
    });
}

// ============================================
// RICEVUTA - Download Receipt PDF
// ============================================
async function handleRicevuta(body: any, user: any, res: VercelResponse) {
    const { utente, token, data } = body;

    // Log action
    try {
        await logUserAction(user.userId, 'alloggiati_ricevuta', { utente, data });
    } catch (error) {
        console.error('[RICEVUTA] Failed to log action:', error);
    }

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
async function handleTabelle(body: any, user: any, res: VercelResponse) {
    const { utente, token, tipo } = body;

    // Log action
    try {
        await logUserAction(user.userId, 'alloggiati_tabelle', { utente, tipo });
    } catch (error) {
        console.error('[TABELLE] Failed to log action:', error);
    }

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
