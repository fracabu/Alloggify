/**
 * Test script to download Tabelle from Alloggiati Web
 * This will download the reference tables (comuni, documenti, etc.)
 */
const fs = require('fs');

// IMPORTANT: Replace these with your actual credentials
const CREDENTIALS = {
    utente: 'RM047548',
    password: '20p07s6s',
    wskey: 'AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=='
};

const BASE_URL = 'http://localhost:3001';

async function downloadTabelle() {
    console.log('🔐 Step 1: Generating token...\n');

    // Step 1: Generate token
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
    console.log('✅ Token generated successfully\n');
    console.log('Token (first 30 chars):', token.substring(0, 30) + '...\n');

    // Step 2: Download tables
    const tables = [
        { tipo: 0, name: 'Luoghi (Comuni)' },
        { tipo: 1, name: 'Tipi_Documento' },
        { tipo: 2, name: 'Tipi_Alloggiato' }
    ];

    for (const table of tables) {
        console.log(`📥 Downloading ${table.name}...`);
        
        try {
            const response = await fetch(`${BASE_URL}/api/alloggiati/tabelle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    utente: CREDENTIALS.utente,
                    token: token,
                    tipo: table.tipo
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ ${table.name} downloaded successfully`);
                console.log(`   First 200 chars: ${result.data.substring(0, 200)}...\n`);
                
                // Save to file
                const filename = `tabella_${table.tipo}_${table.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
                fs.writeFileSync(filename, result.data, 'utf-8');
                console.log(`   💾 Saved to: ${filename}\n`);
            } else {
                console.error(`❌ Failed to download ${table.name}:`, result.message);
            }
        } catch (error) {
            console.error(`❌ Error downloading ${table.name}:`, error.message);
        }
    }

    console.log('✅ All tables downloaded!\n');
    console.log('📋 Check the CSV files in the current directory');
}

// Run the script
downloadTabelle().catch(console.error);
