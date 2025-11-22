/**
 * Pricing Plans Configuration
 * Defines subscription tiers, limits, and Stripe price IDs
 */

export interface PricingPlan {
    name: 'free' | 'basic' | 'pro' | 'enterprise';
    displayName: string;
    price: number; // EUR per month
    scanLimit: number;
    stripePriceId: string | null; // Stripe Price ID (null for free)
    features: string[];
    recommended?: boolean;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
    free: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        scanLimit: 5,
        stripePriceId: null,
        features: [
            '5 scansioni al mese',
            'Estrazione dati documenti',
            'Supporto email',
            'Chrome Extension'
        ]
    },
    basic: {
        name: 'basic',
        displayName: 'Basic',
        price: 15, // Updated to match UI pricing (was 19)
        scanLimit: 100,
        stripePriceId: process.env.STRIPE_PRICE_BASIC || 'price_basic_xxx', // TODO: Replace with real Stripe Price ID
        features: [
            '100 scansioni al mese',
            'Estrazione dati documenti',
            'API Alloggiati Web (SOAP)',
            'Supporto prioritario',
            'Chrome Extension',
            'Dashboard analytics'
        ],
        recommended: true
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 39, // Updated to match UI pricing (was 49)
        scanLimit: 500,
        stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_xxx', // TODO: Replace with real Stripe Price ID
        features: [
            '500 scansioni al mese',
            'Estrazione dati documenti',
            'API Alloggiati Web (SOAP)',
            'Supporto prioritario',
            'Chrome Extension',
            'Dashboard analytics',
            'AI Assistant illimitato',
            'Export dati CSV'
        ]
    },
    enterprise: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 199,
        scanLimit: 999999, // Virtually unlimited
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_xxx', // TODO: Replace with real Stripe Price ID
        features: [
            'Scansioni illimitate',
            'Estrazione dati documenti',
            'API Alloggiati Web (SOAP)',
            'Supporto dedicato 24/7',
            'Chrome Extension',
            'Dashboard analytics',
            'AI Assistant illimitato',
            'Export dati CSV',
            'Multi-utente',
            'API access',
            'SLA garantito'
        ]
    }
};

/**
 * Get pricing plan by name
 */
export function getPricingPlan(planName: string): PricingPlan | null {
    return PRICING_PLANS[planName] || null;
}

/**
 * Get all pricing plans as array
 */
export function getAllPricingPlans(): PricingPlan[] {
    return Object.values(PRICING_PLANS);
}

/**
 * Check if a plan is paid
 */
export function isPaidPlan(planName: string): boolean {
    const plan = getPricingPlan(planName);
    return plan !== null && plan.price > 0;
}

/**
 * Get Stripe Price ID for a plan
 */
export function getStripePriceId(planName: string): string | null {
    const plan = getPricingPlan(planName);
    return plan?.stripePriceId || null;
}

/**
 * Get scan limit for a plan
 */
export function getScanLimit(planName: string): number {
    const plan = getPricingPlan(planName);
    return plan?.scanLimit || 0;
}
