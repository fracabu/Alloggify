/**
 * Script di test locale per debuggare la connessione SOAP al portale Alloggiati Web
 *
 * SICURO: Testa SOLO l'autenticazione, NON invia ospiti
 *
 * Usage: node test-soap.js
 */

const SOAP_ENDPOINT = 'https://alloggiatiweb.poliziadistato.it/service/service.asmx';

// ⚠️ INSERISCI LE TUE CREDENZIALI QUI (sono usate solo in locale, non vengono salvate)
const CREDENTIALS = {
    utente: 'RM047548',
    password: '20p07s6s',
    wskey: 'AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=='
};

function escapeXml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function testAuthentication() {
    console.log('🧪 TEST CONNESSIONE ALLOGGIATI WEB\n');
    console.log('📡 Endpoint:', SOAP_ENDPOINT);
    console.log('👤 Username:', CREDENTIALS.utente);
    console.log('🔑 WSKEY (primi 10 char):', CREDENTIALS.wskey.substring(0, 10) + '...\n');

    // Verifica che le credenziali siano state inserite
    if (CREDENTIALS.utente === 'TUO_USERNAME_QUI') {
        console.error('❌ ERRORE: Inserisci le tue credenziali nello script prima di eseguirlo!');
        console.error('   Apri test-soap.js e modifica le righe 11-15\n');
        process.exit(1);
    }

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:all="AlloggiatiService">
  <soap:Header/>
  <soap:Body>
    <all:GenerateToken>
      <all:Utente>${escapeXml(CREDENTIALS.utente)}</all:Utente>
      <all:Password>${escapeXml(CREDENTIALS.password)}</all:Password>
      <all:WsKey>${escapeXml(CREDENTIALS.wskey)}</all:WsKey>
    </all:GenerateToken>
  </soap:Body>
</soap:Envelope>`;

    console.log('📤 SOAP Request:');
    console.log('─'.repeat(80));
    console.log(soapEnvelope);
    console.log('─'.repeat(80));
    console.log();

    try {
        console.log('⏳ Invio richiesta al portale...\n');

        const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
            },
            body: soapEnvelope,
        });

        console.log('📥 SOAP Response:');
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        console.log();

        const xmlText = await response.text();

        console.log('📄 Response Body:');
        console.log('─'.repeat(80));
        console.log(xmlText);
        console.log('─'.repeat(80));
        console.log();

        // Check for SOAP fault
        if (xmlText.includes('soap:Fault') || xmlText.includes('soap12:Fault')) {
            const faultMatch = xmlText.match(/<faultstring>(.*?)<\/faultstring>/);
            const faultMessage = faultMatch ? faultMatch[1] : 'Unknown error';

            console.log('❌ SOAP FAULT:');
            console.log('   Message:', faultMessage);

            // Extract more details if available
            const faultCodeMatch = xmlText.match(/<faultcode>(.*?)<\/faultcode>/);
            const faultDetailMatch = xmlText.match(/<detail>(.*?)<\/detail>/s);

            if (faultCodeMatch) console.log('   Code:', faultCodeMatch[1]);
            if (faultDetailMatch) console.log('   Detail:', faultDetailMatch[1]);

            console.log();
            process.exit(1);
        }

        if (!response.ok) {
            console.log('❌ HTTP ERROR:', response.status, response.statusText);
            console.log();
            process.exit(1);
        }

        // Parse success response
        const tokenMatch = xmlText.match(/<token>(.*?)<\/token>/s);
        const expiresMatch = xmlText.match(/<expires>(.*?)<\/expires>/s);

        if (tokenMatch && expiresMatch) {
            console.log('✅ AUTENTICAZIONE RIUSCITA!');
            console.log();
            console.log('   Token (primi 20 char):', tokenMatch[1].substring(0, 20) + '...');
            console.log('   Scadenza:', expiresMatch[1]);
            console.log();
            console.log('🎉 La connessione funziona! Le credenziali sono corrette.');
            console.log();
        } else {
            console.log('⚠️  Response OK ma formato inatteso');
            console.log('   Token trovato:', !!tokenMatch);
            console.log('   Scadenza trovata:', !!expiresMatch);
            console.log();
        }

    } catch (error) {
        console.log('❌ ERRORE FETCH:');
        console.log('   Tipo:', error.name);
        console.log('   Messaggio:', error.message);
        console.log('   Stack:', error.stack);
        console.log();
        process.exit(1);
    }
}

// Esegui il test
testAuthentication();
