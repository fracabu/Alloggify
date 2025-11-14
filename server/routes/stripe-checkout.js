/**
 * Stripe Checkout Session Creation Route (Local Development)
 * POST /api/stripe/create-checkout-session
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const { Pool } = require('pg');

const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-10-28.acacia'
});

// Pricing configuration
const PRICING_PLANS = {
    basic: {
        name: 'basic',
        displayName: 'Basic',
        price: 19,
        scanLimit: 100,
        stripePriceId: process.env.STRIPE_PRICE_BASIC
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 49,
        scanLimit: 500,
        stripePriceId: process.env.STRIPE_PRICE_PRO
    },
    enterprise: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 199,
        scanLimit: 999999,
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE
    }
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
// POST /api/stripe/create-checkout-session
// ========================================
router.post('/create-checkout-session', requireAuth, async (req, res) => {
    try {
        const { planName } = req.body;
        const userId = req.userId;

        // Validate plan
        if (!planName || !['basic', 'pro', 'enterprise'].includes(planName)) {
            return res.status(400).json({
                error: 'Invalid plan',
                message: 'Piano non valido. Scegli tra: basic, pro, enterprise'
            });
        }

        const plan = PRICING_PLANS[planName];

        if (!plan.stripePriceId) {
            return res.status(500).json({
                error: 'Configuration error',
                message: `Price ID per piano ${planName} non configurato`
            });
        }

        // Get user
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already subscribed to this plan
        if (user.subscription_plan === planName) {
            return res.status(400).json({
                error: 'Already subscribed',
                message: 'Sei già iscritto a questo piano'
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: userId,
            mode: 'subscription',
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/scan?upgrade=success&plan=${planName}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
            metadata: {
                userId: userId,
                planName: planName,
                userEmail: user.email
            }
        });

        console.log(`[Stripe] Checkout session created for user ${userId}, plan: ${planName}`);

        return res.status(200).json({
            success: true,
            url: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('❌ Stripe checkout error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Errore durante la creazione della sessione di pagamento'
        });
    }
});

module.exports = router;
