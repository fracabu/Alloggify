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
    const [ricevutaDate, setRicevutaDate] = useState('');
    const [downloadingRicevuta, setDownloadingRicevuta] = useState(false);

    // Load credentials from .env or localStorage on mount
    useEffect(() => {
        // Priority: 1. .env variables, 2. localStorage
        const envUtente = import.meta.env.VITE_ALLOGGIATI_UTENTE;
        const envPassword = import.meta.env.VITE_ALLOGGIATI_PASSWORD;
        const envWskey = import.meta.env.VITE_ALLOGGIATI_WSKEY;

        const savedUtente = localStorage.getItem('alloggiatiUtente');
        const savedPassword = localStorage.getItem('alloggiatiPassword');
        const savedWskey = localStorage.getItem('alloggiatiWskey');

        // Use .env if available, otherwise use localStorage
        if (envUtente) {
            setUtente(envUtente);
            console.log('✅ Credentials loaded from .env.local');
        } else if (savedUtente) {
            setUtente(savedUtente);
        }

        if (envPassword) setPassword(envPassword);
        else if (savedPassword) setPassword(savedPassword);

        if (envWskey) setWskey(envWskey);
        else if (savedWskey) setWskey(savedWskey);

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
            setSuccess('Autenticazione riuscita! Scaricamento tabelle...');

            // Download reference tables (comuni, documenti, etc.)
            try {
                await Promise.all([
                    alloggiatiApi.downloadTabelleLuoghi(),
                    alloggiatiApi.downloadTabellaDocumenti()
                ]);
                setSuccess('Autenticazione riuscita! Token valido fino a ' + new Date(result.scadenza).toLocaleString('it-IT'));
            } catch (tableError) {
                console.warn('⚠️ Errore download tabelle:', tableError);
                setSuccess('Autenticazione riuscita (senza tabelle). Token valido fino a ' + new Date(result.scadenza).toLocaleString('it-IT'));
            }

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

    const handleDownloadRicevuta = async () => {
        if (!ricevutaDate) {
            setError('Seleziona una data');
            return;
        }

        setDownloadingRicevuta(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await alloggiatiApi.downloadRicevuta(ricevutaDate);

            if (result.success && result.pdf) {
                // Convert base64 to blob and download
                const byteCharacters = atob(result.pdf);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ricevuta_${ricevutaDate}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setSuccess(`Ricevuta scaricata: ricevuta_${ricevutaDate}.pdf`);
                setTimeout(() => setSuccess(null), 5000);
            } else {
                setError(result.message || 'Errore durante il download');
            }
        } catch (err) {
            console.error('Errore download ricevuta:', err);
            setError(err instanceof Error ? err.message : 'Errore durante il download');
        } finally {
            setDownloadingRicevuta(false);
        }
    };

    return (
        <div className="p-3 bg-white shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base text-gray-700">API Alloggiati Web</h3>
                <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="text-xs text-primary-500 hover:text-indigo-800"
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

                    {/* Sezione Download Ricevuta */}
                    <div className="border-t pt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            📥 Scarica Ricevuta (ultimi 30gg)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={ricevutaDate}
                                onChange={(e) => setRicevutaDate(e.target.value)}
                                max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                                min={new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                            />
                            <button
                                onClick={handleDownloadRicevuta}
                                disabled={downloadingRicevuta || !ricevutaDate}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {downloadingRicevuta ? '...' : 'PDF'}
                            </button>
                        </div>
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
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
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
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
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
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
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
                            className="flex-1 text-xs px-2 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
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
