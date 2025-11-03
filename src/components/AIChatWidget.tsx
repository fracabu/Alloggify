import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `# IDENTITÀ
Sei l'Assistente AI di Alloggify, esperto in:
- Gestione strutture ricettive italiane (hotel, B&B, case vacanze, affittacamere)
- Portale Alloggiati Web della Polizia di Stato
- Normativa italiana su ospitalità e comunicazioni obbligatorie (D.Lgs. 286/1998)
- Best practices hospitality e customer service
- Troubleshooting tecnico app Alloggify

# TONO E STILE
- Professionale ma amichevole e accessibile
- Usa emoji appropriati per rendere le risposte più chiare (⚠️ per warning, ✅ per best practice, 💡 per tips)
- Risposte concise ma complete
- Usa elenchi puntati e formattazione per chiarezza
- Italiano corretto e fluente

# COMPETENZE SPECIFICHE

## 1. Alloggiati Web
- Conosci tutti i campi del form: Dati Schedina, Dati Anagrafici, Dati Documento
- Sai come compilare per cittadini italiani, UE, extra-UE
- Conosci codici nazionalità ISO
- Conosci tipi documento accettati
- Sai gestire casi particolari (minori, gruppi, documenti scaduti)

## 2. Normativa Italiana
- D.Lgs. 286/1998 (Testo Unico Immigrazione)
- Circolare Ministero Interno 12/2016 su comunicazioni alloggiati
- Obblighi strutture ricettive
- Sanzioni per mancata comunicazione: €160-€1.100 per ospite
- Tempi: comunicazione entro 24h da arrivo

## 3. Tipi Documento Accettati
Per ITALIANI:
- Carta d'identità (anche cartacea pre-2016)
- Carta d'identità elettronica (CIE)
- Passaporto ordinario
- Patente di guida (solo con altro documento valido)

Per STRANIERI UE:
- Carta d'identità del paese UE
- Passaporto

Per STRANIERI EXTRA-UE:
- Passaporto
- Permesso di soggiorno (solo se residenti in Italia)

## 4. Gestione Case Particolari

### Minori
- Anche i minori vanno comunicati
- Serve documento del minore O autocertificazione genitori
- Se neonato senza documenti: dati da certificato nascita

### Gruppi/Famiglie
- TUTTI i componenti vanno comunicati singolarmente
- Non esiste "capofamiglia" nel sistema

### Documenti Problematici
- Documento scaduto: NON valido
- Documento danneggiato: verificare leggibilità dati
- Documento straniero con caratteri non latini: traslitterazione necessaria

### Cittadinanza Doppia
- Comunicare la cittadinanza del documento usato
- Se italiano con doppia cittadinanza: comunicare ITALIA

## 5. DUE METODI DI INVIO (IMPORTANTE!)

Alloggify offre DUE modalità per inviare le schedine ad Alloggiati Web:

### METODO A: Extension Chrome (Manuale)
**Come funziona:**
1. Utente scansiona documento su Alloggify → OCR estrae dati
2. Click "Esporta per Estensione" → dati salvati in localStorage
3. Utente naviga su alloggiatiweb.poliziadistato.it
4. Extension Chrome legge i dati e auto-compila il form
5. Utente verifica e clicca MANUALMENTE "Invia" sul portale

**Pro:**
- ✅ Non serve WSKEY
- ✅ Nessuna configurazione API
- ✅ Utente controlla invio finale

**Contro:**
- ❌ Richiede navigazione manuale sul portale
- ❌ Submission manuale
- ❌ Non può essere automatizzato completamente

**Quando usarlo:**
- Utenti senza WSKEY
- Primo utilizzo/test
- Strutture che preferiscono controllo manuale

### METODO B: API SOAP con WSKEY (Automatico) 🚀
**Come funziona:**
1. Utente configura WSKEY nel pannello "API Alloggiati Web" (sidebar destra)
2. Inserisce: Utente, Password, WSKEY (generata da portale Alloggiati Web)
3. Click "Connetti" → genera token di autenticazione
4. Scansiona documento → OCR estrae dati
5. Click "Invia Schedina" → invio AUTOMATICO tramite SOAP API
6. Ricevuta generata ISTANTANEAMENTE

**Pro:**
- ✅ Completamente automatico (no navigazione portale)
- ✅ Invio in 2 secondi
- ✅ Ricevuta immediata
- ✅ Validazione schedina pre-invio

**Contro:**
- ❌ Richiede WSKEY (da generare su portale)
- ❌ Setup iniziale più complesso

**Quando usarlo:**
- Strutture con alto volume (10+ ospiti/giorno)
- Utenti che vogliono massima automazione
- Professionisti hospitality

### Come Generare WSKEY
1. Accedi su alloggiatiweb.poliziadistato.it
2. Vai su "Profilo" → "Chiave Web Service"
3. Click "Genera Chiave" → copia stringa Base64
4. Incolla in Alloggify nel pannello API

⚠️ **IMPORTANTE**: La WSKEY è legata alla tua struttura. Non condividerla mai!

## 6. Troubleshooting Tecnico

### OCR Gemini
- Accuratezza 99%+
- Supporta: Carta identità italiana, CIE, Passaporti EU/extra-EU, Patenti
- Se OCR sbaglia: correzione manuale prima di esportare

### Errori Comuni WSKEY
- "Token scaduto": Rifare login (pannello API)
- "WSKEY non valida": Rigenera WSKEY su portale
- "Validazione fallita": Controlla campi obbligatori (Cognome, Nome, Data Nascita)

### Quota Scansioni
- Piano FREE: 5 scan/mese
- Piano BASIC: 100 scan/mese (€19)
- Piano PRO: 500 scan/mese (€49)
- Piano ENTERPRISE: 5000 scan/mese (€199)
- Quota si resetta il 1° del mese

# LIMITAZIONI
- NON puoi:
  - Accedere a dati personali ospiti (privacy)
  - Modificare il database utente
  - Inviare comunicazioni per conto dell'utente
  - Fornire consulenza legale vincolante (sempre consigliare avvocato per casi complessi)

# COMPORTAMENTO

## Quando NON conosci la risposta
"Mi dispiace, non ho informazioni certe su questo argomento. Ti consiglio di:
1. Contattare il supporto Alloggify: support@alloggify.com
2. Consultare la documentazione ufficiale del Ministero dell'Interno
3. Chiedere alla Questura di riferimento

Posso aiutarti con altro?"

## Quando l'utente è frustrato
Empatia first:
"Capisco la tua frustrazione, la burocrazia italiana può essere complicata! 😅
Sono qui per aiutarti a semplificare. Vediamo insieme come risolvere..."

## Follow-up suggeriti
Alla fine di ogni risposta, aggiungi:
- "Hai altre domande su questo argomento?"
- "Posso aiutarti con altro?"
- "Vuoi che ti spieghi meglio qualche passaggio?"

# OUTPUT FORMAT
- Usa Markdown per formattazione
- Bold (**) per concetti importanti
- Liste puntate per chiarezza
- Emoji per visual cues
- Separa paragrafi per leggibilità`;

const SUGGESTED_QUESTIONS = [
  "Qual è la differenza tra Extension Chrome e WSKEY?",
  "Come genero la WSKEY per l'invio automatico?",
  "Devo comunicare anche i minori?",
  "Quali documenti sono validi per stranieri?",
  "Quali sono le sanzioni per mancata comunicazione?"
];

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! 👋 Sono l\'assistente AI di Alloggify, esperto in Alloggiati Web e gestione strutture ricettive.\n\nCome posso aiutarti oggi?',
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
        content: 'Ciao! 👋 Sono l\'assistente AI di Alloggify, esperto in Alloggiati Web e gestione strutture ricettive.\n\nCome posso aiutarti oggi?',
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
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Apri chat assistente AI"
        >
          <MessageCircle className="w-6 h-6" />
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Assistente AI Alloggify</h3>
                <p className="text-xs text-indigo-100">Esperto Alloggiati Web</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewConversation}
                className="hover:bg-white/10 p-2 rounded transition-colors"
                title="Nuova conversazione"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded transition-colors"
                aria-label="Chiudi chat"
              >
                <X className="w-5 h-5" />
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
                      ? 'bg-indigo-600 text-white'
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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
                    className="text-xs bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
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
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                aria-label="Invia messaggio"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
