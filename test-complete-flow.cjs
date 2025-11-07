/**
 * Test complete flow: Auth → Download Tables → Test Schedina → Send
 */
const fs = require('fs');

const CREDENTIALS = {
    utente: 'RM047548',
    password: '20p07s6s',
    wskey: 'AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=='
};

const BASE_URL = 'http://localhost:3001';

// Sample guest data
const SAMPLE_GUEST = {
    tipo: 'Ospite Singolo',
    dataArrivo: '2025-11-06',
    permanenza: 3,
    cognome: 'ROSSI',
    nome: 'MARIO',
    sesso: 'Maschio',
    dataNascita: '1980-05-15',
    luogoNascita: 'ROMA',  // Will be converted to code
    cittadinanza: 'ITALIA',
    tipoDocumento: 'CARTA DI IDENTITA\'',
    numeroDocumento: 'AB123456',
    luogoRilascioDocumento: 'ITALIA'
};

async function testCompleteFlow() {
    console.log('🚀 Starting complete flow test\n');

    // Step 1: Authenticate
    console.log('Step 1: Authentication');
    console.log('━'.repeat(50));
    
    const authResponse = await fetch(`${BASE_URL}/api/alloggiati/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS)
    });

    const authData = await authResponse.json();
    
    if (!authData.success) {
        console.error('❌ Authentication failed:', authData);
        return;
    }

    const token = authData.token;
    console.log('✅ Token generated');
    console.log('   Expires:', authData.scadenza);
    console.log('   Token preview:', token.substring(0, 40) + '...\n');

    // Step 2: Download Tabella Luoghi
    console.log('Step 2: Download Luoghi (Comuni)');
    console.log('━'.repeat(50));
    
    const tabellaResponse = await fetch(`${BASE_URL}/api/alloggiati/tabelle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            utente: CREDENTIALS.utente,
            token: token,
            tipo: 0  // Luoghi
        })
    });

    const tabellaData = await tabellaResponse.json();
    
    if (!tabellaData.success) {
        console.error('❌ Tabella download failed:', tabellaData);
        return;
    }

    console.log('✅ Tabella Luoghi downloaded');
    
    // Parse CSV to find ROMA
    const lines = tabellaData.data.split('\n');
    const romaEntries = lines.filter(l => l.includes('ROMA') && l.startsWith('058'));
    console.log('   Found ROMA entries:');
    romaEntries.forEach(entry => {
        const [codice, descrizione, provincia] = entry.split(';');
        console.log(`   - ${descrizione} (${provincia}): ${codice}`);
    });
    console.log();

    // Step 3: Build CSV schedina manually
    console.log('Step 3: Build CSV Schedina');
    console.log('━'.repeat(50));
    
    // Helper functions
    const pad = (str, length) => (str || '').substring(0, length).padEnd(length, ' ');
    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Get ROMA code from downloaded data
    const romaLine = lines.find(l => l.includes(';ROMA;RM;'));
    const romaCodice = romaLine ? romaLine.split(';')[0] : '412058091';
    
    console.log(`   Using ROMA code: ${romaCodice}`);

    // Build CSV record (168 chars)
    let csv = '';
    csv += pad('16', 2);  // Tipo (Ospite Singolo)
    csv += pad(formatDate(SAMPLE_GUEST.dataArrivo), 10);  // Data Arrivo
    csv += String(SAMPLE_GUEST.permanenza).padStart(2, '0');  // Permanenza
    csv += pad(SAMPLE_GUEST.cognome, 50);  // Cognome
    csv += pad(SAMPLE_GUEST.nome, 30);  // Nome
    csv += '1';  // Sesso (1=M)
    csv += pad(formatDate(SAMPLE_GUEST.dataNascita), 10);  // Data Nascita
    csv += pad(romaCodice, 9);  // Comune Nascita (ROMA)
    csv += pad('RM', 2);  // Provincia Nascita
    csv += pad('100000100', 9);  // Stato Nascita (ITALIA)
    csv += pad('100000100', 9);  // Cittadinanza (ITALIA)
    csv += pad('IDENT', 5);  // Tipo Documento
    csv += pad(SAMPLE_GUEST.numeroDocumento, 20);  // Numero Documento
    csv += pad('100000100', 9);  // Luogo Rilascio (ITALIA)

    console.log(`   CSV length: ${csv.length} chars`);
    console.log(`   CSV content: ${csv}\n`);

    // Step 4: Test schedina
    console.log('Step 4: Test Schedina');
    console.log('━'.repeat(50));
    
    const testResponse = await fetch(`${BASE_URL}/api/alloggiati/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            utente: CREDENTIALS.utente,
            token: token,
            schedine: [csv]
        })
    });

    const testData = await testResponse.json();
    
    console.log('📋 Test Result:');
    console.log('   Success:', testData.success);
    console.log('   Message:', testData.message);
    
    if (testData.errors && testData.errors.length > 0) {
        console.log('   Errors:');
        testData.errors.forEach(err => {
            console.log(`   - Schedina ${err.progressivo}: ${err.codice} - ${err.descrizione}`);
        });
    }
    
    if (testData.validCount !== undefined) {
        console.log(`   Valid: ${testData.validCount}, Invalid: ${testData.invalidCount}`);
    }
    console.log();

    // Step 5: Send schedina (only if test passed)
    if (testData.success) {
        console.log('Step 5: Send Schedina');
        console.log('━'.repeat(50));
        console.log('⚠️  This will ACTUALLY send data to the Alloggiati Web portal!');
        console.log('⚠️  Press Ctrl+C now to cancel, or wait 3 seconds...\n');
        
        // Wait 3 seconds to allow cancellation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📤 Sending schedina...\n');

        const sendResponse = await fetch(`${BASE_URL}/api/alloggiati/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                utente: CREDENTIALS.utente,
                token: token,
                schedine: [csv]
            })
        });

        const sendData = await sendResponse.json();
        
        console.log('📤 Send Result:');
        console.log('   Success:', sendData.success);
        console.log('   Message:', sendData.message);
        
        if (sendData.ricevuta) {
            console.log('   Ricevuta:', sendData.ricevuta.substring(0, 100) + '...');
            
            // Save ricevuta to file
            fs.writeFileSync('ricevuta_' + Date.now() + '.txt', sendData.ricevuta, 'utf-8');
            console.log('   💾 Ricevuta saved to file');
        }
        
        if (sendData.errors && sendData.errors.length > 0) {
            console.log('   ⚠️  Errors:');
            sendData.errors.forEach(err => {
                console.log(`   - ${err.codice}: ${err.descrizione}`);
            });
        }
    } else {
        console.log('❌ Test failed, skipping send step');
    }

    console.log('\n✅ Flow test completed!');
}

// Run the test
testCompleteFlow().catch(error => {
    console.error('\n💥 Flow test failed:', error);
    console.error(error.stack);
});
