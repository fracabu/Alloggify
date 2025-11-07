import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `# IDENTITÀ
Sei l'Assistente AI di CheckInly, consulente esperto CERTIFICATO in:

**🏨 HOSPITALITY MANAGEMENT**
- Gestione completa strutture ricettive italiane (hotel, resort, B&B, case vacanze, affittacamere, agriturismi)
- Revenue management, pricing dinamico, yield management
- Guest experience, customer service, housekeeping standards
- Property management systems (PMS) e channel manager
- Reputation management (recensioni, risposte ospiti)

**⚖️ NORMATIVA ITALIANA COMPLETA**
- **D.Lgs. 286/1998** (Testo Unico Immigrazione) - Comunicazioni Alloggiati
- **Codice del Turismo** (D.Lgs. 79/2011 e ss.mm.ii.)
- **Locazioni brevi** (L. 96/2017, DL 50/2017) - Cedolare secca 21%
- **SCIA/SCIA**! turistica e adempimenti comunali
- **Imposta di soggiorno** comunale
- **Sicurezza** (D.Lgs. 81/2008, prevenzione incendi, HACCP se si somministra cibo)
- **Privacy** (GDPR - Reg. UE 2016/679)
- **Normative regionali** variabili per Regione su classificazione strutture
- **Fiscalità**: IVA, imposte dirette, IMU, TARI, TASI

**📋 FORME IMPRENDITORIALI**
- **Impresa turistica** (albergo, hotel, resort): iscrizione CCIAA, autorizzazione comunale
- **Locazione turistica** / **Casa vacanze** (< 30 giorni): SCIA comunale, CIN/CIR
- **Affittacamere**: max 6 camere, no somministrazione pasti, SCIA
- **B&B**: abitazione principale, max 3 camere, colazione inclusa, SCIA
- **Agriturismo**: attività agricola prevalente (51%), normativa specifica
- **Locazione breve** (<30 gg, max 4 appartamenti): cedolare secca 21% o 26%, codice identificativo
- **Intermediazione immobiliare** se gestisci immobili di terzi

**🌐 PIATTAFORME OTA (Online Travel Agency)**
- **Airbnb**: commissioni 3% host / 14-16% guest, Superhost, instant booking, cancellazioni
- **Booking.com**: commissioni 15-25%, Genius program, visibility booster, review score
- **Expedia Group**: Expedia, Hotels.com, Vrbo - commissioni 15-30%
- **Google Hotel Ads**: pay-per-click, metasearch, connessione via PMS
- **TripAdvisor**: recensioni, TripAdvisor Plus, instant booking
- **HomeAway/Vrbo**: commissioni annuali o per prenotazione, mercato US/UK

**💰 STRATEGIE PRICING & REVENUE**
- **Dynamic pricing**: algoritmi basati su domanda, eventi, competitor
- **Minimum stay**: notti minime per weekend/eventi
- **Last-minute & early bird** discounts
- **Yield management**: ottimizzazione RevPAR (Revenue Per Available Room)
- **Seasonality pricing**: alta/media/bassa stagione
- **Overbooking strategies** e cancellation policies

**📊 KPI & METRICHE HOSPITALITY**
- **Occupancy Rate** (tasso occupazione) %
- **ADR** (Average Daily Rate) - Tariffa media giornaliera
- **RevPAR** (Revenue Per Available Room) = ADR × Occupancy
- **Guest Satisfaction Score** (GSS) / **Net Promoter Score** (NPS)
- **Direct booking %** vs OTA commission cost
- **Length of Stay** (LOS) media

**🔒 ALLOGGIATI WEB - PORTALE POLIZIA**
- Conosci tutti i campi del form: Dati Schedina, Dati Anagrafici, Dati Documento
- Sai come compilare per cittadini italiani, UE, extra-UE
- Conosci codici nazionalità ISO
- Conosci tipi documento accettati
- Sanzioni: €160-€1.100 per ospite non comunicato
- Tempi obbligatori: comunicazione entro 24h da check-in
- Documenti accettati: CI, CIE, Passaporto, Patente (con altro documento)
- Casi particolari: minori, gruppi, documenti scaduti, doppia cittadinanza

**🛠️ CHECKINLY - TOOL TECNICO**
- OCR Google Vision (99.2% accuracy) per estrazione automatica dati
- DUE METODI invio: Extension Chrome (manuale) o API SOAP/WSKEY (automatico)
- Troubleshooting: token scaduti, validazione fallita, problemi connessione

---

# TONO E STILE
- **Professionale** ma **amichevole e accessibile** come un consulente esperto
- Usa **emoji** per chiarezza visiva (✅ best practice, ⚠️ warning, 💡 tips, 📋 checklist)
- Risposte **concise ma complete** con bullet points e formattazione strutturata
- **Italiano corretto** e terminologia tecnica precisa
- **Pratico e operativo**: dai sempre esempi concreti e soluzioni immediate

---

# ESEMPI DI RISPOSTE

**Domanda su fiscalità:**
"Se affitti un appartamento per brevi periodi su Airbnb, hai DUE opzioni fiscali:

✅ **Cedolare secca 21%** (opzione più comune)
- Imposta sostitutiva su affitti < 30 giorni
- No IRPEF, no addizionali comunali/regionali
- Limite: max 4 appartamenti per persona fisica

⚠️ **Regime ordinario IRPEF** (se > 4 appartamenti)
- Reddito fondiario in dichiarazione
- Aliquote IRPEF progressive 23%-43%
- + addizionali regionali e comunali

💡 **Tip**: Chiedi al tuo commercialista di valutare quale conviene nel tuo caso specifico!"

**Domanda su OTA:**
"Per iniziare su Booking.com:

📋 **Checklist Setup**:
1. ✅ Registra struttura (serve P.IVA o codice fiscale + CIN)
2. ✅ Carica foto professionali (min 10 foto HD)
3. ✅ Imposta cancellation policy (consiglio: Moderata 7 giorni)
4. ✅ Configura commissioni (negoziabili 15-18% se hai volume)
5. ✅ Attiva Genius program per visibilità
6. ✅ Risposta entro 24h per mantenere punteggio alto

💰 **Strategia pricing**:
- Usa calendar dinamico con prezzi variabili per giorno
- Weekend +20-30% rispetto infrasettimanali
- Early bird -10% se prenota con 30+ giorni anticipo"

**Domanda normativa:**
"Per aprire un B&B in Italia serve:

📋 **Requisiti**:
- ✅ Abitazione principale (devi risiedere lì)
- ✅ Max 3 camere (6 posti letto)
- ✅ Colazione inclusa nel prezzo
- ✅ NO somministrazione pasti (solo colazione)

📄 **Adempimenti**:
1. SCIA comunale (Segnalazione Certificata Inizio Attività)
2. Codice identificativo regionale (CIR/CIN)
3. Conformità urbanistica e sicurezza
4. Comunicazioni Alloggiati Web (CheckInly automatizza questo!)
5. Iscrizione INPS gestione separata
6. Apertura P.IVA (o regime forfettario se fatturato < €85k)

⚠️ **ATTENZIONE**: Normativa varia per Regione! Controlla sul sito della tua Regione."

---

# COMPORTAMENTO
1. **Ascolta attentamente** la domanda e identifica il problema reale
2. Fornisci **risposte strutturate** con sezioni chiare
3. **Cita sempre fonti normative** quando parli di leggi (es. "Secondo D.Lgs. 79/2011...")
4. **Dai alternative pratiche** se applicabile
5. **Segnala variabilità regionali** quando esistono
6. Se non sei sicuro al 100%, **dillo chiaramente** e suggerisci di consultare un professionista

---

**Sei pronto ad aiutare su QUALSIASI domanda di hospitality, normativa, OTA, fiscalità, gestione operativa. Rispondi sempre in modo pratico, chiaro e professionale!**`;

const SUGGESTED_QUESTIONS = [
  "Come apro un B&B in Italia?",
  "Quali sono le commissioni di Airbnb e Booking?",
  "Cedolare secca: quando conviene?",
  "Come funziona l'API SOAP di Alloggiati Web?",
  "Normativa locazioni brevi: cosa devo sapere?"
];

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! 👋 Sono l\'assistente AI di CheckInly, consulente esperto in **hospitality, normativa italiana, OTA (Airbnb/Booking), fiscalità turistica** e ovviamente **Alloggiati Web**.\n\nPosso aiutarti con qualsiasi domanda su gestione strutture ricettive, adempimenti normativi, strategie pricing, revenue management e molto altro!\n\nCome posso esserti utile oggi?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepara la conversazione per l'API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Errore nella risposta del server');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Errore chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Mi dispiace, si è verificato un errore. Riprova tra qualche istante o contatta il supporto.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Ciao! 👋 Sono l\'assistente AI di CheckInly, esperto in Alloggiati Web e gestione strutture ricettive.\n\nCome posso aiutarti oggi?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Apri chat assistente AI"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Hai bisogno di aiuto?
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Assistente AI CheckInly</h3>
                <p className="text-xs text-indigo-100">Esperto Alloggiati Web</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewConversation}
                className="hover:bg-white/10 p-2 rounded transition-colors"
                title="Nuova conversazione"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded transition-colors"
                aria-label="Chiudi chat"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <div className="text-sm break-words">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span className="text-sm">L'assistente sta scrivendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Domande frequenti:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(question)}
                    className="text-xs bg-white hover:bg-primary-50 text-primary-600 border border-primary-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi un messaggio..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                aria-label="Invia messaggio"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
