/**
 * Migration: Add google_id column to users table
 * Run with: node scripts/add-google-id-column.cjs
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
        console.log('🔧 Starting migration: Add google_id column to users table...');

        // Check if column already exists
        const checkColumn = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'google_id'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('✅ Column google_id already exists. No migration needed.');
            return;
        }

        // Add google_id column
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN google_id VARCHAR(255) UNIQUE
        `);

        console.log('✅ Column google_id added successfully!');

        // Create index for performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
        `);

        console.log('✅ Index idx_users_google_id created successfully!');
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
