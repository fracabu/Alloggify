import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MainForm } from './components/MainForm';
import { DocumentData } from './types';
import { extractDocumentInfo } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { UploadIcon, LoaderIcon, ErrorIcon, SuccessIcon } from './components/icons/Icons';
import { ApiKeyGuide } from './components/ApiKeyGuide';
import { AlloggiatiCredentials } from './components/AlloggiatiCredentials';
import { alloggiatiApi } from './services/alloggiatiApiService';
import { ConfirmationModal } from './components/ConfirmationModal';

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
    const [apiSendLoading, setApiSendLoading] = useState<boolean>(false);
    const [apiSendSuccess, setApiSendSuccess] = useState<string | null>(null);
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
        setApiSendSuccess(null);
    };

    const [showConfirmModal, setShowConfirmModal] = React.useState(false);

    const handleSendViaApi = async () => {
        // Check if we have required fields before showing modal
        if (!documentData.cognome || !documentData.nome || !documentData.dataNascita) {
            setError('Compila almeno Cognome, Nome e Data di Nascita prima di inviare');
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirmModal(false);
        setApiSendLoading(true);
        setError(null);
        setApiSendSuccess(null);

        try {
            // Test token validity first
            const isTokenValid = await alloggiatiApi.testAuthentication();
            if (!isTokenValid) {
                throw new Error('Token scaduto o non valido. Effettua nuovamente il login nella sezione API.');
            }

            // Test schedina first
            console.log('🧪 Test validazione schedina...');
            const testResult = await alloggiatiApi.testSchedina(documentData);

            if (!testResult.success) {
                throw new Error(`Validazione fallita: ${testResult.message}`);
            }

            console.log('✅ Validazione OK, invio schedina...');

            // Send schedina
            const sendResult = await alloggiatiApi.sendSchedina(documentData);

            if (sendResult.success) {
                setApiSendSuccess(sendResult.message + (sendResult.ricevuta ? ` (Ricevuta: ${sendResult.ricevuta})` : ''));
                setTimeout(() => setApiSendSuccess(null), 8000);
            } else {
                throw new Error(sendResult.message);
            }
        } catch (err) {
            console.error('❌ Errore invio API:', err);
            const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'invio alla API';
            setError(errorMessage);
        } finally {
            setApiSendLoading(false);
        }
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const maxDate = today.toISOString().split('T')[0];
    const minDate = yesterday.toISOString().split('T')[0];

    return (
        <div className="bg-gray-100 h-screen flex flex-col overflow-hidden font-sans">
            <Header />
            <main className="flex-1 max-w-screen-2xl mx-auto w-full py-3 px-4 sm:px-6 lg:px-8 overflow-auto">
                <div className="flex flex-col lg:flex-row lg:space-x-6 h-full">
                    {/* Sidebar a sinistra */}
                    <div className="w-full lg:w-80 lg:flex-shrink-0 mb-4 lg:mb-0 space-y-4">
                        <div className="p-3 bg-white shadow-md rounded-lg">
                            <h3 className="font-semibold text-base text-center text-gray-700 mb-2">Compila da Documento</h3>
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
                                className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
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
                                <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded-md">
                                    <ErrorIcon className="h-4 w-4 mr-2"/>
                                    <span>{error}</span>
                                </div>
                            )}
                            {ocrSuccess && (
                                <div className="mt-2 flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-md">
                                    <SuccessIcon className="h-4 w-4 mr-2"/>
                                    <span>{ocrSuccess}</span>
                                </div>
                            )}
                        </div>
                        <AlloggiatiCredentials />
                        <ApiKeyGuide />
                    </div>

                    {/* Main form */}
                    <div className="flex-grow bg-white p-4 shadow-md rounded-lg overflow-auto">
                        <h1 className="text-xl font-semibold text-gray-800 mb-1">Inserimento On-Line</h1>
                        <hr className="mb-3 border-t-2 border-dotted border-gray-200" />
                        <MainForm
                            data={documentData}
                            onDataChange={handleDataChange}
                            onExport={handleExportForExtension}
                            onSendApi={handleSendViaApi}
                            onReset={handleResetForm}
                            minDate={minDate}
                            maxDate={maxDate}
                            apiSendLoading={apiSendLoading}
                        />
                        {exportSuccess && (
                            <div className="mt-2 flex items-center text-xs text-purple-600 bg-purple-50 p-2 rounded-md">
                                <SuccessIcon className="h-4 w-4 mr-2 text-purple-500"/>
                                <span>{exportSuccess}</span>
                            </div>
                        )}
                        {apiSendSuccess && (
                            <div className="mt-2 flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-md">
                                <SuccessIcon className="h-4 w-4 mr-2 text-green-500"/>
                                <span>{apiSendSuccess}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSend}
                data={documentData}
            />
        </div>
    );
};

export default App;