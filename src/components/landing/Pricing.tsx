import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, BoltIcon } from '@heroicons/react/24/outline';

export const Pricing: React.FC = () => {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

    const plans = [
        {
            name: 'Free',
            description: 'Per provare il servizio',
            price: { monthly: 0, annual: 0 },
            popular: false,
            features: [
                '5 scansioni/mese',
                'OCR base',
                'Chrome extension',
                'Supporto email',
                'Cronologia 7 giorni'
            ],
            limitations: [
                'No esportazione dati',
                'No API access'
            ],
            cta: 'Inizia Gratis',
            ctaLink: '/signup?plan=free'
        },
        {
            name: 'Basic',
            description: 'Per B&B e piccole strutture',
            price: { monthly: 19, annual: 15 },
            savings: '21%',
            popular: true,
            features: [
                '100 scansioni/mese',
                'OCR avanzato',
                'Chrome extension',
                'Cronologia completa',
                'Esportazione Excel/CSV',
                'Supporto email prioritario',
                '10 template personalizzati',
                'ROI 530%'
            ],
            cta: 'Inizia con Basic',
            ctaLink: '/signup?plan=basic'
        },
        {
            name: 'Pro',
            description: 'Per hotel medi e gestori multi-property',
            price: { monthly: 49, annual: 39 },
            savings: '20%',
            popular: false,
            features: [
                '500 scansioni/mese',
                'Tutto di Basic +',
                'Batch processing (10 doc)',
                'API access (rate-limited)',
                'Multi-utente (5 account)',
                'Supporto chat prioritario',
                'Statistiche avanzate',
                'Webhook notifications',
                'ROI 820%'
            ],
            cta: 'Scegli Pro',
            ctaLink: '/signup?plan=pro'
        },
        {
            name: 'Enterprise',
            description: 'Per catene e grandi resort',
            price: { monthly: 199, annual: 199 },
            popular: false,
            features: [
                'Scansioni illimitate',
                'Tutto di Pro +',
                'API illimitata',
                'Utenti illimitati',
                'White-label option',
                'Integrazione PMS custom',
                'SLA 99.9% uptime',
                'Supporto telefonico',
                'Account manager dedicato',
                'Training on-site'
            ],
            cta: 'Contattaci',
            ctaLink: '/signup?plan=enterprise',
            enterprise: true
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Prezzi Semplici e Trasparenti
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Scegli il piano perfetto per la tua struttura. Nessun costo nascosto.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-md">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${
                                billingPeriod === 'monthly'
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Mensile
                        </button>
                        <button
                            onClick={() => setBillingPeriod('annual')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${
                                billingPeriod === 'annual'
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Annuale
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Risparmia fino al 21%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                                plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                                        <BoltIcon className="h-4 w-4" />
                                        Più Popolare
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Name */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-gray-900">
                                            €{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual}
                                        </span>
                                        <span className="text-gray-600">/mese</span>
                                    </div>
                                    {billingPeriod === 'annual' && plan.savings && plan.price.monthly !== plan.price.annual && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Risparmi €{(plan.price.monthly - plan.price.annual) * 12}/anno ({plan.savings})
                                        </p>
                                    )}
                                    {billingPeriod === 'annual' && plan.price.monthly !== 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Fatturato annualmente (€{plan.price.annual * 12})
                                        </p>
                                    )}
                                </div>

                                {/* Features List */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                    {plan.limitations && plan.limitations.map((limitation, idx) => (
                                        <li key={`limit-${idx}`} className="flex items-start gap-3 opacity-50">
                                            <span className="text-gray-400">✕</span>
                                            <span className="text-sm text-gray-500 line-through">{limitation}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    to={plan.ctaLink}
                                    className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                                        plan.popular
                                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
                                            : plan.enterprise
                                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Link */}
                <div className="text-center mt-12">
                    <p className="text-gray-600">
                        Hai domande sul piano giusto per te?{' '}
                        <a href="#faq" className="text-primary-500 hover:text-primary-600 font-semibold">
                            Consulta le FAQ
                        </a>
                        {' '}o{' '}
                        <a href="mailto:support@alloggify.com" className="text-primary-500 hover:text-primary-600 font-semibold">
                            contattaci
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};
