import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlusIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { signup, isAuthenticated, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        acceptTerms: false
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
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
            await signup(formData.email, formData.password, formData.fullName, formData.companyName);
            navigate('/dashboard/scan', { replace: true });
        } catch (err) {
            setError('Errore durante la registrazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                            Alloggify
                        </h1>
                    </Link>
                    <p className="mt-2 text-gray-600">Crea il tuo account gratuito</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="Mario Rossi"
                                disabled={loading}
                            />
                        </div>

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
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
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
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
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
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all mt-6"
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
