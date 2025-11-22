import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon, ExclamationCircleIcon, HomeModernIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, loading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard/scan';

    // Handle success message from signup or verify
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Handle Google OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const googleAuth = params.get('google_auth');
        const token = params.get('token');
        const user = params.get('user');
        const errorParam = params.get('error');

        if (googleAuth === 'success' && token && user) {
            try {
                // Store auth data
                const userData = JSON.parse(decodeURIComponent(user));
                sessionStorage.setItem('alloggify_token', token);
                sessionStorage.setItem('alloggify_user', JSON.stringify(userData));

                // Redirect to dashboard
                navigate('/dashboard/scan', { replace: true });
            } catch (err) {
                setError('Errore durante il login con Google. Riprova.');
            }
        } else if (errorParam) {
            const message = params.get('message');
            setError(message || 'Errore durante il login con Google');
        }
    }, [location.search, navigate]);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard/scan', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!email || !password) {
            setError('Inserisci email e password');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Inserisci un\'email valida');
            return;
        }

        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Credenziali non valide. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
                            </h1>
                        </Link>
                        <p className="text-gray-600">Accedi al tuo account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-green-700">{successMessage}</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="nome@esempio.it"
                                disabled={loading}
                                autocomplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-500 hover:text-primary-600"
                                >
                                    Password dimenticata?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me - Future feature */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                Ricordami
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Accesso in corso...
                                </>
                            ) : (
                                <>
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                    Accedi
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">oppure</span>
                        </div>
                    </div>

                    {/* Social Login - Google OAuth */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                // Redirect to Google OAuth
                                window.location.href = '/api/auth/google';
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continua con Google
                        </button>
                    </div>

                    {/* Signup Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Non hai un account?{' '}
                        <Link to="/signup" className="font-semibold text-primary-500 hover:text-primary-600">
                            Registrati gratuitamente
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                        ← Torna alla home
                    </Link>
                </div>
            </div>
        </div>
    );
};
