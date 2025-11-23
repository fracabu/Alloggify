/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription management
 * Important: This endpoint must be configured in Stripe Dashboard
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { getScanLimit } from '../../lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Disable body parser for raw body access
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Read raw body from request
 */
async function getRawBody(req: VercelRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ========================================
        // 1. VERIFY WEBHOOK SIGNATURE
        // ========================================
        const rawBody = await getRawBody(req);
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            console.error('[Stripe Webhook] Missing signature');
            return res.status(400).json({ error: 'Missing signature' });
        }

        if (!webhookSecret) {
            console.error('[Stripe Webhook] Webhook secret not configured');
            return res.status(500).json({ error: 'Webhook not configured' });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err: any) {
            console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
            return res.status(400).json({ error: `Webhook signature verification failed` });
        }

        console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

        // ========================================
        // 2. HANDLE EVENT TYPES
        // ========================================
        switch (event.type) {
            // ========================================
            // A. CHECKOUT SESSION COMPLETED
            // User completed payment for subscription
            // ========================================
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const userId = session.client_reference_id || session.metadata?.userId;
                const planName = session.metadata?.planName;

                if (!userId || !planName) {
                    console.error('[Stripe Webhook] Missing userId or planName in session metadata');
                    break;
                }

                console.log(`[Stripe Webhook] Checkout completed for user ${userId}, plan: ${planName}`);

                // Update user subscription plan and scan limit
                const scanLimit = getScanLimit(planName);

                await sql`
                    UPDATE users
                    SET
                        subscription_plan = ${planName},
                        monthly_scan_limit = ${scanLimit},
                        stripe_customer_id = ${session.customer as string},
                        stripe_subscription_id = ${session.subscription as string},
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;

                // Create subscription record
                if (session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

                    await sql`
                        INSERT INTO subscriptions (
                            user_id,
                            stripe_subscription_id,
                            stripe_customer_id,
                            plan_name,
                            status,
                            current_period_start,
                            current_period_end
                        ) VALUES (
                            ${userId},
                            ${subscription.id},
                            ${subscription.customer as string},
                            ${planName},
                            ${subscription.status},
                            to_timestamp(${subscription.current_period_start}),
                            to_timestamp(${subscription.current_period_end})
                        )
                        ON CONFLICT (stripe_subscription_id)
                        DO UPDATE SET
                            status = ${subscription.status},
                            current_period_start = to_timestamp(${subscription.current_period_start}),
                            current_period_end = to_timestamp(${subscription.current_period_end}),
                            updated_at = NOW()
                    `;
                }

                console.log(`[Stripe Webhook] ✅ User ${userId} upgraded to ${planName}`);
                break;
            }

            // ========================================
            // B. INVOICE PAYMENT SUCCEEDED
            // Recurring payment succeeded - renew subscription
            // ========================================
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                // invoice.subscription can be string ID or null
                const subscriptionId = (invoice as any).subscription;
                if (!subscriptionId) break;

                const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
                const userId = subscription.metadata?.userId;

                if (!userId) break;

                console.log(`[Stripe Webhook] Invoice paid for user ${userId}`);

                // Reset scan count on successful payment
                await sql`
                    UPDATE users
                    SET
                        scan_count = 0,
                        last_scan_reset_at = NOW(),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;

                // Update subscription record
                await sql`
                    UPDATE subscriptions
                    SET
                        status = ${subscription.status},
                        current_period_start = to_timestamp(${subscription.current_period_start}),
                        current_period_end = to_timestamp(${subscription.current_period_end}),
                        updated_at = NOW()
                    WHERE stripe_subscription_id = ${subscription.id}
                `;

                console.log(`[Stripe Webhook] ✅ Subscription renewed for user ${userId}`);
                break;
            }

            // ========================================
            // C. SUBSCRIPTION DELETED
            // User canceled subscription
            // ========================================
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (!userId) break;

                console.log(`[Stripe Webhook] Subscription canceled for user ${userId}`);

                // Downgrade to free plan
                const freeScanLimit = getScanLimit('free');

                await sql`
                    UPDATE users
                    SET
                        subscription_plan = 'free',
                        monthly_scan_limit = ${freeScanLimit},
                        subscription_status = 'cancelled',
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;

                // Update subscription record
                await sql`
                    UPDATE subscriptions
                    SET
                        status = 'canceled',
                        cancel_at_period_end = FALSE,
                        cancelled_at = NOW(),
                        updated_at = NOW()
                    WHERE stripe_subscription_id = ${subscription.id}
                `;

                console.log(`[Stripe Webhook] ✅ User ${userId} downgraded to free`);
                break;
            }

            // ========================================
            // D. SUBSCRIPTION UPDATED
            // Subscription plan changed
            // ========================================
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (!userId) break;

                const planName = subscription.metadata?.planName;
                if (!planName) break;

                console.log(`[Stripe Webhook] Subscription updated for user ${userId}`);

                // Update subscription record
                await sql`
                    UPDATE subscriptions
                    SET
                        status = ${subscription.status},
                        cancel_at_period_end = ${subscription.cancel_at_period_end || false},
                        current_period_start = to_timestamp(${subscription.current_period_start}),
                        current_period_end = to_timestamp(${subscription.current_period_end}),
                        updated_at = NOW()
                    WHERE stripe_subscription_id = ${subscription.id}
                `;

                console.log(`[Stripe Webhook] ✅ Subscription updated for user ${userId}`);
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        // ========================================
        // 3. RETURN SUCCESS
        // ========================================
        return res.status(200).json({ received: true });

    } catch (error: any) {
        console.error('[Stripe Webhook Error]', error);

        return res.status(500).json({
            error: 'Webhook handler failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}
