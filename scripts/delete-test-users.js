/**
 * Delete Test Users Script
 * Removes test users from the database
 */

const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');
const path = require('path');

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

async function deleteTestUsers() {
  console.log('🗑️  Cancellando utenti di test...\n');

  try {
    // Delete users with test email addresses
    const result = await sql`
      DELETE FROM users
      WHERE email LIKE '%test%'
         OR email LIKE '%example.com%'
      RETURNING email
    `;

    if (result.rows.length === 0) {
      console.log('ℹ️  Nessun utente di test trovato.');
    } else {
      console.log(`✅ Cancellati ${result.rows.length} utenti di test:`);
      result.rows.forEach(row => {
        console.log(`   - ${row.email}`);
      });
    }

    // Show remaining users
    const remaining = await sql`
      SELECT email, full_name, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`\n📊 Utenti rimanenti (ultimi 10):`);
    if (remaining.rows.length === 0) {
      console.log('   (nessun utente)');
    } else {
      remaining.rows.forEach(row => {
        console.log(`   - ${row.email} (${row.full_name}) - creato il ${new Date(row.created_at).toLocaleString('it-IT')}`);
      });
    }

    console.log('\n🎉 Operazione completata!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Errore durante la cancellazione:');
    console.error(error);
    process.exit(1);
  }
}

deleteTestUsers();
