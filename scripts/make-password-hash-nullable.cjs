/**
 * Migration: Make password_hash column nullable for OAuth users
 * Run with: node scripts/make-password-hash-nullable.cjs
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    try {
        console.log('🔧 Starting migration: Make password_hash nullable...');

        // Check current constraint
        const checkConstraint = await pool.query(`
            SELECT
                column_name,
                is_nullable,
                data_type
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'password_hash'
        `);

        if (checkConstraint.rows.length === 0) {
            console.log('❌ Column password_hash not found!');
            return;
        }

        const isNullable = checkConstraint.rows[0].is_nullable;
        console.log(`   Current status: is_nullable = ${isNullable}`);

        if (isNullable === 'YES') {
            console.log('✅ Column password_hash is already nullable. No migration needed.');
            return;
        }

        // Alter column to allow NULL values
        await pool.query(`
            ALTER TABLE users
            ALTER COLUMN password_hash DROP NOT NULL
        `);

        console.log('✅ Column password_hash is now nullable!');
        console.log('🎉 Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrate()
    .then(() => {
        console.log('✅ Migration script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
