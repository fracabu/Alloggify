/**
 * Stripe Payment Success Handler (Local Development)
 * POST /api/stripe/payment-success
 *
 * This endpoint simulates the webhook for local development.
 * In production, the actual webhook at /api/webhooks/stripe handles this.
 */

const express = require('express');
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

// Pricing configuration
const PLAN_LIMITS = {
    free: 5,
    basic: 100,
    pro: 500,
    enterprise: 999999
};

// Middleware to verify JWT token
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token di autenticazione mancante'
            });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            req.email = decoded.email;
            next();
        } catch (err) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token non valido o scaduto'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante la verifica del token'
        });
    }
};

// ========================================
// POST /api/stripe/payment-success
// ========================================
router.post('/payment-success', requireAuth, async (req, res) => {
    try {
        const { planName } = req.body;
        const userId = req.userId;

        // Validate plan
        if (!planName || !['basic', 'pro', 'enterprise'].includes(planName)) {
            return res.status(400).json({
                error: 'Invalid plan',
                message: 'Piano non valido'
            });
        }

        const scanLimit = PLAN_LIMITS[planName];

        console.log(`[Stripe Success] Upgrading user ${userId} to ${planName} plan`);

        // Update user subscription in database
        await pool.query(
            `UPDATE users
             SET subscription_plan = $1,
                 monthly_scan_limit = $2,
                 scan_count = 0,
                 subscription_status = 'active',
                 last_scan_reset_at = NOW(),
                 updated_at = NOW()
             WHERE id = $3`,
            [planName, scanLimit, userId]
        );

        // Get updated user
        const userResult = await pool.query(
            'SELECT id, email, full_name, subscription_plan, monthly_scan_limit, scan_count FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        console.log(`✅ User ${userId} upgraded successfully to ${planName}`);

        return res.status(200).json({
            success: true,
            message: `Piano aggiornato a ${planName} con successo!`,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                subscriptionPlan: user.subscription_plan,
                monthlyScanLimit: user.monthly_scan_limit,
                scanCount: user.scan_count
            }
        });

    } catch (error) {
        console.error('❌ Payment success handler error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante l\'aggiornamento del piano'
        });
    }
});

module.exports = router;
