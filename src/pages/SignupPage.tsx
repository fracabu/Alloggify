import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlusIcon, ExclamationCircleIcon, CheckCircleIcon, HomeModernIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signup, isAuthenticated, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        acceptTerms: false
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                setError('Errore durante la registrazione con Google. Riprova.');
            }
        } else if (errorParam) {
            const message = params.get('message');
            setError(message || 'Errore durante la registrazione con Google');
        }
    }, [location.search, navigate]);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard/scan', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 1, label: 'Debole', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 2, label: 'Media', color: 'bg-yellow-500' };
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 3, label: 'Forte', color: 'bg-green-500' };
        }
        return { strength: 2, label: 'Media', color: 'bg-yellow-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Compila tutti i campi obbligatori');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Inserisci un\'email valida');
            return;
        }

        if (formData.password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Le password non corrispondono');
            return;
        }

        if (!formData.acceptTerms) {
            setError('Devi accettare i Termini di Servizio e la Privacy Policy');
            return;
        }

        setLoading(true);

        try {
            // Use email username as fullName if not provided
            const fullName = formData.email.split('@')[0];
            await signup(formData.email, formData.password, fullName, formData.companyName);
            // Redirect to login page after successful signup
            // User must verify email before logging in
            navigate('/login', {
                replace: true,
                state: { message: 'Registrazione completata! Controlla la tua email per verificare l\'account.' }
            });
        } catch (err: any) {
            setError(err.message || 'Errore durante la registrazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
                            </h1>
                        </Link>
                        <p className="text-gray-600">Crea il tuo account gratuito</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="nome@esempio.it"
                                disabled={loading}
                                autocomplete="email"
                            />
                        </div>

                        {/* Company Name (Optional) */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Struttura <span className="text-gray-400 text-xs">(opzionale)</span>
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="B&B La Terrazza"
                                disabled={loading}
                                autocomplete="organization"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="new-password"
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
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-600">Forza password:</span>
                                        <span className={`font-medium ${
                                            passwordStrength.strength === 3 ? 'text-green-600' :
                                            passwordStrength.strength === 2 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Conferma Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                    {formData.password === formData.confirmPassword ? (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">Le password corrispondono</span>
                                        </>
                                    ) : (
                                        <>
                                            <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">Le password non corrispondono</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms & Privacy */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                                Accetto i{' '}
                                <Link to="/terms" target="_blank" className="text-primary-500 hover:text-primary-600 font-medium">
                                    Termini di Servizio
                                </Link>
                                {' '}e la{' '}
                                <Link to="/privacy" target="_blank" className="text-primary-500 hover:text-primary-600 font-medium">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-all mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creazione account...
                                </>
                            ) : (
                                <>
                                    <UserPlusIcon className="h-5 w-5" />
                                    Crea Account Gratuito
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

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Hai già un account?{' '}
                        <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
                            Accedi
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
