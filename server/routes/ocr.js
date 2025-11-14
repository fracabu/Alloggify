/**
 * OCR Route for Local Development
 * POST /api/ocr
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');

const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware to verify JWT token
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token di autenticazione mancante'
            });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            req.email = decoded.email;
            next();
        } catch (err) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token non valido o scaduto'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante la verifica del token'
        });
    }
};

// ========================================
// POST /api/ocr
// ========================================
router.post('/', requireAuth, async (req, res) => {
    const startTime = Date.now();

    try {
        const { base64Image, mimeType } = req.body;
        const userId = req.userId;

        // Validation
        if (!base64Image || !mimeType) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Immagine e tipo MIME sono obbligatori'
            });
        }

        // Get user and check scan limit
        const userResult = await pool.query(
            'SELECT scan_count, monthly_scan_limit FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Utente non trovato'
            });
        }

        // Check scan limit
        if (user.scan_count >= user.monthly_scan_limit) {
            return res.status(403).json({
                error: 'Scan limit reached',
                message: `Hai raggiunto il limite mensile di ${user.monthly_scan_limit} scansioni. Effettua l'upgrade del piano per continuare.`,
                scanCount: user.scan_count,
                monthlyLimit: user.monthly_scan_limit
            });
        }

        // Initialize Gemini AI
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'GEMINI_API_KEY non configurata'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Extract document info using Gemini
        const prompt = `Analyze this Italian identity document and extract ALL information in JSON format.

Document types to detect:
- CARTA DI IDENTITA' (old paper/plastic Italian ID cards)
- CARTA IDENTITA' ELETTRONICA (new electronic ID with chip/EU flag)
- PASSAPORTO ORDINARIO (Italian passport)
- PATENTE DI GUIDA (driving license)

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "documentType": "CARTA DI IDENTITA'" | "CARTA IDENTITA' ELETTRONICA" | "PASSAPORTO ORDINARIO" | "PATENTE DI GUIDA",
  "surname": "string",
  "name": "string",
  "birthDate": "YYYY-MM-DD",
  "birthPlace": "CITY NAME IN UPPERCASE" or "COUNTRY NAME for foreigners",
  "citizenship": "ITALIANA" or "COUNTRY NAME",
  "sex": "Maschio" | "Femmina",
  "documentNumber": "string",
  "issuePlace": "CITY NAME IN UPPERCASE",
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD"
}`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        let geminiData;
        try {
            const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
            geminiData = JSON.parse(cleanedText);
        } catch (parseError) {
            return res.status(500).json({
                error: 'Parse error',
                message: 'Impossibile analizzare la risposta del modello AI'
            });
        }

        // Map Gemini response to frontend ExtractedInfo format
        const parsedJson = {
            lastName: geminiData.surname || '',
            firstName: geminiData.name || '',
            sex: geminiData.sex || '',
            dateOfBirth: geminiData.birthDate || '',
            placeOfBirth: geminiData.birthPlace || '',
            stateOfBirth: geminiData.citizenship === 'ITALIANA' ? 'ITALIA' : (geminiData.birthPlace || ''),
            citizenship: geminiData.citizenship || '',
            documentType: geminiData.documentType || '',
            documentNumber: geminiData.documentNumber || '',
            issuingPlace: geminiData.issuePlace || ''
        };

        const processingTime = Date.now() - startTime;

        // Increment scan count
        await pool.query(
            'UPDATE users SET scan_count = scan_count + 1 WHERE id = $1',
            [userId]
        );

        // Log scan (save original Gemini response for debugging)
        await pool.query(
            `INSERT INTO scans (user_id, document_type, extracted_data, processing_time_ms, success)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                userId,
                geminiData.documentType || 'UNKNOWN',
                JSON.stringify(geminiData),
                processingTime,
                true
            ]
        );

        // Get updated usage
        const updatedUser = await pool.query(
            'SELECT scan_count, monthly_scan_limit FROM users WHERE id = $1',
            [userId]
        );

        const usage = updatedUser.rows[0];

        return res.status(200).json({
            success: true,
            data: parsedJson,
            usage: {
                scanCount: usage.scan_count,
                monthlyLimit: usage.monthly_scan_limit,
                remaining: Math.max(0, usage.monthly_scan_limit - usage.scan_count)
            }
        });

    } catch (error) {
        console.error('❌ OCR error:', error);

        // Log failed scan
        try {
            await pool.query(
                `INSERT INTO scans (user_id, document_type, extracted_data, error_message, processing_time_ms, success)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    req.userId,
                    'UNKNOWN',
                    JSON.stringify({ error: 'Scan failed' }), // Provide valid JSON instead of NULL
                    error.message,
                    Date.now() - startTime,
                    false
                ]
            );
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }

        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante l\'analisi del documento. Riprova più tardi.'
        });
    }
});

module.exports = router;
