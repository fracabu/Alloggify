import React, { useState, useEffect } from 'react';
import { KeyIcon, SuccessIcon } from './icons/Icons';

export const ApiKeyGuide: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem('geminiApiKey');
        if (stored) {
            setApiKey(stored);
        } else {
            // If not configured, auto-expand
            setIsExpanded(true);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('geminiApiKey', apiKey.trim());
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            setIsExpanded(false); // Collapse after save
        }
    };

    const handleClear = () => {
        setApiKey('');
        localStorage.removeItem('geminiApiKey');
        setIsEditing(true);
        setSaveSuccess(false);
    };

    const isConfigured = !!apiKey;

    // Collapsed view when configured and not editing
    if (isConfigured && !isExpanded && !isEditing) {
        return (
            <div className="p-3 bg-white border-l-4 border-green-400 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SuccessIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">API Key Attiva</span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Modifica
                    </button>
                </div>
            </div>
        );
    }

    // Expanded view
    return (
        <div className={`p-3 border-l-4 rounded-lg shadow-md transition-all ${
            isConfigured ? 'bg-white border-green-400' : 'bg-yellow-50 border-yellow-400'
        }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isConfigured ? (
                        <SuccessIcon className="h-5 w-5 text-green-500" />
                    ) : (
                        <KeyIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    <h3 className={`font-semibold text-sm ${
                        isConfigured ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                        {isConfigured ? 'API Key Configurata' : 'Configura API Key'}
                    </h3>
                </div>
                {isConfigured && isExpanded && !isEditing && (
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                )}
            </div>

            {!isConfigured && (
                <p className="text-xs text-yellow-700 mb-3">
                    Per utilizzare la scansione OCR, configura la tua chiave API di Google AI Studio.
                </p>
            )}

            <div className="space-y-2">
                {isEditing || !isConfigured ? (
                    <>
                        <div>
                            <label htmlFor="apiKey" className="block text-xs font-medium mb-1 text-gray-700">
                                Chiave API Gemini
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Inserisci la tua chiave API..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={!apiKey.trim()}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Salva
                            </button>
                            {isConfigured && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setIsExpanded(false);
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300"
                                >
                                    Annulla
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-700">✓ Chiave salvata</span>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200"
                        >
                            Modifica
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200"
                        >
                            Rimuovi
                        </button>
                    </div>
                )}

                {saveSuccess && (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 p-2 rounded">
                        <SuccessIcon className="h-4 w-4 mr-1"/>
                        <span>Salvata con successo!</span>
                    </div>
                )}
            </div>

            {!isConfigured && (
                <div className="mt-3">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                    >
                        🔑 Ottieni Chiave API
                    </a>
                </div>
            )}

            {/* Workflow Guide - collapsible */}
            {(!isConfigured || isExpanded) && (
                <details className="mt-3 pt-3 border-t border-gray-200">
                    <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                        📖 Guida Rapida
                    </summary>
                    <p className="text-xs text-gray-600 mt-2 mb-1">
                        Dopo la scansione, verifica questi 3 campi:
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-2 text-gray-600">
                        <li><strong>Data Arrivo</strong> (preimpostata su oggi)</li>
                        <li><strong>Tipo Alloggiato</strong> (Ospite Singolo, etc.)</li>
                        <li><strong>Permanenza</strong> (numero notti)</li>
                    </ul>
                </details>
            )}
        </div>
    );
};
