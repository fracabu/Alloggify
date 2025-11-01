/**
 * Test diretto dell'API Vercel bypassando il frontend
 */

const API_URL = process.argv[2] || 'https://alloggify-859lmf4jd-fracabus-projects.vercel.app';

async function testVercelApi() {
    const credentials = {
        utente: 'RM047548',
        password: '20p07s6s',
        wskey: 'AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=='
    };

    console.log('🧪 Testing Vercel API directly');
    console.log('📡 URL:', `${API_URL}/api/alloggiati-auth`);
    console.log();

    try {
        const response = await fetch(`${API_URL}/api/alloggiati-auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        console.log('📥 Response Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        console.log();

        const data = await response.json();
        console.log('📄 Response Body:');
        console.log(JSON.stringify(data, null, 2));
        console.log();

        if (response.ok && data.success) {
            console.log('✅ SUCCESS! API is working');
        } else {
            console.log('❌ FAILED:', data.error || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ FETCH ERROR:', error.message);
    }
}

testVercelApi();
