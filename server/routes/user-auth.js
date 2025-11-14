/**
 * User Authentication Routes for Local Development
 * POST /api/auth/login
 * POST /api/auth/register
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper functions
const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========================================
// POST /api/auth/login
// ========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email e password sono obbligatorie'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email non valida'
            });
        }

        // Get user from database
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email o password non corretti'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email o password non corretti'
            });
        }

        // Check email verification
        if (!user.email_verified) {
            return res.status(403).json({
                error: 'Email not verified',
                message: 'Devi verificare la tua email prima di accedere. Controlla la tua casella di posta.',
                requiresVerification: true
            });
        }

        // Generate JWT tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            subscriptionPlan: user.subscription_plan
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Update last login
        await pool.query(
            'UPDATE users SET last_login_at = NOW() WHERE id = $1',
            [user.id]
        );

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Login effettuato con successo!',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                companyName: user.company_name,
                subscriptionPlan: user.subscription_plan,
                subscriptionStatus: user.subscription_status,
                scanCount: user.scan_count,
                monthlyScanLimit: user.monthly_scan_limit,
                emailVerified: user.email_verified,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante il login. Riprova più tardi.'
        });
    }
});

// ========================================
// POST /api/auth/register
// ========================================
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, companyName } = req.body;

        // Validation
        if (!email || !password || !fullName) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email, password e nome completo sono obbligatori'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email non valida'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'La password deve essere di almeno 6 caratteri'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'Un utente con questa email esiste già'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (
                email,
                password_hash,
                full_name,
                company_name,
                email_verified,
                subscription_plan,
                monthly_scan_limit,
                scan_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, full_name, company_name`,
            [
                email.toLowerCase(),
                passwordHash,
                fullName,
                companyName || null,
                false, // email_verified (must verify via email)
                'free',
                5,
                0
            ]
        );

        const newUser = result.rows[0];

        // TODO: Send verification email here
        // For now, just return success

        return res.status(201).json({
            success: true,
            message: 'Registrazione completata! Controlla la tua email per verificare l\'account.',
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.full_name,
                companyName: newUser.company_name
            }
        });

    } catch (error) {
        console.error('❌ Register error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante la registrazione. Riprova più tardi.'
        });
    }
});

module.exports = router;
