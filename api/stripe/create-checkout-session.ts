/**
 * Stripe Checkout Session Creation
 * POST /api/stripe/create-checkout-session
 *
 * Creates a Stripe Checkout session for subscription upgrade
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getIpAddress, getUserAgent } from '../../lib/auth';
import { getUserById, logUserAction } from '../../lib/db';
import { getStripePriceId, getPricingPlan } from '../../lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ========================================
        // 1. AUTHENTICATION
        // ========================================
        const authPayload = await requireAuth(req, res);
        if (!authPayload) return;

        const userId = authPayload.userId;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ========================================
        // 2. VALIDATE REQUEST
        // ========================================
        const { planName } = req.body;

        if (!planName || !['basic', 'pro', 'enterprise'].includes(planName)) {
            return res.status(400).json({
                error: 'Invalid plan',
                message: 'Piano non valido. Scegli tra: basic, pro, enterprise'
            });
        }

        const plan = getPricingPlan(planName);
        if (!plan) {
            return res.status(400).json({ error: 'Plan not found' });
        }

        const stripePriceId = getStripePriceId(planName);
        if (!stripePriceId) {
            return res.status(400).json({
                error: 'Plan not configured',
                message: 'Questo piano non è ancora configurato'
            });
        }

        // Check if user is already on this plan or higher
        if (user.subscription_plan === planName) {
            return res.status(400).json({
                error: 'Already subscribed',
                message: 'Sei già iscritto a questo piano'
            });
        }

        console.log(`[Stripe] Creating checkout session for user ${userId}, plan: ${planName}`);

        // ========================================
        // 3. CREATE STRIPE CHECKOUT SESSION
        // ========================================
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: userId, // Link session to user
            mode: 'subscription',
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success&plan=${planName}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
            metadata: {
                userId,
                planName,
                userEmail: user.email
            },
            subscription_data: {
                metadata: {
                    userId,
                    planName
                }
            }
        });

        // ========================================
        // 4. LOG ACTION
        // ========================================
        await logUserAction({
            userId,
            action: 'checkout_session_created',
            metadata: {
                planName,
                sessionId: session.id,
                amount: plan.price
            },
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req)
        });

        console.log(`[Stripe] ✅ Checkout session created: ${session.id}`);

        // ========================================
        // 5. RETURN CHECKOUT URL
        // ========================================
        return res.status(200).json({
            success: true,
            url: session.url,
            sessionId: session.id
        });

    } catch (error: any) {
        console.error('[Stripe Checkout Error]', error);

        return res.status(500).json({
            error: 'Checkout session creation failed',
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : 'Errore durante la creazione della sessione di pagamento'
        });
    }
}
