import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { MainForm } from '../../components/MainForm';
import { DocumentData } from '../../types';
import { extractDocumentInfo } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { UploadIcon, LoaderIcon, ErrorIcon, SuccessIcon } from '../../components/icons/Icons';
// import { ApiKeyGuide } from '../../components/ApiKeyGuide'; // COMMENTED: SaaS will use centralized Gemini API key
import { AlloggiatiCredentials } from '../../components/AlloggiatiCredentials';
import { alloggiatiApi } from '../../services/alloggiatiApiService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AIChatWidget } from '../components/AIChatWidget';
import { ArrowRightOnRectangleIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const initialDocumentData: DocumentData = {
    tipo: 'Ospite Singolo',
    dataArrivo: new Date().toISOString().split('T')[0],
    permanenza: '1',
    cognome: '',
    nome: '',
    sesso: '',
    dataNascita: '',
    luogoNascita: '',
    statoNascita: 'ITALIA',
    cittadinanza: 'ITALIA',
    tipoDocumento: '',
    numeroDocumento: '',
    luogoRilascioDocumento: ''
};

export const DashboardPage: React.FC = () => {
    const { user, logout, updateScanCount, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState<DocumentData>(initialDocumentData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const [apiSendLoading, setApiSendLoading] = useState<boolean>(false);
    const [apiTestLoading, setApiTestLoading] = useState<boolean>(false);
    const [apiSendSuccess, setApiSendSuccess] = useState<string | null>(null);
    const [apiTestSuccess, setApiTestSuccess] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle Stripe payment success
    useEffect(() => {
        const upgradeSuccess = searchParams.get('upgrade');
        const planName = searchParams.get('plan');

        console.log('[Dashboard] URL params:', { upgradeSuccess, planName });

        if (upgradeSuccess === 'success' && planName) {
            console.log('[Dashboard] Payment success detected, calling handler...');
            handlePaymentSuccess(planName);
        }
    }, [searchParams]);

    const handlePaymentSuccess = async (planName: string) => {
        try {
            console.log('[Dashboard] Getting token from sessionStorage...');
            const token = sessionStorage.getItem('alloggify_token');

            if (!token) {
                console.error('[Dashboard] No token found!');
                return;
            }

            console.log('[Dashboard] Calling payment-success API for plan:', planName);

            const response = await fetch('/api/stripe/payment-success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planName })
            });

            console.log('[Dashboard] Response status:', response.status);

            const data = await response.json();
            console.log('[Dashboard] Response data:', data);

            if (response.ok && data.user) {
                console.log('[Dashboard] Updating user with full data:', data.user);

                // Update user in context with all fields including subscriptionPlan
                updateUser({
                    subscriptionPlan: data.user.subscriptionPlan as 'free' | 'basic' | 'pro' | 'enterprise',
                    scanCount: data.user.scanCount,
                    monthlyScanLimit: data.user.monthlyScanLimit
                });

                setOcrSuccess(`🎉 Upgrade completato! Ora hai ${data.user.monthlyScanLimit} scansioni al mese con il piano ${data.user.subscriptionPlan.toUpperCase()}`);

                // Clean URL
                console.log('[Dashboard] Navigating to clean URL...');
                setTimeout(() => {
                    navigate('/dashboard/scan', { replace: true });
                }, 1500);
            } else {
                console.error('[Dashboard] Invalid response or missing user data');
            }
        } catch (error) {
            console.error('[Dashboard] Error handling payment success:', error);
        }
    };

    const handleDataChange = useCallback((field: keyof DocumentData, value: string) => {
        setDocumentData(prev => ({ ...prev, [field]: value }));
        setExportSuccess(null);
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

            const ocrResult = await extractDocumentInfo(base64Image, mimeType);
            const extractedData = ocrResult.data;

            const formattedDateOfBirth = extractedData.dateOfBirth;

            const updatedData = {
                ...documentData,
                cognome: extractedData.lastName || '',
                nome: extractedData.firstName || '',
                sesso: extractedData.sex || '',
                dataNascita: formattedDateOfBirth || '',
                luogoNascita: extractedData.placeOfBirth || '',
                statoNascita: extractedData.stateOfBirth || 'ITALIA',
                cittadinanza: extractedData.citizenship || 'ITALIA',
                tipoDocumento: extractedData.documentType || '',
                numeroDocumento: extractedData.documentNumber || '',
                luogoRilascioDocumento: extractedData.issuingPlace || ''
            };

            // Update user scan count in context
            if (ocrResult.usage) {
                updateScanCount(ocrResult.usage.scanCount, ocrResult.usage.monthlyLimit);
            }

            // Security: Removed console.log with personal data
            setDocumentData(updatedData);
            setOcrSuccess(`Document processed successfully! Scans: ${ocrResult.usage?.scanCount || 0}/${ocrResult.usage?.monthlyLimit || 0}`);
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
            // Security: Removed console.log with personal data
            localStorage.setItem('alloggifyData', JSON.stringify(documentData));
            localStorage.setItem('alloggifyDataTimestamp', Date.now().toString());
            console.log('✅ EXPORT - Dati salvati in localStorage');

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
        setApiTestSuccess(null);
    };

    const handleTestApi = async () => {
        if (!documentData.cognome || !documentData.nome || !documentData.dataNascita) {
            setError('Compila almeno Cognome, Nome e Data di Nascita prima di testare');
            return;
        }

        setApiTestLoading(true);
        setError(null);
        setApiTestSuccess(null);

        try {
            // Verifica autenticazione
            const isTokenValid = await alloggiatiApi.testAuthentication();
            if (!isTokenValid) {
                throw new Error('Token scaduto o non valido. Effettua nuovamente il login nella sezione API.');
            }

            // Security: Removed console.log with personal data
            const testResult = await alloggiatiApi.testSchedina(documentData);

            if (testResult.success) {
                setApiTestSuccess('✅ Validazione OK! I dati sono corretti e pronti per l\'invio.');
                setTimeout(() => setApiTestSuccess(null), 8000);
            } else {
                throw new Error(`Validazione fallita: ${testResult.message}`);
            }
        } catch (err) {
            console.error('❌ Errore test API:', err);
            const errorMessage = err instanceof Error ? err.message : 'Errore durante il test di validazione';
            setError(errorMessage);
        } finally {
            setApiTestLoading(false);
        }
    };

    const handleSendViaApi = async () => {
        if (!documentData.cognome || !documentData.nome || !documentData.dataNascita) {
            setError('Compila almeno Cognome, Nome e Data di Nascita prima di inviare');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirmModal(false);
        setApiSendLoading(true);
        setError(null);
        setApiSendSuccess(null);

        try {
            const isTokenValid = await alloggiatiApi.testAuthentication();
            if (!isTokenValid) {
                throw new Error('Token scaduto o non valido. Effettua nuovamente il login nella sezione API.');
            }

            // Security: Removed console.log with personal data
            const testResult = await alloggiatiApi.testSchedina(documentData);

            if (!testResult.success) {
                throw new Error(`Validazione fallita: ${testResult.message}`);
            }

            // Validation OK, sending schedina...
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-screen flex flex-col font-sans overflow-hidden">
            {/* Dashboard Navbar */}
            <nav className="bg-white shadow-md border-b border-gray-200 flex-shrink-0">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
                            </h1>
                        </Link>

                        {/* User Menu */}
                        <div className="flex items-center gap-6">
                            {/* User Info */}
                            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500">
                                        Piano: <span className="font-semibold capitalize">{user?.subscriptionPlan}</span> •
                                        <span className="ml-1">{user?.scanCount}/{user?.monthlyScanLimit} scansioni</span>
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-primary-500" />
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Esci</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:gap-6 h-full">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 lg:flex-shrink-0 mb-6 lg:mb-0 space-y-3 lg:overflow-y-auto lg:max-h-full">
                        <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">📄</span>
                                <h3 className="font-semibold text-base text-gray-700">Carica Documento</h3>
                            </div>
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
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        Elaborazione...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Scansiona Documento
                                    </>
                                )}
                            </button>
                            {error && (
                                <div className="mt-3 flex items-start text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                    <ErrorIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5"/>
                                    <span>{error}</span>
                                </div>
                            )}
                            {ocrSuccess && (
                                <div className="mt-3 flex items-start text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <SuccessIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5"/>
                                    <span>{ocrSuccess}</span>
                                </div>
                            )}
                        </div>
                        {/* key={user?.id} forces component to remount when user changes (clears old user's data) */}
                        <AlloggiatiCredentials key={user?.id} />
                        {/* <ApiKeyGuide /> */}
                        {/* Commented for SaaS: Gemini API key will be centralized (server-side) */}
                    </aside>

                    {/* Main Form */}
                    <section className="flex-1 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 p-6 pb-4 flex-shrink-0">
                            <span className="text-2xl">✍️</span>
                            <h1 className="text-xl font-semibold text-gray-800">Inserimento Dati Alloggiato</h1>
                        </div>
                        <hr className="mx-6 border-t-2 border-dashed border-gray-300 flex-shrink-0" />
                        
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {/* key={user?.id} forces component to remount when user changes (clears old user's data) */}
                            <MainForm
                                key={user?.id}
                                data={documentData}
                                onDataChange={handleDataChange}
                                onExport={handleExportForExtension}
                                onSendApi={handleSendViaApi}
                                onTestApi={handleTestApi}
                                onReset={handleResetForm}
                                minDate={minDate}
                                maxDate={maxDate}
                                apiSendLoading={apiSendLoading}
                                apiTestLoading={apiTestLoading}
                            />

                            {exportSuccess && (
                                <div className="mt-4 flex items-center text-sm text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <SuccessIcon className="h-5 w-5 mr-2 text-purple-600"/>
                                    <span>{exportSuccess}</span>
                                </div>
                            )}
                            {apiTestSuccess && (
                                <div className="mt-4 flex items-center text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <SuccessIcon className="h-5 w-5 mr-2 text-blue-600"/>
                                    <span>{apiTestSuccess}</span>
                                </div>
                            )}
                            {apiSendSuccess && (
                                <div className="mt-4 flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <SuccessIcon className="h-5 w-5 mr-2 text-green-600"/>
                                    <span>{apiSendSuccess}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSend}
                data={documentData}
            />

            {/* AI Chat Widget */}
            <AIChatWidget />
        </div>
    );
};
