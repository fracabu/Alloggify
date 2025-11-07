import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Alloggify
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
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Termini di Servizio
                        </h1>
                        <p className="text-xl text-gray-600">
                            Condizioni d'uso del servizio Alloggify
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
                        {/* Introduction */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Accettazione dei Termini</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">
                                    Benvenuto su Alloggify. Utilizzando il nostro servizio, accetti di essere vincolato dai presenti Termini di Servizio ("Termini"). Se non accetti questi Termini, non utilizzare il servizio.
                                </p>
                                <p>
                                    Alloggify è fornito da <strong>Alloggify SRL</strong>, con sede in Via Example 123, 00100 Roma, Italia, P.IVA: IT12345678901.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrizione del Servizio</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">
                                    Alloggify è un servizio di automazione OCR che consente agli utenti di:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Estrarre dati da documenti d'identità tramite intelligenza artificiale</li>
                                    <li>Compilare automaticamente il form del portale Alloggiati Web</li>
                                    <li>Inviare schedine via API SOAP al Portale Polizia di Stato</li>
                                    <li>Scaricare ricevute di invio in formato PDF</li>
                                </ul>
                                <p className="mt-4 text-sm bg-sky-50 border border-sky-200 rounded-lg p-4">
                                    <strong>Nota:</strong> Alloggify è un servizio di supporto. La responsabilità finale della correttezza e completezza dei dati inviati rimane all'utente e al gestore della struttura ricettiva.
                                </p>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Requisiti Account</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Per utilizzare Alloggify devi:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Avere almeno 18 anni</li>
                                    <li>Fornire informazioni accurate e complete durante la registrazione</li>
                                    <li>Mantenere la sicurezza della tua password</li>
                                    <li>Essere responsabile di tutte le attività svolte con il tuo account</li>
                                    <li>Notificarci immediatamente di qualsiasi accesso non autorizzato</li>
                                </ul>
                                <p className="mt-4">
                                    <strong>Ci riserviamo il diritto di sospendere o terminare account che violano questi Termini.</strong>
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Piani e Pagamenti</h2>
                            <div className="prose max-w-none text-gray-600">
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <h3 className="font-semibold">Piano Gratuito</h3>
                                        </div>
                                        <ul className="text-sm space-y-1">
                                            <li>• 5 scansioni/mese</li>
                                            <li>• Supporto community</li>
                                            <li>• Funzionalità base</li>
                                        </ul>
                                    </div>
                                    <div className="border border-primary-200 bg-primary-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                                            <h3 className="font-semibold">Piani Premium</h3>
                                        </div>
                                        <ul className="text-sm space-y-1">
                                            <li>• Da 100 a 5000 scansioni/mese</li>
                                            <li>• Supporto prioritario</li>
                                            <li>• Funzionalità avanzate</li>
                                        </ul>
                                    </div>
                                </div>
                                <p><strong>Fatturazione:</strong></p>
                                <ul className="list-disc pl-6 space-y-2 mt-2">
                                    <li>I piani premium sono fatturati mensilmente o annualmente in anticipo</li>
                                    <li>I pagamenti sono processati tramite Stripe (PCI-DSS compliant)</li>
                                    <li>Rinnovo automatico salvo cancellazione</li>
                                    <li>Cancellazione possibile in qualsiasi momento (nessuna penale)</li>
                                    <li>Rimborso pro-rata per cancellazioni anticipate (piani annuali)</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso Accettabile</h2>
                            <div className="prose max-w-none text-gray-600">
                                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold mb-2">Uso Consentito:</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>✓ Scansione documenti ospiti della tua struttura</li>
                                                <li>✓ Invio dati al Portale Alloggiati Web per conformità legale</li>
                                                <li>✓ Utilizzo commerciale all'interno della tua azienda</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold mb-2">Uso NON Consentito:</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>✗ Scansione documenti senza consenso</li>
                                                <li>✗ Rivendita o redistribuzione del servizio</li>
                                                <li>✗ Reverse engineering o tentativo di copiare la tecnologia</li>
                                                <li>✗ Invio dati fraudolenti o falsificati</li>
                                                <li>✗ Uso per attività illegali</li>
                                                <li>✗ Sovraccarico intenzionale dell'infrastruttura</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Proprietà Intellettuale</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">
                                    Tutti i diritti, titoli e interessi relativi ad Alloggify (inclusi software, design, loghi, contenuti) appartengono ad Alloggify SRL. Ti concediamo una licenza limitata, non esclusiva, non trasferibile per utilizzare il servizio.
                                </p>
                                <p>
                                    I dati che carichi rimangono di tua proprietà. Ci concedi una licenza limitata per processarli al solo fine di fornirti il servizio.
                                </p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitazione di Responsabilità</h2>
                            <div className="prose max-w-none text-gray-600">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm">
                                            <strong>Importante:</strong> Alloggify è fornito "così com'è" senza garanzie di alcun tipo, esplicite o implicite.
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-4">Non garantiamo che:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Il servizio sarà ininterrotto o privo di errori</li>
                                    <li>L'OCR avrà accuratezza del 100% (anche se puntiamo al 99%+)</li>
                                    <li>I dati saranno sempre disponibili (raccomandiamo backup propri)</li>
                                </ul>
                                <p className="mt-4">
                                    <strong>La nostra responsabilità massima è limitata agli importi pagati nell'ultimo mese.</strong> Non saremo responsabili per danni indiretti, incidentali, speciali, consequenziali o punitivi.
                                </p>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifiche al Servizio</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p>
                                    Ci riserviamo il diritto di modificare, sospendere o interrompere parte o tutto il servizio con preavviso di 30 giorni per modifiche sostanziali. In caso di interruzione permanente, riceverai un rimborso pro-rata.
                                </p>
                            </div>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Legge Applicabile</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p>
                                    Questi Termini sono regolati dalla legge italiana. Qualsiasi controversia sarà sottoposta alla competenza esclusiva del Tribunale di Roma.
                                </p>
                            </div>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contatti</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p className="mb-4">Per domande su questi Termini:</p>
                                <ul className="space-y-2 text-gray-700">
                                    <li><strong>Email Legale:</strong> legal@alloggify.com</li>
                                    <li><strong>Email Supporto:</strong> support@alloggify.com</li>
                                    <li><strong>Telefono:</strong> +39 06 1234 5678 (Lun-Ven 9-18)</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            Accetta e Crea Account
                        </Link>
                        <p className="mt-4 text-sm text-gray-600">
                            Creando un account, accetti questi Termini e la nostra <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
