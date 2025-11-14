/**
 * SOAP Utilities for Alloggiati Web Service
 */

const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

/**
 * Escape XML special characters
 */
export function escapeXml(unsafe: string | undefined | null): string {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Call SOAP endpoint with proper error handling
 */
export async function callSoap(soapEnvelope: string, operationName: string): Promise<string> {
    console.log(`[SOAP] Calling ${operationName}`);
    console.log(`[SOAP] Endpoint:`, SOAP_ENDPOINT);

    const response = await fetch(SOAP_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: soapEnvelope,
    });

    console.log(`[SOAP] Response status:`, response.status);

    const xmlText = await response.text();

    // Check for SOAP fault
    if (xmlText.includes('soap:Fault') || xmlText.includes('soap12:Fault')) {
        const faultMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/);
        const faultMessage = faultMatch ? faultMatch[1] : 'SOAP Fault';
        throw new Error(`SOAP Fault: ${faultMessage}`);
    }

    if (!response.ok) {
        console.error(`[SOAP] Error response:`, xmlText.substring(0, 500));
        throw new Error(`SOAP Error: ${response.status} ${response.statusText}`);
    }

    return xmlText;
}

export { SOAP_ENDPOINT };
