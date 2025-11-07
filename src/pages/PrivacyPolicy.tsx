import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';
import { HomeModernIcon } from '@heroicons/react/24/outline';

export const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
                            </h1>
                        </Link>
                        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                            ← Torna alla Home
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-6">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-gray-600">
                            La tua privacy è importante per noi. Ecco come proteggiamo i tuoi dati.
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-12">
                        {/* Key Principles */}
                        <div className="grid md:grid-cols-3 gap-6 pb-12 border-b border-gray-200">
                            {[
                                { icon: Lock, title: 'Dati Criptati', desc: 'Tutti i dati sono criptati end-to-end' },
                                { icon: Eye, title: 'Trasparenza', desc: 'Saprai sempre cosa facciamo con i tuoi dati' },
                                { icon: UserCheck, title: 'Controllo Totale', desc: 'Puoi eliminare i tuoi dati in qualsiasi momento' }
                            ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-3">
                                        <item.icon className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Dati che Raccogliamo</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">
                                    Raccogliamo solo i dati essenziali per fornire il servizio CheckInly:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li><strong>Dati Account:</strong> Email, nome completo, nome azienda (opzionale)</li>
                                    <li><strong>Dati Documenti:</strong> Immagini di documenti d'identità processate tramite OCR</li>
                                    <li><strong>Dati Tecnici:</strong> Indirizzo IP, browser, sistema operativo (per sicurezza)</li>
                                    <li><strong>Dati Utilizzo:</strong> Numero scansioni, timestamp, preferenze app</li>
                                </ul>
                                <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <strong>Importante:</strong> Le immagini dei documenti NON sono salvate permanentemente sui nostri server. Vengono processate in tempo reale e eliminate immediatamente dopo l'estrazione dei dati.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Come Utilizziamo i Tuoi Dati</h2>
                            <div className="prose max-w-none text-gray-600">
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Fornire e migliorare il servizio di compilazione automatica</li>
                                    <li>Autenticare il tuo account e prevenire accessi non autorizzati</li>
                                    <li>Inviarti notifiche importanti sul servizio (mai spam)</li>
                                    <li>Analizzare l'utilizzo per migliorare funzionalità</li>
                                    <li>Conformità con obblighi legali e fiscali</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Condivisione Dati</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">
                                    <strong>NON vendiamo né condividiamo i tuoi dati personali con terze parti</strong>, salvo nei seguenti casi limitati:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Fornitori Servizi Essenziali:</strong> Google Cloud (Gemini AI per OCR), servizi hosting sicuri</li>
                                    <li><strong>Obblighi Legali:</strong> Se richiesto per legge o in risposta a procedure legali valide</li>
                                    <li><strong>Portale Polizia:</strong> Solo i dati che tu scegli di inviare tramite API Alloggiati Web</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sicurezza e Conservazione Dati</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Implementiamo misure di sicurezza rigorose:</p>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>Crittografia TLS/SSL per tutte le comunicazioni</li>
                                    <li>Crittografia at-rest per database</li>
                                    <li>Autenticazione a due fattori (opzionale)</li>
                                    <li>Backup automatici giornalieri</li>
                                    <li>Server ubicati in UE (conformità GDPR)</li>
                                </ul>
                                <p><strong>Conservazione:</strong> I dati account vengono conservati finché l'account è attivo. Puoi richiedere la cancellazione in qualsiasi momento.</p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. I Tuoi Diritti (GDPR)</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Ai sensi del GDPR, hai diritto a:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Accesso:</strong> Ottenere una copia di tutti i tuoi dati</li>
                                    <li><strong>Rettifica:</strong> Correggere dati inesatti o incompleti</li>
                                    <li><strong>Cancellazione:</strong> Richiedere la rimozione completa dei tuoi dati</li>
                                    <li><strong>Portabilità:</strong> Ricevere i tuoi dati in formato leggibile</li>
                                    <li><strong>Opposizione:</strong> Opporti a determinati trattamenti</li>
                                    <li><strong>Limitazione:</strong> Limitare il trattamento in circostanze specifiche</li>
                                </ul>
                                <p className="mt-4">
                                    Per esercitare questi diritti, contattaci a: <a href="mailto:privacy@alloggify.com" className="text-indigo-600 hover:underline">privacy@alloggify.com</a>
                                </p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie e Tracking</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Utilizziamo solo cookie essenziali per:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Mantenere la tua sessione di login</li>
                                    <li>Ricordare le tue preferenze (lingua, tema)</li>
                                    <li>Garantire la sicurezza dell'applicazione</li>
                                </ul>
                                <p className="mt-4 text-sm bg-green-50 border border-green-200 rounded-lg p-4">
                                    <strong>Zero tracciamento pubblicitario:</strong> Non usiamo Google Analytics, Facebook Pixel o altri tracker di terze parti.
                                </p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifiche a Questa Policy</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p>
                                    Potremmo aggiornare questa Privacy Policy occasionalmente. Ti avviseremo di modifiche significative tramite email o notifica nell'app. L'uso continuato del servizio dopo le modifiche implica l'accettazione della policy aggiornata.
                                </p>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contatti</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Per domande sulla privacy o per esercitare i tuoi diritti:</p>
                                <ul className="space-y-2 text-gray-700">
                                    <li><strong>Email Privacy:</strong> privacy@alloggify.com</li>
                                    <li><strong>Supporto:</strong> support@alloggify.com</li>
                                    <li><strong>DPO (Data Protection Officer):</strong> dpo@alloggify.com</li>
                                </ul>
                                <p className="mt-4">
                                    Indirizzo: CheckInly SRL, Via Example 123, 00100 Roma, Italia
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            Crea Account Gratuito
                        </Link>
                        <p className="mt-4 text-sm text-gray-600">
                            Accettando i nostri <Link to="/terms" className="text-indigo-600 hover:underline">Termini di Servizio</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
