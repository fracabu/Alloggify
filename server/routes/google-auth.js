/**
 * Google OAuth Routes (Express - Local Development)
 * Mirrors the serverless functions in api/auth/google.ts and api/auth/google/callback.ts
 */

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Email transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtps.aruba.it',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
        rejectUnauthorized: false // Disable SSL verification for local development
    }
});

// Helper function: Send welcome email
async function sendWelcomeEmail(email, fullName) {
    const loginUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login`;
    const fromName = process.env.SMTP_FROM_NAME || 'CheckInly';

    const html = `
<!DOCTYPE html>
<html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #FF385C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #FF385C; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎊 Benvenuto su CheckInly!</h1>
            </div>
            <div class="content">
                <p>Ciao <strong>${fullName}</strong>,</p>
                <p>Grazie per esserti registrato su CheckInly! Il tuo account è pronto all'uso.</p>

                <h2>🚀 Primi passi:</h2>
                <div class="feature">
                    <strong>1. Accedi al tuo account</strong><br>
                    Clicca il pulsante qui sotto per fare login
                </div>
                <div class="feature">
                    <strong>2. Scansiona un documento</strong><br>
                    Carica una foto di un documento e lascia che l'AI estragga i dati
                </div>
                <div class="feature">
                    <strong>3. Esporta i dati</strong><br>
                    Usa il Chrome Extension o l'API SOAP per inviare i dati al portale Alloggiati Web
                </div>

                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Accedi Ora</a>
                </div>

                <p style="margin-top: 30px;">
                    <strong>Piano attuale:</strong> Free (5 scansioni al mese)<br>
                    <strong>Hai bisogno di più scansioni?</strong> Scopri i nostri piani Basic, Pro ed Enterprise
                </p>

                <p>Buon lavoro! 💼</p>
            </div>
            <div class="footer">
                <p>CheckInly - Semplifica la gestione degli alloggiati</p>
                <p>Questo è un messaggio automatico, si prega di non rispondere.</p>
            </div>
        </div>
    </body>
</html>
    `;

    const mailOptions = {
        from: `${fromName} <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎊 Benvenuto su CheckInly!',
        html
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ [Welcome Email] Sent to ${email}`);
    } catch (error) {
        console.error(`❌ [Welcome Email] Failed to send to ${email}:`, error.message);
    }
}

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
        let isNewUser = false;

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

            // Send welcome email (async, don't wait)
            sendWelcomeEmail(data.email, fullName).catch((error) => {
                console.error('❌ Failed to send welcome email:', error);
            });

            isNewUser = true;

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

        // If new user, redirect to signup page with success message (NO auto-login)
        if (isNewUser) {
            console.log(`✅ Redirecting new user to signup confirmation...`);
            const signupSuccessUrl = `${process.env.NEXT_PUBLIC_URL}/signup?` +
                `google_registered=true&` +
                `email=${encodeURIComponent(data.email)}`;
            return res.redirect(signupSuccessUrl);
        }

        // Existing user: proceed with login
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

        // Redirect to frontend with tokens (for existing users doing login)
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
