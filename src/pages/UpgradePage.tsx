import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeModernIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui';

export const UpgradePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reason = searchParams.get('reason');
    const fromScanLimit = reason === 'scan_limit';

    const handleUpgrade = async (planName: 'basic' | 'pro' | 'enterprise') => {
        setLoading(true);
        setError('');

        try {
            const token = sessionStorage.getItem('alloggify_token');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante la creazione della sessione di pagamento');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (err) {
            console.error('Upgrade error:', err);
            setError(err instanceof Error ? err.message : 'Errore durante l\'upgrade');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Alert if coming from scan limit */}
                {fromScanLimit && (
                    <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <XCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                    Hai raggiunto il limite di scansioni
                                </h3>
                                <p className="text-yellow-800">
                                    Hai utilizzato tutte le <strong>{user?.monthlyScanLimit || 5} scansioni gratuite</strong> del piano Free.
                                    Effettua l'upgrade per continuare a usare CheckInly senza limiti!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Scegli il piano perfetto per te
                    </h1>
                    <p className="text-xl text-gray-600">
                        Sblocca tutte le funzionalità e risparmia tempo nella gestione degli alloggi
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Basic Plan */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:border-primary-500 transition-all">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">€19</span>
                            <span className="text-gray-600">/mese</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">100 scansioni/mese</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">OCR documenti italiani</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Invio automatico Alloggiati Web</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Supporto email</span>
                            </li>
                        </ul>
                        <Button
                            onClick={() => handleUpgrade('basic')}
                            disabled={loading || user?.subscriptionPlan === 'basic'}
                            className="w-full"
                        >
                            {user?.subscriptionPlan === 'basic' ? 'Piano Attuale' : 'Passa a Basic'}
                        </Button>
                    </div>

                    {/* Pro Plan - Recommended */}
                    <div className="bg-white rounded-2xl shadow-2xl border-4 border-primary-500 p-8 relative transform scale-105">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                Consigliato
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-primary-600">€49</span>
                            <span className="text-gray-600">/mese</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700"><strong>500 scansioni/mese</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Tutti i documenti internazionali</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">API REST incluse</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">AI Assistant avanzato</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Supporto prioritario</span>
                            </li>
                        </ul>
                        <Button
                            onClick={() => handleUpgrade('pro')}
                            disabled={loading || user?.subscriptionPlan === 'pro'}
                            className="w-full bg-primary-600 hover:bg-primary-700"
                        >
                            {user?.subscriptionPlan === 'pro' ? 'Piano Attuale' : 'Passa a Pro'}
                        </Button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:border-primary-500 transition-all">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">€199</span>
                            <span className="text-gray-600">/mese</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700"><strong>Scansioni illimitate</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Multi-property management</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">White-label disponibile</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">Account manager dedicato</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">SLA garantito 99.9%</span>
                            </li>
                        </ul>
                        <Button
                            onClick={() => handleUpgrade('enterprise')}
                            disabled={loading || user?.subscriptionPlan === 'enterprise'}
                            className="w-full"
                        >
                            {user?.subscriptionPlan === 'enterprise' ? 'Piano Attuale' : 'Contattaci'}
                        </Button>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center mt-12">
                    <Link to="/dashboard" className="text-primary-500 hover:text-primary-600 font-medium">
                        ← Torna alla Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};
