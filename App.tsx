import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MainForm } from './components/MainForm';
import { DocumentData } from './types';
import { extractDocumentInfo } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { UploadIcon, LoaderIcon, ErrorIcon, SuccessIcon } from './components/icons/Icons';
import { ApiKeyGuide } from './components/ApiKeyGuide';

const initialDocumentData: DocumentData = {
    tipo: 'Ospite Singolo',
    dataArrivo: new Date().toISOString().split('T')[0],
    permanenza: '1',
    cognome: '',
    nome: '',
    sesso: '',
    dataNascita: '',
    luogoNascita: '',
    cittadinanza: 'ITALIA',
    tipoDocumento: '',
    numeroDocumento: '',
    luogoRilascioDocumento: ''
};

const App: React.FC = () => {
    const [documentData, setDocumentData] = useState<DocumentData>(initialDocumentData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDataChange = useCallback((field: keyof DocumentData, value: string) => {
        setDocumentData(prev => ({ ...prev, [field]: value }));
        setExportSuccess(null); // Clear export message on data change
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setOcrSuccess(null);
        setExportSuccess(null);

        try {
            const base64Image = await fileToBase64(file);
            const mimeType = file.type;
            
            const extractedData = await extractDocumentInfo(base64Image, mimeType);
            
            // Format date from YYYY-MM-DD to DD/MM/YYYY for display if needed, but Alloggiati might take YYYY-MM-DD
            const formattedDateOfBirth = extractedData.dateOfBirth; // Keep YYYY-MM-DD for date input

            const updatedData = {
                ...documentData,
                cognome: extractedData.lastName || '',
                nome: extractedData.firstName || '',
                sesso: extractedData.sex || '',
                dataNascita: formattedDateOfBirth || '',
                luogoNascita: extractedData.placeOfBirth || '',
                cittadinanza: extractedData.citizenship || 'ITALIA',
                tipoDocumento: extractedData.documentType || '',
                numeroDocumento: extractedData.documentNumber || '',
                luogoRilascioDocumento: extractedData.issuingPlace || ''
            };

            console.log('📝 Dati OCR estratti:', updatedData);
            setDocumentData(updatedData);
            setOcrSuccess('Document processed successfully! Please review the data below.');
            setTimeout(() => setOcrSuccess(null), 5000);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'elaborazione del documento. Riprova.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleExportForExtension = () => {
        try {
            console.log('📤 EXPORT - Dati da esportare:', documentData);
            localStorage.setItem('alloggifyData', JSON.stringify(documentData));
            localStorage.setItem('alloggifyDataTimestamp', Date.now().toString());
            console.log('✅ EXPORT - Dati salvati in localStorage');

            // Trigghera evento custom per il bridge dell'estensione
            window.dispatchEvent(new CustomEvent('alloggifyDataExported', {
                detail: documentData
            }));

            setExportSuccess('Dati esportati! Ora puoi usare l\'estensione su Alloggiati Web.');
            setTimeout(() => setExportSuccess(null), 6000);
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
            setError("Could not export data for the extension.");
        }
    };

    const handleResetForm = () => {
        setDocumentData(initialDocumentData);
        setError(null);
        setOcrSuccess(null);
        setExportSuccess(null);
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const maxDate = today.toISOString().split('T')[0];
    const minDate = yesterday.toISOString().split('T')[0];

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header />
            <main className="max-w-screen-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                    <div className="flex-grow bg-white p-6 shadow-md rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Inserimento On-Line</h1>
                        <hr className="mb-6 border-t-2 border-dotted border-gray-200" />
                        <MainForm 
                            data={documentData} 
                            onDataChange={handleDataChange} 
                            onExport={handleExportForExtension} 
                            onReset={handleResetForm}
                            minDate={minDate}
                            maxDate={maxDate}
                        />
                        {exportSuccess && (
                            <div className="mt-4 flex items-center text-sm text-purple-600 bg-purple-50 p-3 rounded-md">
                                <SuccessIcon className="h-5 w-5 mr-2 text-purple-500"/>
                                <span>{exportSuccess}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full lg:w-96 lg:flex-shrink-0 mt-8 lg:mt-0 space-y-8">
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <h3 className="font-semibold text-lg text-center text-gray-700 mb-3">Compila da Documento</h3>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                            <button
                                onClick={triggerFileUpload}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Carica Documento
                                    </>
                                )}
                            </button>
                            {error && (
                                <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    <ErrorIcon className="h-5 w-5 mr-2"/>
                                    <span>{error}</span>
                                </div>
                            )}
                            {ocrSuccess && (
                                <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                    <SuccessIcon className="h-5 w-5 mr-2"/>
                                    <span>{ocrSuccess}</span>
                                </div>
                            )}
                        </div>
                        <ApiKeyGuide />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;