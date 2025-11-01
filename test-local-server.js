/**
 * Test local Express server
 */

async function testLocalServer() {
    const credentials = {
        utente: 'RM047548',
        password: '20p07s6s',
        wskey: 'AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=='
    };

    console.log('🧪 Testing Local Express Server');
    console.log('📡 URL: http://localhost:3001/api/alloggiati/auth');
    console.log();

    try {
        const response = await fetch('http://localhost:3001/api/alloggiati/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        console.log('📥 Response Status:', response.status, response.statusText);
        const data = await response.json();
        console.log('📄 Response Body:');
        console.log(JSON.stringify(data, null, 2));
        console.log();

        if (response.ok && data.success) {
            console.log('✅ SUCCESS! Local Express server is working!');
            console.log('   Token (first 20 chars):', data.token.substring(0, 20) + '...');
            console.log('   Expires:', data.scadenza);
        } else {
            console.log('❌ FAILED:', data.error || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ FETCH ERROR:', error.message);
    }
}

testLocalServer();
