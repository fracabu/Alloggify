import React from 'react';
import { DocumentData } from '../types';
import { PlugIcon, SendIcon, LoaderIcon } from './icons/Icons';

interface MainFormProps {
    data: DocumentData;
    onDataChange: (field: keyof DocumentData, value: string) => void;
    onExport: () => void;
    onSendApi: () => void;
    onReset: () => void;
    minDate: string;
    maxDate: string;
    apiSendLoading: boolean;
}

const InputField: React.FC<{
    id: keyof DocumentData;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    className?: string;
    min?: string;
    max?: string;
}> =
    ({ id, label, value, onChange, type = 'text', placeholder, className = '', min, max }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder || label}
            min={min}
            max={max}
            className="block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
    </div>
);

const SelectField: React.FC<{ id: keyof DocumentData; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string }> =
    ({ id, label, value, onChange, children, className = '' }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="block w-full pl-3 pr-10 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        >
            {children}
        </select>
    </div>
);

const formatDateForDisplay = (dateString: string) => {
    if (!dateString || !dateString.includes('-')) return dateString;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// FIX: Export MainForm component to be used in App.tsx and complete the truncated file.
export const MainForm: React.FC<MainFormProps> = ({ data, onDataChange, onExport, onSendApi, onReset, minDate, maxDate, apiSendLoading }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onDataChange(name as keyof DocumentData, value);
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <fieldset className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <legend className="text-sm font-semibold text-gray-800 mb-3 px-2">
                    📋 Dati Schedina
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectField id="tipo" label="Tipo Alloggiato" value={data.tipo} onChange={handleChange}>
                        <option>Ospite Singolo</option>
                        <option>Capo Famiglia</option>
                        <option>Capo Gruppo</option>
                        <option>Familiare</option>
                        <option>Membro Gruppo</option>
                    </SelectField>
                    <SelectField id="dataArrivo" label="Data Arrivo" value={data.dataArrivo} onChange={handleChange}>
                        <option value={maxDate}>{formatDateForDisplay(maxDate)}</option>
                        <option value={minDate}>{formatDateForDisplay(minDate)}</option>
                    </SelectField>
                    <InputField id="permanenza" label="Permanenza (giorni)" value={data.permanenza} onChange={handleChange} type="number" />
                </div>
            </fieldset>

            <fieldset className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <legend className="text-sm font-semibold text-gray-800 mb-3 px-2">
                    👤 Dati Anagrafici
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField id="cognome" label="Cognome" value={data.cognome} onChange={handleChange} />
                    <InputField id="nome" label="Nome" value={data.nome} onChange={handleChange} />
                    <SelectField id="sesso" label="Sesso" value={data.sesso} onChange={handleChange}>
                        <option value="">Seleziona...</option>
                        <option value="Maschio">Maschio</option>
                        <option value="Femmina">Femmina</option>
                    </SelectField>
                    <InputField id="dataNascita" label="Data di Nascita" value={data.dataNascita} onChange={handleChange} type="date" />
                    <InputField id="luogoNascita" label="Luogo di Nascita" placeholder="Comune o Stato Estero" value={data.luogoNascita} onChange={handleChange} />
                    <InputField id="cittadinanza" label="Cittadinanza" placeholder="Comune o Stato Estero" value={data.cittadinanza} onChange={handleChange} />
                </div>
            </fieldset>

            <fieldset className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <legend className="text-sm font-semibold text-gray-800 mb-3 px-2">
                    🪪 Documento di Identità
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectField id="tipoDocumento" label="Tipo Documento" value={data.tipoDocumento} onChange={handleChange}>
                        <option value="">Seleziona tipo...</option>
                        <option value="CARTA DI IDENTITA'">CARTA DI IDENTITA'</option>
                        <option value="CARTA ID. DIPLOMATICA">CARTA ID. DIPLOMATICA</option>
                        <option value="CARTA IDENTITA' ELETTRONICA">CARTA IDENTITA' ELETTRONICA</option>
                        <option value="DIENSTREISEPASS">DIENSTREISEPASS</option>
                        <option value="DIPLOMATISCHER PASS">DIPLOMATISCHER PASS</option>
                        <option value="PASSAPORTO DI SERVIZIO">PASSAPORTO DI SERVIZIO</option>
                        <option value="PASSAPORTO DIPLOMATICO">PASSAPORTO DIPLOMATICO</option>
                        <option value="PASSAPORTO ORDINARIO">PASSAPORTO ORDINARIO</option>
                        <option value="PATENTE DI GUIDA">PATENTE DI GUIDA</option>
                        <option value="REISEPASS">REISEPASS</option>
                    </SelectField>
                    <InputField id="numeroDocumento" label="Numero Documento" value={data.numeroDocumento} onChange={handleChange} />
                    <InputField id="luogoRilascioDocumento" label="Luogo Rilascio" placeholder="Comune o Stato Estero" value={data.luogoRilascioDocumento} onChange={handleChange} />
                </div>
            </fieldset>

            <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onReset}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    🗑️ Svuota Form
                </button>
                <button
                    type="button"
                    onClick={onSendApi}
                    disabled={apiSendLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                    {apiSendLoading ? (
                        <>
                            <LoaderIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Invio in corso...
                        </>
                    ) : (
                        <>
                            <SendIcon className="-ml-1 mr-2 h-4 w-4" />
                            📤 Invia Direttamente
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onExport}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                    <PlugIcon className="-ml-1 mr-2 h-4 w-4" />
                    🔌 Esporta per Estensione
                </button>
            </div>
        </form>
    );
};