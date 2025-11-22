import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Pagina di test per Stripe Checkout
 * Accessibile su /test-stripe
 */
export const TestStripePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpgrade = async (planName: string) => {
        setLoading(true);
        setError('');

        try {
            const token = sessionStorage.getItem('alloggify_token');

            if (!token) {
                setError('Devi effettuare il login prima di fare l\'upgrade');
                return;
            }

            // Call Stripe checkout endpoint
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
                throw new Error(data.message || 'Errore durante la creazione della sessione');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }

        } catch (err: any) {
            console.error('Stripe checkout error:', err);
            setError(err.message || 'Errore durante il checkout');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Stripe Checkout</h1>
                    <p className="text-gray-600 mb-6">Devi effettuare il login per testare Stripe</p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                        Vai al Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Stripe Checkout</h1>
                    <p className="text-gray-600">
                        Testa l'integrazione Stripe con un checkout reale (Test Mode)
                    </p>
                </div>

                {/* User Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-900 mb-2">👤 Utente Loggato</h2>
                    <div className="text-sm text-blue-800">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Piano:</strong> {user?.subscriptionPlan || 'free'}</p>
                        <p><strong>Invii:</strong> {user?.scanCount || 0} / {user?.monthlyScanLimit || 5}</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">❌ {error}</p>
                    </div>
                )}

                {/* Test Buttons */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Basic Plan */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                        <p className="text-3xl font-bold text-primary-500 mb-4">€19<span className="text-lg text-gray-600">/mese</span></p>
                        <ul className="text-sm text-gray-600 mb-6 space-y-2">
                            <li>✅ 100 invii/mese</li>
                            <li>✅ API Alloggiati Web</li>
                            <li>✅ Supporto email</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('basic')}
                            disabled={loading || user?.subscriptionPlan === 'basic'}
                            className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Caricamento...' : user?.subscriptionPlan === 'basic' ? 'Piano Attivo' : 'Testa Checkout'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white rounded-lg shadow-lg p-6 opacity-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                        <p className="text-3xl font-bold text-primary-500 mb-4">€49<span className="text-lg text-gray-600">/mese</span></p>
                        <ul className="text-sm text-gray-600 mb-6 space-y-2">
                            <li>✅ 500 invii/mese</li>
                            <li>✅ AI Assistant</li>
                            <li>✅ Analytics</li>
                        </ul>
                        <button
                            disabled
                            className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                            Non configurato
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white rounded-lg shadow-lg p-6 opacity-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                        <p className="text-3xl font-bold text-primary-500 mb-4">€199<span className="text-lg text-gray-600">/mese</span></p>
                        <ul className="text-sm text-gray-600 mb-6 space-y-2">
                            <li>✅ Invii illimitati</li>
                            <li>✅ Multi-utente</li>
                            <li>✅ SLA dedicato</li>
                        </ul>
                        <button
                            disabled
                            className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                            Non configurato
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h2 className="font-semibold text-yellow-900 mb-2">💳 Carte di Test Stripe</h2>
                    <p className="text-sm text-yellow-800 mb-3">Usa queste carte per testare il checkout:</p>
                    <div className="bg-white rounded p-3 text-sm font-mono">
                        <p className="text-green-700"><strong>✅ Successo:</strong> 4242 4242 4242 4242</p>
                        <p className="text-red-700"><strong>❌ Declined:</strong> 4000 0000 0000 0002</p>
                        <p className="text-gray-600 mt-2">
                            Scadenza: qualsiasi data futura (es. 12/34)<br />
                            CVC: qualsiasi 3 cifre (es. 123)
                        </p>
                    </div>
                </div>

                {/* Back */}
                <div className="mt-8 text-center">
                    <a
                        href="/dashboard"
                        className="text-primary-500 hover:text-primary-600"
                    >
                        ← Torna alla Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};
