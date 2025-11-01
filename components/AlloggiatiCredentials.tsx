import React, { useState, useEffect } from 'react';
import { alloggiatiApi } from '@/services/alloggiatiApiService';

export const AlloggiatiCredentials: React.FC = () => {
    const [utente, setUtente] = useState('');
    const [password, setPassword] = useState('');
    const [wskey, setWskey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);

    // Load credentials from localStorage on mount
    useEffect(() => {
        const savedUtente = localStorage.getItem('alloggiatiUtente');
        const savedPassword = localStorage.getItem('alloggiatiPassword');
        const savedWskey = localStorage.getItem('alloggiatiWskey');

        if (savedUtente) setUtente(savedUtente);
        if (savedPassword) setPassword(savedPassword);
        if (savedWskey) setWskey(savedWskey);

        // Check if we have a valid token
        const token = alloggiatiApi.getToken();
        const expiry = alloggiatiApi.getTokenExpiry();
        if (token && expiry) {
            setIsAuthenticated(true);
            setTokenExpiry(expiry);
        }
    }, []);

    const handleLogin = async () => {
        if (!utente || !password || !wskey) {
            setError('Compila tutti i campi');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await alloggiatiApi.generateToken({ utente, password, wskey });

            // Save credentials to localStorage
            localStorage.setItem('alloggiatiUtente', utente);
            localStorage.setItem('alloggiatiPassword', password);
            localStorage.setItem('alloggiatiWskey', wskey);

            setIsAuthenticated(true);
            setTokenExpiry(new Date(result.scadenza));
            setSuccess('Autenticazione riuscita! Token valido fino a ' + new Date(result.scadenza).toLocaleString('it-IT'));

            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('Errore login:', err);
            setError(err instanceof Error ? err.message : 'Errore durante il login');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        alloggiatiApi.clearToken();
        setIsAuthenticated(false);
        setTokenExpiry(null);
        setSuccess('Disconnesso con successo');
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleClearCredentials = () => {
        localStorage.removeItem('alloggiatiUtente');
        localStorage.removeItem('alloggiatiPassword');
        localStorage.removeItem('alloggiatiWskey');
        setUtente('');
        setPassword('');
        setWskey('');
        handleLogout();
    };

    const getTimeRemaining = () => {
        if (!tokenExpiry) return null;
        const now = new Date();
        const diff = tokenExpiry.getTime() - now.getTime();
        if (diff <= 0) return 'Scaduto';
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minuti`;
    };

    return (
        <div className="p-3 bg-white shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base text-gray-700">API Alloggiati Web</h3>
                <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                    {showCredentials ? '▼ Nascondi' : '▶ Mostra'}
                </button>
            </div>

            {isAuthenticated && !showCredentials && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-green-50 p-2 rounded">
                        <span className="text-green-700">✓ Connesso</span>
                        <span className="text-green-600">{getTimeRemaining()}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-xs px-2 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Disconnetti
                    </button>
                </div>
            )}

            {showCredentials && (
                <div className="space-y-2">
                    {isAuthenticated && (
                        <div className="text-xs bg-green-50 p-2 rounded mb-2">
                            <div className="text-green-700 font-medium">✓ Autenticato</div>
                            <div className="text-green-600">Scadenza: {getTimeRemaining()}</div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nome Utente
                        </label>
                        <input
                            type="text"
                            value={utente}
                            onChange={(e) => setUtente(e.target.value)}
                            placeholder="Il tuo username"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="La tua password"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            WSKEY
                        </label>
                        <input
                            type="password"
                            value={wskey}
                            onChange={(e) => setWskey(e.target.value)}
                            placeholder="Chiave Web Service"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Genera la WSKEY dal portale: Profilo → Chiave Web Service
                        </p>
                    </div>

                    {error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                            {success}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading || !utente || !password || !wskey}
                            className="flex-1 text-xs px-2 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Connessione...' : isAuthenticated ? 'Riconnetti' : 'Connetti'}
                        </button>

                        {(utente || password || wskey) && (
                            <button
                                onClick={handleClearCredentials}
                                disabled={isLoading}
                                className="text-xs px-2 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancella
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
