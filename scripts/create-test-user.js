/**
 * Script per creare un utente di test già verificato
 * Bypassa il processo di registrazione e email verification
 *
 * Usage: node scripts/create-test-user.js
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

async function createTestUser() {
    try {
        // User details
        const email = 'test@test.com';
        const password = 'Test1234';
        const fullName = 'Test User';

        console.log(`🔨 Creando utente di test...`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        // Check if user already exists
        const existing = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;

        if (existing.rows.length > 0) {
            console.log(`\n⚠️  Utente già esistente!`);
            console.log(`Verifico l'utente esistente...`);

            // Just verify the existing user
            await sql`
                UPDATE users
                SET email_verified = TRUE
                WHERE email = ${email}
            `;

            console.log(`✅ Utente esistente verificato!`);
            console.log(`\nCredenziali:`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log(`\n🎉 Vai su http://localhost:3000/login`);
            process.exit(0);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await sql`
            INSERT INTO users (
                email,
                password_hash,
                full_name,
                email_verified,
                subscription_plan,
                monthly_scan_limit,
                scan_count
            ) VALUES (
                ${email},
                ${passwordHash},
                ${fullName},
                TRUE,
                'free',
                5,
                0
            )
            RETURNING id, email, full_name, subscription_plan, monthly_scan_limit
        `;

        const user = result.rows[0];

        console.log(`\n✅ Utente creato con successo!`);
        console.log(`\nDettagli:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Nome: ${user.full_name}`);
        console.log(`- Piano: ${user.subscription_plan}`);
        console.log(`- Limite scansioni: ${user.monthly_scan_limit}/mese`);

        console.log(`\n🎉 Credenziali:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`\nVai su: http://localhost:3000/login`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Errore:', error.message);

        if (error.message.includes('relation "users" does not exist')) {
            console.log('\n💡 Il database non è stato inizializzato!');
            console.log('Esegui prima: node scripts/init-db.js');
        }

        process.exit(1);
    }
}

createTestUser();
