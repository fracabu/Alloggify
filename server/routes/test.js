/**
 * Test Route - TestWebScheda
 */
const express = require('express');
const { escapeXml, callSoap } = require('../utils/soap');

const router = express.Router();

router.post('/test', async (req, res) => {
    try {
        const { utente, token, schedine } = req.body;

        if (!utente || !token || !schedine) {
            return res.status(400).json({
                error: 'Missing required fields: utente, token, schedine'
            });
        }

        // schedine should be an array of CSV strings
        const schedineArray = Array.isArray(schedine) ? schedine : [schedine];
        
        // Build ElencoSchedine XML structure
        const elencoSchedineXml = schedineArray.map(s => 
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

        console.log('[TEST] Full XML Response:', xmlText);

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

        console.log('[TEST] Schedine Valide:', schedineValide);
        console.log('[TEST] Esito Prima Schedina:', esito);
        console.log('[TEST] ErrorCod:', errorCod);
        console.log('[TEST] ErrorDes:', errorDes);
        console.log('[TEST] ErrorDettaglio:', errorDettaglio);

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

    } catch (error) {
        console.error('[TEST] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
