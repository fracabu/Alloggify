import React, { useState, useEffect } from 'react';
import { KeyIcon, SuccessIcon } from './icons/Icons';

export const ApiKeyGuide: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem('geminiApiKey');
        if (stored) {
            setApiKey(stored);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('geminiApiKey', apiKey.trim());
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const handleClear = () => {
        setApiKey('');
        localStorage.removeItem('geminiApiKey');
        setIsEditing(true);
        setSaveSuccess(false);
    };

    const isConfigured = !!apiKey;

    return (
        <div className={`p-4 border-l-4 rounded-lg shadow-md ${isConfigured ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {isConfigured ? (
                        <SuccessIcon className="h-6 w-6 text-green-500" />
                    ) : (
                        <KeyIcon className="h-6 w-6 text-yellow-500" />
                    )}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${isConfigured ? 'text-green-800' : 'text-yellow-800'}`}>
                        {isConfigured ? 'API Key Configurata' : 'Imposta la tua API Key'}
                    </h3>

                    {!isConfigured && (
                        <div className="text-sm text-yellow-700 space-y-2 mb-4">
                            <p>
                                Per utilizzare la funzione di scansione, è necessario configurare la propria chiave API di Google AI Studio.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {isEditing || !isConfigured ? (
                            <>
                                <div>
                                    <label htmlFor="apiKey" className={`block text-sm font-medium mb-1 ${isConfigured ? 'text-green-700' : 'text-yellow-700'}`}>
                                        Chiave API Gemini
                                    </label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Inserisci la tua chiave API..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={!apiKey.trim()}
                                        className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Salva Chiave
                                    </button>
                                    {isConfigured && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none"
                                        >
                                            Annulla
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-green-700">Chiave API salvata</span>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 focus:outline-none"
                                >
                                    Modifica
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 focus:outline-none"
                                >
                                    Rimuovi
                                </button>
                            </div>
                        )}

                        {saveSuccess && (
                            <div className="flex items-center text-sm text-green-600">
                                <SuccessIcon className="h-4 w-4 mr-1"/>
                                <span>Chiave salvata con successo!</span>
                            </div>
                        )}
                    </div>

                    {!isConfigured && (
                        <div className="mt-4">
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                Ottieni la tua Chiave API
                            </a>
                        </div>
                    )}

                    <div className={`mt-4 pt-4 border-t ${isConfigured ? 'border-green-200' : 'border-yellow-200'}`}>
                        <h4 className={`font-semibold text-base mb-2 ${isConfigured ? 'text-green-800' : 'text-yellow-800'}`}>Flusso di Lavoro Consigliato</h4>
                        <p className={`text-sm ${isConfigured ? 'text-green-700' : 'text-yellow-700'}`}>
                            Dopo la scansione, i dati sono compilati. Verifica e imposta manualmente solo questi 3 campi:
                        </p>
                        <ul className={`list-disc list-inside mt-2 text-sm space-y-1 pl-2 ${isConfigured ? 'text-green-700' : 'text-yellow-700'}`}>
                            <li><strong>Data di Arrivo</strong> (preimpostata su oggi)</li>
                            <li><strong>Tipo Alloggiato</strong> (Ospite Singolo, Capo Famiglia, etc.)</li>
                            <li><strong>Permanenza</strong> (numero notti)</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};