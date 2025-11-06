import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedInfo } from '../types';

export async function extractDocumentInfo(base64Image: string, mimeType: string): Promise<ExtractedInfo> {
    // Try to get API key from localStorage first, then fallback to env variable
    const userApiKey = localStorage.getItem('geminiApiKey');
    const apiKey = (userApiKey?.trim() || process.env.API_KEY)?.trim();

    console.log('🔑 API Key source:', userApiKey ? 'localStorage' : 'env');
    console.log('🔑 API Key length:', apiKey?.length || 0);
    console.log('🔑 API Key first 10 chars:', apiKey?.substring(0, 10) || 'none');

    if (!apiKey) {
        throw new Error("Chiave API non configurata. Inserisci la tua chiave API Gemini.");
    }

    if (apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error("Stai usando la chiave placeholder. Inserisci la tua vera chiave API Gemini.");
    }

    const ai = new GoogleGenAI({ apiKey });

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

    try {
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
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as ExtractedInfo;

    } catch (error) {
        console.error("Error calling Gemini API:", error);

        // Check if it's an API key error
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("Chiave API non valida. Verifica che la chiave API Gemini sia corretta e riprova.");
        }

        throw new Error("Errore nella chiamata all'API Gemini. Verifica la tua connessione e riprova.");
    }
}