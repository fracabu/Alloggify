/**
 * Consolidated Stripe API
 * Endpoint: /api/stripe?action=<action>
 *
 * Consolidates Stripe-related functions into 1 mega-route
 *
 * Actions:
 * - checkout: Create checkout session for subscription
 * - portal: Create customer portal session (manage subscription)
 * - payment-success: Handle post-payment redirect (future)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getIpAddress, getUserAgent } from '../lib/auth';
import { getUserById, logUserAction } from '../lib/db';
import { getStripePriceId, getPricingPlan } from '../lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get action from query params
  const action = (req.query.action as string)?.toLowerCase();

  if (!action) {
    return res.status(400).json({
      error: 'Missing action parameter',
      message: 'Specify ?action=checkout|portal|payment-success'
    });
  }

  try {
    // Route to appropriate handler
    switch (action) {
      case 'checkout':
        return await handleCheckout(req, res);
      case 'portal':
        return await handleCustomerPortal(req, res);
      case 'payment-success':
        return await handlePaymentSuccess(req, res);
      default:
        return res.status(400).json({
          error: 'Invalid action',
          message: `Unknown action: ${action}`
        });
    }
  } catch (error: any) {
    console.error(`[Stripe API] Error in action "${action}":`, error);
    return res.status(500).json({
      error: 'Server error',
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Errore del server Stripe. Riprova più tardi.'
    });
  }
}

// ============================================
// CHECKOUT HANDLER
// ============================================
async function handleCheckout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication
  const authPayload = await requireAuth(req, res);
  if (!authPayload) return;

  const userId = authPayload.userId;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Validate request
  const { planName, billingPeriod } = req.body; // billingPeriod: 'monthly' | 'annual'

  if (!planName || !['starter', 'pro', 'enterprise'].includes(planName)) {
    return res.status(400).json({
      error: 'Invalid plan',
      message: 'Piano non valido. Scegli tra: starter, pro, enterprise'
    });
  }

  const plan = getPricingPlan(planName);
  if (!plan) {
    return res.status(400).json({ error: 'Plan not found' });
  }

  // Get appropriate Price ID (monthly or annual)
  let stripePriceId: string | null;
  if (billingPeriod === 'annual' && plan.stripePriceIdAnnual) {
    stripePriceId = plan.stripePriceIdAnnual;
  } else {
    stripePriceId = plan.stripePriceId;
  }

  if (!stripePriceId || stripePriceId.includes('_xxx')) {
    return res.status(400).json({
      error: 'Plan not configured',
      message: 'Questo piano non è ancora configurato. Contatta il supporto.'
    });
  }

  // Check if user is already on this plan
  if (user.subscription_plan === planName) {
    return res.status(400).json({
      error: 'Already subscribed',
      message: 'Sei già iscritto a questo piano'
    });
  }

  console.log(`[Stripe] Creating checkout session for user ${userId}, plan: ${planName}, period: ${billingPeriod || 'monthly'}`);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: userId, // Link session to user
    mode: 'subscription',
    line_items: [
      {
        price: stripePriceId,
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success&plan=${planName}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/upgrade?canceled=true`,
    metadata: {
      userId,
      planName,
      userEmail: user.email,
      billingPeriod: billingPeriod || 'monthly'
    },
    subscription_data: {
      metadata: {
        userId,
        planName
      }
    }
  });

  // Log action
  await logUserAction({
    userId,
    action: 'checkout_session_created',
    metadata: {
      planName,
      sessionId: session.id,
      amount: plan.price,
      billingPeriod: billingPeriod || 'monthly'
    },
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  console.log(`[Stripe] ✅ Checkout session created: ${session.id}`);

  return res.status(200).json({
    success: true,
    url: session.url,
    sessionId: session.id
  });
}

// ============================================
// CUSTOMER PORTAL HANDLER
// ============================================
async function handleCustomerPortal(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication
  const authPayload = await requireAuth(req, res);
  if (!authPayload) return;

  const userId = authPayload.userId;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user has Stripe customer ID
  if (!user.stripe_customer_id) {
    return res.status(400).json({
      error: 'No subscription',
      message: 'Non hai ancora un abbonamento attivo'
    });
  }

  console.log(`[Stripe] Creating customer portal session for user ${userId}`);

  // Create Customer Portal Session
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`
  });

  // Log action
  await logUserAction({
    userId,
    action: 'customer_portal_accessed',
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  console.log(`[Stripe] ✅ Customer portal session created`);

  return res.status(200).json({
    success: true,
    url: session.url
  });
}

// ============================================
// PAYMENT SUCCESS HANDLER (Future)
// ============================================
async function handlePaymentSuccess(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({
      error: 'Missing session_id',
      message: 'Session ID mancante'
    });
  }

  try {
    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Pagamento completato con successo!',
        subscription: {
          status: session.status,
          customerEmail: session.customer_email
        }
      });
    } else {
      return res.status(400).json({
        error: 'Payment not completed',
        message: 'Pagamento non completato'
      });
    }
  } catch (error) {
    console.error('[Stripe] Error retrieving session:', error);
    return res.status(500).json({
      error: 'Failed to retrieve session',
      message: 'Errore durante il recupero della sessione'
    });
  }
}
