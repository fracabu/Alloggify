/**
 * Send Route - InsertWebScheda
 */
const express = require('express');
const { escapeXml, callSoap } = require('../utils/soap');

const router = express.Router();

router.post('/send', async (req, res) => {
    try {
        console.log('[SEND] ===== NEW SEND REQUEST =====');
        const { utente, token, schedine } = req.body;

        if (!utente || !token || !schedine) {
            return res.status(400).json({
                error: 'Missing required fields: utente, token, schedine'
            });
        }

        console.log('[SEND] Utente:', utente);
        console.log('[SEND] Token (first 20 chars):', token.substring(0, 20) + '...');
        console.log('[SEND] Schedine CSV (fixed-width format):');
        
        // schedine should be an array of CSV strings
        const schedineArray = Array.isArray(schedine) ? schedine : [schedine];
        schedineArray.forEach((s, i) => {
            console.log(`[SEND] Schedina ${i + 1} (${s.length} chars):`, s);
        });
        console.log('[SEND] ==============================');

        // Build ElencoSchedine XML structure
        const elencoSchedineXml = schedineArray.map(s => 
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

        console.log('[SEND] Full SOAP Envelope:');
        console.log(soapEnvelope);

        const xmlText = await callSoap(soapEnvelope, 'Send');

        // Log complete XML response for debugging
        console.log('[SEND] XML Response:', xmlText);

        // Parse the result section (contains per-schedina details)
        const resultMatch = xmlText.match(/<result>(.*?)<\/result>/s);
        const resultXml = resultMatch ? resultMatch[1] : '';

        // Extract schedine valide
        const schedineValideMatch = resultXml.match(/<SchedineValide>(.*?)<\/SchedineValide>/);
        const schedineValide = schedineValideMatch ? parseInt(schedineValideMatch[1]) : 0;

        // Extract detailed errors from Dettaglio section
        const dettaglioMatch = resultXml.match(/<Dettaglio>(.*?)<\/Dettaglio>/s);
        const dettaglioXml = dettaglioMatch ? dettaglioMatch[1] : '';

        // Parse first error from EsitoOperazioneServizio
        const esitoOpMatch = dettaglioXml.match(/<EsitoOperazioneServizio>(.*?)<\/EsitoOperazioneServizio>/s);
        const esitoOpXml = esitoOpMatch ? esitoOpMatch[1] : '';

        const esitoMatch = esitoOpXml.match(/<esito>(.*?)<\/esito>/);
        const esito = esitoMatch ? esitoMatch[1] === 'true' : false;

        const errorCodMatch = esitoOpXml.match(/<ErroreCod>(.*?)<\/ErroreCod>/);
        const errorDesMatch = esitoOpXml.match(/<ErroreDes>(.*?)<\/ErroreDes>/);
        const errorDettaglioMatch = esitoOpXml.match(/<ErroreDettaglio>(.*?)<\/ErroreDettaglio>/);

        const errorCod = errorCodMatch ? errorCodMatch[1] : '';
        const errorDes = errorDesMatch ? errorDesMatch[1] : '';
        const errorDettaglio = errorDettaglioMatch ? errorDettaglioMatch[1] : '';

        console.log('[SEND] Schedine Valide:', schedineValide);
        console.log('[SEND] Esito Prima Schedina:', esito);
        console.log('[SEND] ErrorCod:', errorCod);
        console.log('[SEND] ErrorDes:', errorDes);
        console.log('[SEND] ErrorDettaglio:', errorDettaglio);

        // Extract ricevuta number from result section (if present)
        const ricevutaMatch = xmlText.match(/<ricevuta>(.*?)<\/ricevuta>/);
        const ricevuta = ricevutaMatch ? ricevutaMatch[1] : undefined;
        
        console.log('[SEND] Ricevuta:', ricevuta);

        if (!esito || schedineValide === 0) {
            console.log('[SEND] ⚠️ Invio fallito');
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

    } catch (error) {
        console.error('[SEND] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
