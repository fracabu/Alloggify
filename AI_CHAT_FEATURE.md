# 🤖 AI Chat Assistant - Feature Design

> Chat AI esperta in gestione alloggi, case vacanze e normativa Alloggiati Web
>
> **Data creazione**: 2 Novembre 2025
> **Status**: In fase di design

---

## 🎯 Obiettivo della Feature

Fornire un **assistente AI 24/7** nella dashboard che aiuti i gestori di strutture ricettive con:
- Supporto su Alloggiati Web
- Consigli gestione ospiti
- Normative e compliance
- Best practices hospitality
- Troubleshooting problemi tecnici
- Suggerimenti per ottimizzare il workflow

---

## 💡 Casi d'Uso Principali

### 1. Supporto Alloggiati Web
**Domanda esempio**: *"Come compilo il campo cittadinanza per un ospite svizzero?"*

**Risposta AI**:
```
Per un ospite svizzero devi inserire:
- Cittadinanza: "SVIZZERA" (tutto maiuscolo)
- Stato di nascita: "SVIZZERA"
- Tipo documento: "PASSAPORTO" (se ha passaporto) o "CARTA DI IDENTITA'"
  (se ha carta identità elvetica)

⚠️ Nota: La Svizzera NON fa parte dell'UE, quindi è considerata extra-UE
nel sistema Alloggiati Web.

Posso aiutarti con altro?
```

### 2. Consigli Gestione Ospiti
**Domanda esempio**: *"Quanto tempo prima del check-in devo chiedere i documenti?"*

**Risposta AI**:
```
Ti consiglio di richiedere i documenti almeno 24-48 ore prima del check-in:

✅ Vantaggi:
- Pre-compili Alloggiati Web con calma
- Riduci code al check-in
- Identifichi problemi sui documenti in anticipo
- Migliori customer experience

📧 Buona pratica:
Invia email automatica 2 giorni prima con:
- Link per upload documento (foto fronte/retro)
- Promemoria orario check-in
- Info parcheggio/accesso struttura

Con Alloggify puoi processare i documenti in 30 secondi appena li ricevi!

Vuoi un template email da usare?
```

### 3. Normative e Compliance
**Domanda esempio**: *"Sono obbligato a comunicare TUTTI gli ospiti o solo il capofamiglia?"*

**Risposta AI**:
```
⚠️ Obbligo di legge: Devi comunicare TUTTI gli ospiti, inclusi minori.

Secondo il D.Lgs. 286/1998 e la Circolare del Ministero dell'Interno:
- ✅ Ogni persona che pernotta va comunicata
- ✅ Anche i minorenni (con documenti dei genitori)
- ✅ Anche per soggiorni di 1 sola notte
- ✅ Entro 24 ore dall'arrivo

❌ Non comunicare tutti gli ospiti può causare:
- Sanzioni da €160 a €1.100 per ospite non comunicato
- Segnalazione alla Questura

💡 Con Alloggify puoi scansionare più documenti in batch e inviarli tutti insieme!

Hai altri dubbi sulla normativa?
```

### 4. Troubleshooting Tecnico
**Domanda esempio**: *"L'estensione Chrome non compila il campo data di nascita, perché?"*

**Risposta AI**:
```
Questo può succedere se il formato della data non è corretto. Ecco cosa controllare:

1️⃣ Verifica il formato:
   - Il portale Alloggiati Web vuole: GG/MM/AAAA (es: 15/03/1985)
   - Se Alloggify ha estratto AAAA-MM-GG, l'estensione lo converte automaticamente

2️⃣ Controlla il campo nel portale:
   - Clicca manualmente sul campo data
   - Se appare un calendario, l'estensione potrebbe non riempirlo automaticamente
   - Soluzione: usa il calendario del portale

3️⃣ Se persiste il problema:
   - Aggiorna l'estensione all'ultima versione
   - Ricarica la pagina Alloggiati Web (F5)
   - Riprova a compilare

🛠️ Se il problema continua, contatta support@alloggify.com con uno screenshot!

Ti è utile questa risposta?
```

### 5. Best Practices Hospitality
**Domanda esempio**: *"Come gestire documenti scaduti di ospiti stranieri?"*

**Risposta AI**:
```
⚠️ Documento scaduto = NON valido per check-in. Ecco cosa fare:

📋 Procedura corretta:
1. Informa l'ospite che il documento è scaduto
2. Chiedi un documento alternativo valido:
   - Passaporto (se ha solo CI scaduta)
   - Patente + Passaporto

3. Se l'ospite non ha documenti validi:
   - Per italiani: può andare in comune per documento temporaneo
   - Per stranieri: deve contattare ambasciata/consolato

4. In casi estremi (arrivo notturno, emergenza):
   - Accetta l'ospite MA non compilare Alloggiati Web con doc scaduto
   - Fai firmare una dichiarazione
   - Chiedi documento valido entro 24h
   - Poi compila Alloggiati Web con quello valido

⚖️ Rischio legale: Comunicare dati da documento scaduto può essere sanzionabile.

💡 Tip: Nella pre-check-in email, chiedi "Il tuo documento è valido (non scaduto)?"

Altre domande sulla gestione documenti?
```

---

## 🎨 UI/UX Design

### Posizionamento nella Dashboard

**Opzione 1: Floating Chat Button (Consigliata)**
- Icona chat floating bottom-right (come Intercom)
- Sempre visibile in tutte le pagine dashboard
- Click → apre chat sidebar
- Badge con numero messaggi non letti (future feature)

**Opzione 2: Dedicata Tab Dashboard**
- Route `/dashboard/ai-assistant`
- Icona nel menu principale
- Pagina full-screen per conversazioni lunghe

**Scelta consigliata**: **Entrambe!**
- Floating button per quick help
- Pagina dedicata per chat approfondite

### Componenti UI

```
┌─────────────────────────────────┐
│  🤖 Assistente AI Alloggify     │  ← Header
├─────────────────────────────────┤
│                                 │
│  👤 User: Come compilo il      │
│     campo cittadinanza?         │
│                                 │
│  🤖 AI: Per compilare la       │
│     cittadinanza...             │
│     [Risposta formattata]       │
│                                 │
│  Suggested questions:           │  ← Quick replies
│  • Documenti extra-UE?         │
│  • Normativa minori            │
│  • Tempi compilazione          │
│                                 │
├─────────────────────────────────┤
│  [Scrivi un messaggio...]  [📎] │  ← Input + Attach
└─────────────────────────────────┘
```

### Features UI

1. **Typing Indicator**
   - "L'assistente sta scrivendo..." con animazione dots

2. **Message Formatting**
   - Markdown support (bold, lists, code blocks)
   - Emoji per rendere friendly
   - Link cliccabili

3. **Suggested Questions**
   - 3-4 domande suggerite in base al contesto
   - Cambiano dinamicamente

4. **Quick Actions**
   - Button "Nuova conversazione"
   - Button "Copia risposta"
   - Feedback thumbs up/down

5. **Attachment Support (Future)**
   - Upload documento per OCR + domanda
   - "Questo documento va bene per check-in?"

6. **Voice Input (Future)**
   - Microfono per dettare domanda
   - Utile per mobile

---

## 🧠 AI Provider & Modello

### Opzioni Provider

| Provider | Modello | Pro | Contro | Costo (1K msg) |
|----------|---------|-----|--------|----------------|
| **Gemini** | Gemini 2.0 Flash | **FREE tier 1500 req/day**, Velocissimo, Già integrato | - | **$0.00** (FREE) |
| **Gemini** | Gemini 1.5 Pro | Ottima qualità, Già integrato | Più lento di Flash | $0.02 |
| **OpenAI** | GPT-4o | Migliore qualità, Italiano eccellente | Costoso | $0.50 |
| **Anthropic** | Claude 3.5 Sonnet | Ottima qualità, Conversazionale | Setup aggiuntivo, Costo | $0.30 |
| **Groq** | Llama 3.1 70B | Velocissimo, Economico | Open-source, qualità variabile | $0.05 |

### Scelta Consigliata: **Gemini 2.0 Flash** ⚡

**Motivi**:
- ✅ **Completamente GRATIS** (fino a 1500 richieste/giorno)
- ✅ **Già integrato** per OCR (stessa API key)
- ✅ **Velocissimo** (< 1 secondo per risposta)
- ✅ **Ottimo in Italiano** (multilingua nativo)
- ✅ **Buona comprensione contesto** (1M token context window)
- ✅ **Google affidabile** come provider
- ✅ **2M token input gratis/giorno** nel FREE tier

**FREE Tier Limits** (più che sufficienti):
- 1500 richieste al giorno
- 2M token input/giorno
- 1M token output/giorno
→ Con 500 utenti attivi (20 msg/mese ciascuno) = ~333 msg/giorno = **GRATIS infinito**!

**Fallback**: Gemini 1.5 Pro (se serve più qualità)

---

## 📝 System Prompt Esperto

```markdown
# IDENTITÀ
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

## 5. Troubleshooting Alloggify

### Extension Chrome
- Compatibile con Alloggiati Web (alloggiatiweb.poliziadistato.it)
- Legge dati da localStorage
- Compila automaticamente i campi del form
- Converte formati (date YYYY-MM-DD → DD/MM/YYYY, sesso M/F)

### OCR Gemini
- Accuratezza 99%+
- Supporta: Carta identità italiana, CIE, Passaporti EU/extra-EU, Patenti
- Se OCR sbaglia: correzione manuale prima di esportare

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

## Quando l'utente chiede supporto urgente
"Per assistenza urgente, contatta il supporto Alloggify:
📧 Email: support@alloggify.com
📞 Tel: +39 06 1234 5678 (Lun-Ven 9-18)
💬 Chat live: disponibile in dashboard (orari ufficio)

Risposta garantita entro 2 ore in orario lavorativo.

Nel frattempo, posso aiutarti a risolvere il problema?"

## Quando l'utente è frustrato
Empatia first:
"Capisco la tua frustrazione, la burocrazia italiana può essere complicata! 😅
Sono qui per aiutarti a semplificare. Vediamo insieme come risolvere..."

## Follow-up suggeriti
Alla fine di ogni risposta, aggiungi:
- "Hai altre domande su questo argomento?"
- "Posso aiutarti con altro?"
- "Vuoi che ti spieghi meglio qualche passaggio?"

# ESEMPI DI RISPOSTE

## Esempio 1: Domanda Tecnica
User: "Come faccio a scansionare più documenti insieme?"

AI: "Attualmente Alloggify supporta la scansione di un documento alla volta per garantire massima accuratezza OCR.

Per processare più ospiti:
1. Scansiona il primo documento
2. Verifica i dati estratti
3. Clicca "Esporta per Estensione"
4. Vai su Alloggiati Web e compila
5. Torna su Alloggify per il prossimo ospite

💡 Tip: Se hai molti check-in, tieni aperte due schede:
- Tab 1: Alloggify (scansione)
- Tab 2: Alloggiati Web (invio)
E alterna tra le due.

📅 Roadmap: La funzione "Batch Processing" (scansione multipla) è prevista per Q2 2026!

Posso aiutarti a ottimizzare il workflow in altro modo?"

## Esempio 2: Domanda Normativa
User: "Un ospite ha solo la patente, va bene?"

AI: "⚠️ Attenzione: La patente da sola NON è sufficiente per Alloggiati Web.

📋 Documenti validi per check-in:
✅ Carta d'identità
✅ Passaporto
✅ Carta d'identità elettronica (CIE)

❌ Patente: Solo come documento secondario, MA serve anche:
   - Carta d'identità O Passaporto

💡 Cosa fare:
1. Chiedi all'ospite se ha carta d'identità o passaporto
2. Se non li ha con sé: non può fare check-in legalmente
3. Possibile soluzione emergenza (solo italiani):
   - Foto carta identità su smartphone
   - Verifica autenticità
   - Fai compilare autodichiarazione
   - Richiedi originale entro 24h

⚖️ Rischio: Comunicare con solo patente = Rischio sanzione

Hai l'ospite in struttura adesso e serve aiuto urgente?"

## Esempio 3: Consiglio Best Practice
User: "Come miglioro la customer experience al check-in?"

AI: "Ottima domanda! Il check-in è il primo touchpoint, ecco come renderlo wow ✨

🎯 Pre-Check-in (2 giorni prima)
📧 Invia email con:
- Link per upload documento (puoi usare Google Forms + Alloggify)
- Orari check-in/check-out
- Info WiFi, parcheggio, accesso
- Mappa della zona
→ Ospite arriva preparato, tu hai già i dati

⚡ Check-in Veloce (< 5 minuti)
- Dati già pre-compilati su Alloggiati Web
- Solo verifica e firma
- Consegna chiavi subito
→ Meno code, più tempo per accoglienza

🎁 Welcome Touch
- Welcome drink o snack
- Mappa personalizzata con ristoranti consigliati
- Biglietto di benvenuto scritto a mano
→ Recensioni 5 stelle garantite!

📊 Con Alloggify:
Prima: 15-20 min/ospite
Dopo: 3-5 min/ospite
Tempo risparmiato = più attenzione all'ospite

Vuoi altri consigli specifici per il tuo tipo di struttura?"

# CONTEXT AWARENESS
- Ricorda la conversazione precedente nella sessione
- Fai riferimento a risposte date prima
- Se l'utente chiede chiarimenti, espandi la risposta precedente

# OUTPUT FORMAT
- Usa Markdown per formattazione
- Bold (**) per concetti importanti
- Liste puntate per chiarezza
- Emoji per visual cues
- Separa paragrafi per leggibilità

# AGGIORNAMENTI
- Se la normativa cambia, il prompt verrà aggiornato
- Versione prompt: 1.0 (Novembre 2025)
```

---

## 🔧 Implementazione Tecnica

### Frontend Component

**File**: `src/components/AIChatWidget.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Come compilo il campo cittadinanza?",
    "Normativa per minori",
    "Documenti extra-UE accettati",
    "Quanto tempo ho per comunicare?"
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-50"
          aria-label="Apri chat assistente"
        >
          <MessageCircle className="w-6 h-6 mx-auto" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Assistente Alloggify</h3>
                <p className="text-xs opacity-90">Esperto in hospitality</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-4">👋 Ciao! Sono qui per aiutarti.</p>
                <p className="text-sm mb-4">Domande frequenti:</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Scrivi un messaggio..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
```

### Backend Endpoint

**File**: `server/routes/ai-chat.js`

```javascript
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `[Il prompt completo sopra]`;

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user.id; // Da JWT middleware

    // Log usage for analytics
    await logChatUsage(userId);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    res.json({
      response: response.content[0].text,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      error: 'Errore nella chat AI',
      fallback: 'Mi dispiace, sto avendo problemi tecnici. Prova a ricaricare la pagina o contatta support@alloggify.com'
    });
  }
});

async function logChatUsage(userId) {
  // Log to database for analytics
  // Track: user_id, timestamp, tokens_used
}

module.exports = router;
```

---

## 💰 Costi Stimati

### Con Claude 3.5 Sonnet

**Pricing**:
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**Conversazione media**:
- User message: ~50 tokens
- AI response: ~300 tokens
- Totale: ~350 tokens/messaggio

**Costi**:
- 1 messaggio: $0.0052
- 100 messaggi: $0.52
- 1000 messaggi: $5.20

**Per utente mensile** (stima: 20 messaggi/mese):
- Costo: $0.10/utente/mese

**Con 500 utenti attivi**:
- Costo mensile: $50
- Margine: Assorbibile nel piano Basic (€19/mese)

---

## 🎯 Roadmap Feature

### Fase 1: MVP (2 settimane)
- [ ] Setup Anthropic API
- [ ] Creare AIChatWidget component
- [ ] Backend endpoint /api/ai/chat
- [ ] System prompt versione 1.0
- [ ] Testing con 10 domande tipo
- [ ] Integrazione in dashboard

### Fase 2: Enhancement (1 mese)
- [ ] Feedback system (thumbs up/down)
- [ ] Analytics: domande più frequenti
- [ ] Suggested questions dinamiche
- [ ] Cronologia conversazioni salvata
- [ ] Export chat in PDF

### Fase 3: Advanced (3 mesi)
- [ ] Upload documenti per analisi
- [ ] Voice input
- [ ] Multilingua (EN, FR, DE)
- [ ] Training personalizzato per struttura
- [ ] Integration con knowledge base

---

## 📊 Success Metrics

- **Adoption Rate**: % utenti che usano chat almeno 1 volta/mese
- **Target**: 60%+

- **Avg Messages/User**: Media messaggi per utente
- **Target**: 5-10 msg/mese

- **Resolution Rate**: % domande risolte senza supporto umano
- **Target**: 80%+

- **CSAT**: Customer Satisfaction sulla chat
- **Target**: 4.5/5

---

Questa feature posiziona Alloggify come **l'unico SaaS nel settore con AI assistant integrato** 🚀

Vuoi che aggiungo questa sezione al TODO.md e poi iniziamo a implementarla?
