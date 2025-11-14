import { ExtractedInfo } from '../types';

export interface OcrResult {
    data: ExtractedInfo;
    usage?: {
        scanCount: number;
        monthlyLimit: number;
        remaining: number;
    };
}

/**
 * Extract document information using backend OCR endpoint
 * 🔒 Requires authentication - sends JWT token from sessionStorage
 */
export async function extractDocumentInfo(base64Image: string, mimeType: string): Promise<OcrResult> {
    console.log('[OCR] Calling backend OCR endpoint...');

    try {
        // Get JWT token from sessionStorage
        const token = sessionStorage.getItem('alloggify_token');

        if (!token) {
            throw new Error('Devi effettuare il login per usare questa funzionalità.');
        }

        const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send JWT token
            },
            body: JSON.stringify({
                base64Image,
                mimeType
            })
        });

        // Handle specific error responses
        if (response.status === 401) {
            // Token expired or invalid - redirect to login
            sessionStorage.removeItem('alloggify_user');
            sessionStorage.removeItem('alloggify_token');
            window.location.href = '/login';
            throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        }

        if (response.status === 403) {
            // Scan limit reached - redirect to upgrade page
            const errorData = await response.json();

            // Redirect to upgrade page with reason parameter
            setTimeout(() => {
                window.location.href = '/upgrade?reason=scan_limit';
            }, 1500);

            throw new Error(errorData.message || 'Hai raggiunto il limite mensile di scansioni. Reindirizzamento alla pagina di upgrade...');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error('Invalid response from OCR API');
        }

        // Log usage info
        if (result.usage) {
            console.log(`[OCR] Usage: ${result.usage.scanCount}/${result.usage.monthlyLimit} (${result.usage.remaining} remaining)`);
        }

        console.log('[OCR] ✅ Document extracted successfully');

        return {
            data: result.data as ExtractedInfo,
            usage: result.usage
        };

    } catch (error) {
        console.error("Error calling OCR API:", error);

        if (error instanceof Error) {
            // Re-throw custom error messages
            if (error.message.includes('login') || error.message.includes('limite') || error.message.includes('Sessione')) {
                throw error;
            }

            if (error.message.includes('API key')) {
                throw new Error("Errore configurazione server: chiave API Gemini non valida.");
            }
            throw new Error(`Errore OCR: ${error.message}`);
        }

        throw new Error("Errore nella chiamata all'API OCR. Verifica la tua connessione e riprova.");
    }
}