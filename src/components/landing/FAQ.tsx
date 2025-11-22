import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: 'Come funziona l\'OCR di CheckInly?',
            answer: 'CheckInly utilizza l\'intelligenza artificiale di Google Gemini 2.5 Flash per acquisire dati da documenti d\'identità (carte d\'identità, passaporti, patenti) ed estrarre automaticamente tutti i dati anagrafici. L\'accuratezza è del 99.2% e il processo richiede meno di 2 secondi per documento.'
        },
        {
            question: 'È compatibile con tutti i tipi di documenti?',
            answer: 'Sì! CheckInly supporta tutti i documenti di identità italiani (carta d\'identità, carta d\'identità elettronica, patente) e documenti internazionali (passaporti EU ed extra-EU). Il sistema riconosce automaticamente il tipo di documento e adatta l\'estrazione dati di conseguenza.'
        },
        {
            question: 'I miei dati sono sicuri? Come funziona la privacy?',
            answer: 'La sicurezza è la nostra priorità. I dati vengono criptati in transito (HTTPS) e a riposo. Non salviamo permanentemente i dati sensibili dei documenti - vengono processati solo per la compilazione del form e poi eliminati. Siamo 100% GDPR compliant. I dati rimangono sempre in Italia su server europei.'
        },
        {
            question: 'Posso cancellare l\'abbonamento in qualsiasi momento?',
            answer: 'Assolutamente sì. Non ci sono vincoli contrattuali. Puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard. Se cancelli, il piano rimarrà attivo fino alla fine del periodo già pagato, poi tornerai automaticamente al piano gratuito.'
        },
        {
            question: 'Funziona anche su mobile?',
            answer: 'Sì! La web app è completamente responsive e funziona perfettamente su tablet e smartphone. Puoi acquisire dati da documenti direttamente dalla fotocamera del telefono e inviare le schedine ad Alloggiati Web da qualsiasi dispositivo.'
        },
        {
            question: 'Serve installare software sul mio computer?',
            answer: 'No! CheckInly è completamente cloud-based. Ti serve solo un browser moderno per accedere alla web app. Tutto funziona online senza bisogno di installazioni o download.'
        },
        {
            question: 'Come funziona l\'invio automatico ad Alloggiati Web?',
            answer: 'Dopo aver acquisito i dati dal documento con l\'OCR, CheckInly compila automaticamente tutti i campi. Inserisci le tue credenziali Alloggiati Web (username, password e WSKEY) e clicca "Invia Schedina". Il sistema invia direttamente i dati tramite le API ufficiali della Polizia di Stato e ti fornisce la ricevuta di conferma.'
        },
        {
            question: 'Come ottengo la WSKEY per l\'invio automatico?',
            answer: 'La WSKEY (Web Service Key) è una chiave che abilita l\'invio automatico ad Alloggiati Web. Per ottenerla: 1) Accedi al portale Alloggiati Web (https://alloggiatiweb.poliziadistato.it), 2) Vai su "Profilo" nel menu, 3) Clicca su "Chiave Web Service", 4) Clicca "Genera Chiave" se non ce l\'hai già. La WSKEY è una stringa alfanumerica (tipo "AFWxClHwW6PKdenzGh0n...") che dovrai inserire in CheckInly insieme a username e password.'
        },
        {
            question: 'Cosa succede se l\'OCR fa un errore?',
            answer: 'Prima di inviare i dati ad Alloggiati Web, puoi sempre revisionare e correggere manualmente qualsiasi campo nel form. Ti consigliamo sempre di verificare i dati prima dell\'invio. In caso di errori ricorrenti, il nostro supporto è a disposizione per migliorare il sistema.'
        },
        {
            question: 'Posso usare CheckInly con più proprietà?',
            answer: 'Sì! Tutti i piani CheckInly includono la gestione di proprietà illimitate. Puoi usare le stesse credenziali Alloggiati Web per inviare schedine per tutte le tue strutture. Non ci sono costi aggiuntivi per proprietà.'
        },
        {
            question: 'Offrite supporto?',
            answer: 'Sì! Tutti i piani includono supporto via email. I piani a pagamento (Basic e Pro) hanno supporto prioritario. Siamo a disposizione per qualsiasi domanda o problema tecnico.'
        },
        {
            question: 'Posso provare CheckInly prima di pagare?',
            answer: 'Certamente! Il piano Free ti dà 5 invii gratuiti al mese senza bisogno di carta di credito. È perfetto per testare il servizio. Se ti piace, puoi fare upgrade in qualsiasi momento dalla dashboard.'
        },
        {
            question: 'Accettate pagamenti con carta?',
            answer: 'Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, American Express) tramite Stripe, il sistema di pagamento più sicuro al mondo.'
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Domande Frequenti
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tutto quello che devi sapere su CheckInly
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </span>
                                    <ChevronDownIcon
                                        className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                                            openIndex === index ? 'transform rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* Answer */}
                                <div
                                    className={`transition-all duration-300 ease-in-out ${
                                        openIndex === index
                                            ? 'max-h-96 opacity-100'
                                            : 'max-h-0 opacity-0 overflow-hidden'
                                    }`}
                                >
                                    <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-600 mb-4">
                        Non trovi la risposta che cerchi?
                    </p>
                    <a
                        href="mailto:support@checkinly.com"
                        className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
                    >
                        Contatta il Supporto
                    </a>
                </div>
            </div>
        </section>
    );
};
