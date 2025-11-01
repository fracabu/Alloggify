/**
 * Authentication Route - GenerateToken
 */
const express = require('express');
const { escapeXml, callSoap } = require('../utils/soap');

const router = express.Router();

router.post('/auth', async (req, res) => {
    try {
        console.log('[AUTH] Starting authentication request');
        const { utente, password, wskey } = req.body;

        if (!utente || !password || !wskey) {
            console.error('[AUTH] Missing credentials');
            return res.status(400).json({
                error: 'Missing required fields: utente, password, wskey'
            });
        }

        console.log('[AUTH] Credentials received for user:', utente);

        // Build SOAP envelope (format from working test-soap.js)
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

        // Parse XML response
        const tokenMatch = xmlText.match(/<token>(.*?)<\/token>/s);
        const expiresMatch = xmlText.match(/<expires>(.*?)<\/expires>/s);

        if (!tokenMatch || !expiresMatch) {
            console.error('[AUTH] Invalid response format');
            return res.status(500).json({
                error: 'Invalid response: missing token or expires',
                response: xmlText.substring(0, 500)
            });
        }

        const token = tokenMatch[1];
        const scadenza = expiresMatch[1];

        console.log('[AUTH] ✅ Token generated successfully');

        return res.status(200).json({
            success: true,
            token,
            scadenza
        });

    } catch (error) {
        console.error('[AUTH] ❌ Error:', error.message);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
