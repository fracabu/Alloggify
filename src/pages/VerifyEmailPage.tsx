import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, HomeModernIcon } from '@heroicons/react/24/outline';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token di verifica mancante o non valido.');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch(`/api/auth?action=verify&token=${token}`);
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Email verificata con successo!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Email verificata! Ora puoi effettuare il login.' }
                    });
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Errore durante la verifica.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Errore di connessione. Riprova più tardi.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center justify-center gap-2 mb-6">
                        <HomeModernIcon className="h-8 w-8 text-primary-500" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                            CheckInly
                        </h1>
                    </Link>

                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Verifica in corso...
                            </h2>
                            <p className="text-gray-600">
                                Attendere prego, stiamo verificando il tuo account.
                            </p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                ✅ Email Verificata!
                            </h2>
                            <p className="text-gray-600">
                                {message}
                            </p>
                            <p className="text-sm text-gray-500">
                                Sarai reindirizzato al login tra pochi secondi...
                            </p>
                            <Link
                                to="/login"
                                className="inline-block mt-4 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                            >
                                Vai al Login
                            </Link>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <XCircleIcon className="h-16 w-16 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                ❌ Verifica Fallita
                            </h2>
                            <p className="text-gray-600">
                                {message}
                            </p>
                            <div className="space-y-2 mt-6">
                                <p className="text-sm text-gray-500">
                                    Possibili cause:
                                </p>
                                <ul className="text-sm text-gray-500 text-left list-disc list-inside">
                                    <li>Il link è scaduto (24 ore)</li>
                                    <li>Il link è già stato utilizzato</li>
                                    <li>Il token non è valido</li>
                                </ul>
                            </div>
                            <div className="flex gap-3 justify-center mt-6">
                                <Link
                                    to="/signup"
                                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                                >
                                    Registrati di nuovo
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Vai al Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">
                        ← Torna alla Home
                    </Link>
                </div>
            </div>
        </div>
    );
};
