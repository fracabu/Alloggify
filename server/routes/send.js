/**
 * Send Route - InsertWebScheda
 */
const express = require('express');
const { escapeXml, callSoap } = require('../utils/soap');

const router = express.Router();

router.post('/send', async (req, res) => {
    try {
        const { token, schedina } = req.body;

        if (!token || !schedina) {
            return res.status(400).json({
                error: 'Missing required fields: token, schedina'
            });
        }

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

        const xmlText = await callSoap(soapEnvelope, 'Send');

        // Extract result and ricevuta
        const resultMatch = xmlText.match(/<SendResult>(.*?)<\/SendResult>/s);
        const ricevutaMatch = xmlText.match(/<ricevuta>(.*?)<\/ricevuta>/);

        const resultText = resultMatch ? resultMatch[1] : '';
        const ricevuta = ricevutaMatch ? ricevutaMatch[1] : undefined;

        console.log('[SEND] ✅ Schedina sent successfully');

        return res.status(200).json({
            success: true,
            message: 'Schedina inviata con successo!',
            ricevuta,
            rawResult: resultText
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
