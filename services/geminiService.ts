import { ExtractedInfo } from '../types';

/**
 * Extract document information using backend OCR endpoint
 * This keeps the API key secure on the server
 */
export async function extractDocumentInfo(base64Image: string, mimeType: string): Promise<ExtractedInfo> {
    console.log('[OCR] Calling backend OCR endpoint...');

    try {
        const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base64Image,
                mimeType
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error('Invalid response from OCR API');
        }

        console.log('[OCR] ✅ Document extracted successfully');
        return result.data as ExtractedInfo;

    } catch (error) {
        console.error("Error calling OCR API:", error);

        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                throw new Error("Errore configurazione server: chiave API Gemini non valida.");
            }
            throw new Error(`Errore OCR: ${error.message}`);
        }

        throw new Error("Errore nella chiamata all'API OCR. Verifica la tua connessione e riprova.");
    }
}