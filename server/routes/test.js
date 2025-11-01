/**
 * Test Route - TestWebScheda
 */
const express = require('express');
const { escapeXml, callSoap } = require('../utils/soap');

const router = express.Router();

router.post('/test', async (req, res) => {
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
    <all:Test>
      <all:token>${escapeXml(token)}</all:token>
      <all:schedine>${escapeXml(schedina)}</all:schedine>
    </all:Test>
  </soap:Body>
</soap:Envelope>`;

        const xmlText = await callSoap(soapEnvelope, 'Test');

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
        console.error('[TEST] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
