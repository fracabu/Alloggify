/**
 * Script per creare un utente di test già verificato
 * Versione ottimizzata per funzionare sia localmente che su Vercel
 *
 * Usage: node scripts/create-test-user-local.js
 */

import { config } from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

async function createTestUser() {
    let client;

    try {
        // User details
        const email = 'test@test.com';
        const password = 'Test1234';
        const fullName = 'Test User';

        console.log(`🔨 Creando utente di test...`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        // Create PostgreSQL client
        const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('POSTGRES_URL o DATABASE_URL non trovato in .env.local');
        }

        console.log('📡 Connessione al database...');

        client = new Client({
            connectionString,
            ssl: {
                rejectUnauthorized: false // Neon requires SSL
            }
        });

        await client.connect();
        console.log('✅ Connesso al database');

        // Check if user already exists
        const existingResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingResult.rows.length > 0) {
            console.log(`\n⚠️  Utente già esistente!`);
            console.log(`Verifico l'utente esistente...`);

            // Just verify the existing user
            await client.query(
                'UPDATE users SET email_verified = TRUE WHERE email = $1',
                [email]
            );

            console.log(`✅ Utente esistente verificato!`);
            console.log(`\nCredenziali:`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log(`\n🎉 Vai su http://localhost:3000/login`);

            await client.end();
            process.exit(0);
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        console.log('💾 Creazione utente...');
        const result = await client.query(
            `INSERT INTO users (
                email,
                password_hash,
                full_name,
                email_verified,
                subscription_plan,
                monthly_scan_limit,
                scan_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, full_name, subscription_plan, monthly_scan_limit`,
            [email, passwordHash, fullName, true, 'free', 5, 0]
        );

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

        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Errore:', error.message);

        if (error.code === '42P01') {
            console.log('\n💡 Il database non è stato inizializzato!');
            console.log('Esegui prima: node scripts/init-db.js');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.log('\n💡 Impossibile connettersi al database. Verifica:');
            console.log('1. La connessione internet');
            console.log('2. Le credenziali in .env.local');
            console.log('3. Che il database Neon sia attivo');
        }

        if (client) {
            await client.end();
        }

        process.exit(1);
    }
}

createTestUser();
