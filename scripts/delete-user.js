/**
 * Script per cancellare un utente dal database
 * Usage: node scripts/delete-user.js email@example.com
 */

import { config } from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;

// Load environment variables
config({ path: '.env.local' });

async function deleteUser(email) {
    let client;

    try {
        console.log(`🔍 Cercando utente: ${email}`);

        // Create PostgreSQL client
        const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('POSTGRES_URL o DATABASE_URL non trovato in .env.local');
        }

        client = new Client({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await client.connect();
        console.log('✅ Connesso al database');

        // Get user info before deleting
        const userResult = await client.query(
            'SELECT id, email, full_name, subscription_plan FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            console.log(`❌ Utente non trovato: ${email}`);
            await client.end();
            process.exit(1);
        }

        const user = userResult.rows[0];
        console.log(`\n📋 Utente trovato:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.full_name}`);
        console.log(`   Piano: ${user.subscription_plan}`);

        // Delete related data first (foreign key constraints)
        console.log(`\n🗑️  Cancellazione dati correlati...`);

        // Delete scans
        try {
            const scansResult = await client.query(
                'DELETE FROM scans WHERE user_id = $1 RETURNING id',
                [user.id]
            );
            console.log(`   ✅ Cancellate ${scansResult.rowCount} scansioni`);
        } catch (err) {
            console.log(`   ⚠️  Tabella scans non trovata o già vuota`);
        }

        // Delete user actions (if table exists)
        try {
            const actionsResult = await client.query(
                'DELETE FROM user_actions WHERE user_id = $1 RETURNING id',
                [user.id]
            );
            console.log(`   ✅ Cancellate ${actionsResult.rowCount} azioni utente`);
        } catch (err) {
            console.log(`   ⚠️  Tabella user_actions non trovata`);
        }

        // Delete subscriptions (if table exists)
        try {
            const subscriptionsResult = await client.query(
                'DELETE FROM subscriptions WHERE user_id = $1 RETURNING id',
                [user.id]
            );
            console.log(`   ✅ Cancellate ${subscriptionsResult.rowCount} sottoscrizioni`);
        } catch (err) {
            console.log(`   ⚠️  Tabella subscriptions non trovata`);
        }

        // Delete user
        console.log(`\n🗑️  Cancellazione utente...`);
        await client.query(
            'DELETE FROM users WHERE id = $1',
            [user.id]
        );

        console.log(`\n✅ Utente ${email} cancellato con successo!`);

        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Errore:', error.message);

        if (client) {
            await client.end();
        }

        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.log('❌ Errore: Email non specificata');
    console.log('\nUsage: node scripts/delete-user.js email@example.com');
    console.log('Esempio: node scripts/delete-user.js test@test.com');
    process.exit(1);
}

deleteUser(email);
