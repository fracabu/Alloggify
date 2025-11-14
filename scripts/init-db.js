/**
 * Database Initialization Script
 * Runs schema.sql to create all tables
 */

const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

async function initDatabase() {
  console.log('🔄 Inizializzando database...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 Schema SQL caricato da:', schemaPath);
    console.log('📦 Eseguendo query...\n');

    // Execute schema
    await sql.query(schema);

    console.log('✅ Database inizializzato con successo!');
    console.log('✅ Tabelle create: users, scans, subscriptions, usage_logs\n');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📊 Tabelle presenti nel database:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Setup completato!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:');
    console.error(error);
    process.exit(1);
  }
}

initDatabase();
