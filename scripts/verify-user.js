/**
 * Script per verificare manualmente un utente nel database
 * Bypassa il processo di email verification
 *
 * Usage: node scripts/verify-user.js email@example.com
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function verifyUser(email) {
    try {
        console.log(`🔍 Cercando utente: ${email}`);

        // Update user to set email_verified = true
        const result = await sql`
            UPDATE users
            SET
                email_verified = TRUE,
                verification_token = NULL,
                verification_token_expires = NULL,
                updated_at = NOW()
            WHERE email = ${email}
            RETURNING id, email, full_name, email_verified
        `;

        if (result.rows.length === 0) {
            console.log(`❌ Utente non trovato: ${email}`);
            console.log(`\n💡 Suggerimento: Registrati prima su http://localhost:3000/signup`);
            process.exit(1);
        }

        const user = result.rows[0];
        console.log(`✅ Utente verificato con successo!`);
        console.log(`\nDettagli:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Nome: ${user.full_name}`);
        console.log(`- Verificato: ${user.email_verified}`);
        console.log(`\n🎉 Ora puoi fare login su http://localhost:3000/login`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Errore:', error.message);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.log('❌ Errore: Email non specificata');
    console.log('\nUsage: node scripts/verify-user.js email@example.com');
    process.exit(1);
}

verifyUser(email);
