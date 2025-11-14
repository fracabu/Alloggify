/**
 * OCR API Endpoint - Vercel Serverless Function
 * Gemini 2.5 Flash-powered document extraction
 */

import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel serverless function configuration
export const config = {
    maxDuration: 30, // 30 seconds timeout
};

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. OCR will not work.');
}

const ai = new GoogleGenAI({ apiKey });

/**
 * POST /api/ocr
 * Extract document information from image
 *
 * Request body:
 * {
 *   "base64Image": "data:image/jpeg;base64,...",
 *   "mimeType": "image/jpeg"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "lastName": "ROSSI",
 *     "firstName": "MARIO",
 *     ...
 *   }
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { base64Image, mimeType } = req.body;

        // Validation
        if (!base64Image || !mimeType) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'base64Image and mimeType are required'
            });
        }

        if (!apiKey) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'GEMINI_API_KEY not configured on server'
            });
        }

        console.log('[OCR] Processing document, mime type:', mimeType);

        // Prepare image part
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const textPart = {
            text: `Your primary task is to extract information from the provided document image. You must follow a strict order of operations for identifying the Document Type.

**1. Document Type Identification (Follow this order):**
   a. **Passport Check:** First, look for the word "PASSPORT", "PASSAPORTO", or similar translations. If found, you MUST classify the document as "PASSAPORTO ORDINARIO", unless it explicitly states "DI SERVIZIO" or "DIPLOMATICO".
   b. **Driving License Check:** If it is not a passport, look for "DRIVING LICENCE", "PATENTE DI GUIDA", or similar. If found, you MUST classify it as "PATENTE DI GUIDA".
   c. **Italian ID Card Check:** If it is neither a passport nor a driving license, then apply the following critical logic for Italian ID cards:
      - **Default Assumption:** By default, assume the document is a standard **"CARTA DI IDENTITA'"**. This applies to both old paper booklets AND older plastic-laminated cards.
      - **The 'Electronic' Exception:** You are ONLY permitted to classify the document as **"CARTA IDENTITA' ELETTRONICA"** if you can clearly see specific modern features: a visible **chip symbol**, the **European Union flag**, or the explicit word **"ELETTRONICA"**.
      - **Final Decision:** If these specific "electronic" features are ABSENT, you MUST classify the document as **"CARTA DI IDENTITA'"**. The material of the card is NOT the deciding factor.

**2. Data Extraction Rules:**
- After correctly classifying the document type, extract all other fields.
- sex: 'Maschio' or 'Femmina'.
- dateOfBirth: Format as 'YYYY-MM-DD'.
- placeOfBirth: For Italian citizens, provide the MUNICIPALITY name in uppercase, without country code (e.g., 'ROMA'). For foreign citizens, provide the CITY or REGION name in uppercase (e.g., 'TUNISI').
- stateOfBirth: CRITICAL - ALWAYS provide the COUNTRY of birth in uppercase. For Italian citizens: 'ITALIA'. For foreign citizens: the country name in Italian uppercase (e.g., 'TUNISIA', 'FRANCIA', 'GERMANIA', 'MAROCCO').
- citizenship: The full country name in Italian, e.g., 'ITALIA'.
- issuingPlace: The Italian MUNICIPALITY or foreign COUNTRY of issuance, in uppercase (e.g., 'ROMA' or 'GERMANIA'). Do not include country codes.

**3. Output Format:**
- Provide the final result as a single JSON object conforming to the schema. If a field is not present, use an empty string.
`
        };

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lastName: { type: Type.STRING },
                        firstName: { type: Type.STRING },
                        sex: { type: Type.STRING, description: "Sex ('Maschio' or 'Femmina'). Returns an empty string if not found." },
                        dateOfBirth: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
                        placeOfBirth: { type: Type.STRING, description: "For Italian citizens, the municipality name in uppercase (e.g., 'ROMA'). For foreign citizens, the city/region in uppercase (e.g., 'TUNISI'). No country codes." },
                        stateOfBirth: { type: Type.STRING, description: "CRITICAL: ALWAYS the country of birth in uppercase. Italian citizens: 'ITALIA'. Foreign: 'TUNISIA', 'FRANCIA', 'GERMANIA', 'MAROCCO', etc." },
                        citizenship: { type: Type.STRING, description: "Full country name in Italian, e.g. ITALIA or TUNISIA" },
                        documentType: { type: Type.STRING, description: `CRITICAL: Identify in order: 1. Passport ('PASSAPORTO ORDINARIO'), 2. Driving License ('PATENTE DI GUIDA'), 3. Italian ID. For Italian IDs, default to 'CARTA DI IDENTITA'' unless a chip/EU flag proves it is 'CARTA IDENTITA' ELETTRONICA'.` },
                        documentNumber: { type: Type.STRING },
                        issuingPlace: { type: Type.STRING, description: "The Italian municipality or foreign country of issuance, in uppercase (e.g., 'ROMA' or 'GERMANIA'). No country codes." }
                    },
                    required: [
                        "lastName", "firstName", "sex", "dateOfBirth", "placeOfBirth", "stateOfBirth",
                        "citizenship", "documentType", "documentNumber", "issuingPlace"
                    ]
                }
            }
        });

        const jsonText = response.text?.trim() || '';
        if (!jsonText) {
            throw new Error('Empty response from Gemini API');
        }
        const parsedJson = JSON.parse(jsonText);

        console.log('[OCR] ✅ Document extracted successfully');

        return res.status(200).json({
            success: true,
            data: parsedJson
        });

    } catch (error: any) {
        console.error('[OCR Error]', error);

        // Check if it's an API key error
        if (error.message && error.message.includes('API key not valid')) {
            return res.status(401).json({
                error: 'API key invalid',
                message: 'The GEMINI_API_KEY is invalid or expired'
            });
        }

        if (error.message && error.message.includes('RATE_LIMIT_EXCEEDED')) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.'
            });
        }

        return res.status(500).json({
            error: 'OCR service error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process document'
        });
    }
}
