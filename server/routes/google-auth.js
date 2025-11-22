/**
 * Google OAuth Routes (Express - Local Development)
 * Mirrors the serverless functions in api/auth/google.ts and api/auth/google/callback.ts
 */

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper functions
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen
 */
router.get('/api/auth/google', async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
        );

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });

        console.log('🔐 Redirecting to Google OAuth...');
        return res.redirect(authUrl);

    } catch (error) {
        console.error('❌ Google OAuth redirect error:', error);
        return res.status(500).json({
            error: 'OAuth error',
            message: 'Errore durante il redirect a Google'
        });
    }
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback, create/login user
 */
router.get('/api/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            console.error('❌ Missing OAuth code');
            return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=missing_code`);
        }

        // Exchange code for tokens
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        console.log('✅ Google user info received:', data.email);

        if (!data.email) {
            console.error('❌ No email from Google');
            return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=no_email`);
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [data.email.toLowerCase()]
        );

        let user = userResult.rows[0];

        if (!user) {
            // Create new user
            const fullName = data.name || data.email.split('@')[0];

            const insertResult = await pool.query(
                `INSERT INTO users (
                    email,
                    password_hash,
                    full_name,
                    email_verified,
                    google_id,
                    subscription_plan,
                    monthly_scan_limit,
                    scan_count
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [
                    data.email.toLowerCase(),
                    null, // OAuth users don't have password
                    fullName,
                    true, // Google already verified the email
                    data.id, // Store Google ID
                    'free', // Default plan
                    5, // Free plan limit
                    0 // Initial scan count
                ]
            );

            user = insertResult.rows[0];
            console.log(`✅ New user created via Google OAuth: ${data.email}`);

        } else if (!user.email_verified) {
            // If user exists but email not verified, verify it now
            await pool.query(
                `UPDATE users
                SET email_verified = TRUE,
                    google_id = $1,
                    updated_at = NOW()
                WHERE id = $2`,
                [data.id, user.id]
            );
            user.email_verified = true;
            console.log(`✅ Email verified for existing user: ${data.email}`);
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Prepare user object
        const userObj = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            companyName: user.company_name,
            subscriptionPlan: user.subscription_plan,
            monthlyScanLimit: user.monthly_scan_limit,
            scanCount: user.scan_count,
            emailVerified: user.email_verified
        };

        console.log('✅ User authenticated, redirecting to frontend...');

        // Redirect to frontend with tokens
        const frontendUrl = `${process.env.NEXT_PUBLIC_URL}/login?` +
            `google_auth=success&` +
            `token=${accessToken}&` +
            `refresh=${refreshToken}&` +
            `user=${encodeURIComponent(JSON.stringify(userObj))}`;

        return res.redirect(frontendUrl);

    } catch (error) {
        console.error('❌ Google OAuth callback error:', error);
        return res.redirect(
            `${process.env.NEXT_PUBLIC_URL}/login?error=oauth_failed&message=${encodeURIComponent(error.message)}`
        );
    }
});

module.exports = router;
