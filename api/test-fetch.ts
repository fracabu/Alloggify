// Simple test endpoint to check if Vercel can make external requests
export default async function handler(req: any, res: any) {
    try {
        console.log('[TEST] Starting fetch test');

        // Test 1: Simple HTTP request
        const testResponse = await fetch('https://httpbin.org/get');
        const testData = await testResponse.json();
        console.log('[TEST] httpbin.org test:', testResponse.status);

        // Test 2: SOAP endpoint (just HEAD request)
        const soapResponse = await fetch('https://alloggiatiweb.poliziadistato.it/service/service.asmx', {
            method: 'HEAD'
        });
        console.log('[TEST] SOAP endpoint HEAD:', soapResponse.status);

        return res.status(200).json({
            success: true,
            tests: {
                httpbin: {
                    status: testResponse.status,
                    data: testData
                },
                soapEndpoint: {
                    status: soapResponse.status,
                    headers: Object.fromEntries(soapResponse.headers.entries())
                }
            },
            nodeVersion: process.version,
            platform: process.platform
        });

    } catch (error: any) {
        console.error('[TEST] Error:', error);
        return res.status(500).json({
            error: error?.message || 'Test failed',
            stack: error?.stack,
            nodeVersion: process.version
        });
    }
}
