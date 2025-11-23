/**
 * Pricing Plans Configuration
 * Defines subscription tiers, limits, and Stripe price IDs
 *
 * Updated: 2025-11-23
 * - Added 'starter' plan (replaces 'basic')
 * - Added propertyLimit field (multi-property support)
 * - Updated pricing: FREE 10 invii, STARTER €39, PRO €79, ENTERPRISE €249
 * - Renamed scanLimit → monthlyInvii (terminology update)
 */

export interface PricingPlan {
    name: 'free' | 'starter' | 'pro' | 'enterprise';
    displayName: string;
    price: number; // EUR per month
    monthlyInvii: number; // Monthly submission limit (renamed from scanLimit)
    propertyLimit: number; // Max number of properties allowed
    overageFee: number | null; // EUR per extra submission (null if not applicable)
    stripePriceId: string | null; // Stripe Price ID (null for free)
    stripePriceIdAnnual: string | null; // Annual plan (-20% discount)
    features: string[];
    recommended?: boolean;
}

// Legacy alias for backward compatibility
export type ScanLimit = number;
export const OVERAGE_FEE_PER_SUBMISSION = 0.15; // €0.15 per extra invio

export const PRICING_PLANS: Record<string, PricingPlan> = {
    free: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        monthlyInvii: 10,
        propertyLimit: 1,
        overageFee: null,
        stripePriceId: null,
        stripePriceIdAnnual: null,
        features: [
            '10 invii al mese',
            '1 struttura',
            'OCR Gemini AI',
            'WSKEY integrazione',
            'Storage ricevute (90 giorni)',
            'AI Assistant (5 domande/giorno)',
            'Email support (48h)'
        ]
    },
    starter: {
        name: 'starter',
        displayName: 'Starter',
        price: 39,
        monthlyInvii: 250,
        propertyLimit: 5,
        overageFee: null, // Hard limit, no overage
        stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_xxx',
        stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual_xxx',
        features: [
            '250 invii al mese',
            '5 strutture',
            'OCR Gemini AI',
            'WSKEY integrazione',
            'Storage ricevute permanente',
            'AI Assistant illimitato',
            'Download ricevute ZIP',
            'Email support (24h)'
        ]
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 79,
        monthlyInvii: 600,
        propertyLimit: 999999, // Unlimited
        overageFee: OVERAGE_FEE_PER_SUBMISSION, // €0.15 per extra invio
        stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_xxx',
        stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_xxx',
        features: [
            '600 invii al mese',
            'Strutture ILLIMITATE',
            'Overage: €0.15/invio extra',
            'Multi-utente (fino a 3)',
            'API read-only',
            'Export CSV/Excel',
            'Dashboard analytics avanzata',
            'Support prioritario (4h)'
        ],
        recommended: true
    },
    enterprise: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 249,
        monthlyInvii: 999999, // Unlimited
        propertyLimit: 999999, // Unlimited
        overageFee: null, // Custom pricing for high volume
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_xxx',
        stripePriceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual_xxx',
        features: [
            'Invii ILLIMITATI',
            'Strutture ILLIMITATE',
            'Multi-utente ILLIMITATO',
            'API completa (POST/PUT/DELETE)',
            'Account manager dedicato',
            'SLA 99.9% uptime',
            'Support prioritario (30min)',
            'Training team (2h incluse)',
            'White-label (+€150/mese opzionale)'
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
 * Get monthly invii limit for a plan
 */
export function getMonthlyInviiLimit(planName: string): number {
    const plan = getPricingPlan(planName);
    return plan?.monthlyInvii || 0;
}

/**
 * Get scan limit for a plan (legacy alias for backward compatibility)
 */
export function getScanLimit(planName: string): number {
    return getMonthlyInviiLimit(planName);
}

/**
 * Get property limit for a plan
 */
export function getPropertyLimit(planName: string): number {
    const plan = getPricingPlan(planName);
    return plan?.propertyLimit || 1;
}

/**
 * Get overage fee for a plan
 */
export function getOverageFee(planName: string): number | null {
    const plan = getPricingPlan(planName);
    return plan?.overageFee || null;
}

/**
 * Calculate overage charges
 * @param planName - Subscription plan name
 * @param actualInvii - Actual number of invii used
 * @returns Overage charge in EUR (0 if no overage or plan doesn't allow it)
 */
export function calculateOverageCharge(planName: string, actualInvii: number): number {
    const plan = getPricingPlan(planName);
    if (!plan || !plan.overageFee) return 0;

    const overage = actualInvii - plan.monthlyInvii;
    if (overage <= 0) return 0;

    return overage * plan.overageFee;
}

/**
 * Check if user can add more properties
 * @param planName - Subscription plan name
 * @param currentPropertiesCount - Current number of properties
 * @returns true if user can add more properties
 */
export function canAddProperty(planName: string, currentPropertiesCount: number): boolean {
    const limit = getPropertyLimit(planName);
    return currentPropertiesCount < limit;
}
