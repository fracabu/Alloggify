export interface NewsArticle {
    id: number;
    slug: string;
    title: string;
    date: string;
    category: 'Annuncio' | 'Tutorial' | 'Aggiornamento' | 'Storia';
    excerpt: string;
    content: string;
    author: string;
    readTime: string;
}

export const newsArticles: NewsArticle[] = [
    {
        id: 2,
        slug: 'calcolatore-tassa-soggiorno-beta',
        title: 'In arrivo: Calcolatore Tassa di Soggiorno automatico',
        date: '2025-11-21',
        category: 'Aggiornamento',
        excerpt: 'Stiamo testando in beta il calcolatore automatico della tassa di soggiorno. Presto disponibile per tutti gli utenti CheckInly.',
        author: 'Team CheckInly',
        readTime: '2 min',
        content: `
# In arrivo: Calcolatore Tassa di Soggiorno automatico

**21 Novembre 2025** • *Aggiornamento*

---

## Una nuova feature richiesta da voi

Dopo il lancio di CheckInly, molti host ci hanno chiesto: **"Perché non aggiungete anche il calcolo della tassa di soggiorno?"**

Ci siamo messi al lavoro. E ora siamo in **fase di beta testing**.

---

## Cosa farà il Calcolatore?

Il calcolatore automatico della tassa di soggiorno:

- ✅ **Calcola automaticamente** l'importo da pagare per ogni ospite
- ✅ **Applica le regole del tuo Comune** (tariffe variabili, esenzioni, massimali)
- ✅ **Gestisce esenzioni automatiche** (bambini sotto X anni, permanenze oltre Y giorni)
- ✅ **Si integra con CheckInly** (dai dati ospiti → calcolo immediato)
- ✅ **Genera report** per la rendicontazione al Comune

---

## Perché serve?

La tassa di soggiorno è **obbligatoria** in moltissimi Comuni italiani.

Ma ogni Comune ha:
- **Tariffe diverse** (€1/notte a Roma, €5/notte a Venezia, €3/notte a Firenze...)
- **Regole diverse** (bambini sotto 10 anni esenti, o sotto 14 anni, o sotto 16...)
- **Massimali diversi** (max 5 notti, max 7 notti, max 10 notti...)

**Risultato:** Un casino. Gli host sbagliano spesso.

---

## Come funzionerà?

1. **Configura il tuo Comune**
   - Seleziona il Comune (es. "Roma")
   - Il sistema carica automaticamente le regole ufficiali

2. **Inserisci gli ospiti**
   - Usa CheckInly per scansionare i documenti (come già fai)
   - Il sistema rileva automaticamente età e durata soggiorno

3. **Calcolo automatico**
   - CheckInly calcola l'importo dovuto
   - Applica esenzioni e massimali
   - Mostra il totale da riscuotere

4. **Report per il Comune**
   - Esporta report mensile/trimestrale
   - Formato compatibile con portali comunali
   - Pronto per la rendicontazione

---

## Quando sarà disponibile?

**Stiamo testando con host beta tester.**

Se vuoi essere tra i primi a provarlo, scrivici: **support@checkinly.com**

Prevediamo il rilascio pubblico entro **Gennaio 2026**.

---

## Sarà incluso nel piano?

**Sì!** Il calcolatore tassa di soggiorno sarà:
- ✅ **Incluso nel piano Free** (5 scansioni = 5 calcoli)
- ✅ **Incluso nel piano Basic** (100 scansioni = 100 calcoli)
- ✅ **Incluso nel piano Pro** (500 scansioni = 500 calcoli)

Nessun costo aggiuntivo. Nessuna sorpresa.

---

## Vuoi essere beta tester?

Se gestisci una struttura in un Comune con tassa di soggiorno e vuoi testare la feature in anteprima, **scrivici ora**:

**📧 support@checkinly.com**

Oggetto: "Beta Tester - Tassa Soggiorno"

Ti risponderemo entro 24 ore.

---

*Stay tuned!*

— Team CheckInly
`
    },
    {
        id: 1,
        slug: 'come-nasce-checkinly',
        title: 'Come nasce CheckInly: da host frustrato a founder',
        date: '2025-11-21',
        category: 'Storia',
        excerpt: 'La storia vera dietro CheckInly: un host-developer stufo di perdere 20 minuti per ogni check-in. Dalla frustrazione alla soluzione.',
        author: 'Fondatore CheckInly',
        readTime: '5 min',
        content: `
# Come nasce CheckInly: da host frustrato a founder

**21 Novembre 2025** • *Storia*

---

## Il problema: 20 minuti di inferno per ogni ospite

Gestisco un appartamento su Booking. Sono anche un developer. Mi piace farmi le cose da solo, per passione e principio.

Ma c'era un problema che mi faceva impazzire: **Alloggiati Web**.

Ogni volta che arrivava un ospite, iniziava il calvario:

1. **Accedi al portale Alloggiati Web**
   - Username (ok, ce l'ho)
   - Password (ok, ce l'ho)
   - **Doppio codice numerico su un altro file** (cosa? Dove l'ho messo?)

2. **Prendi il telefono**
   - L'ospite ti manda la foto del documento su WhatsApp
   - Apri l'immagine sullo smartphone
   - Zoom, ruota, cerca di leggere

3. **Inizia a digitare 14 campi**
   - Cognome... Nome... Data di nascita... Luogo di nascita...
   - Cittadinanza... Tipo documento... Numero documento...
   - Rilasciato da... Data rilascio... Data scadenza...
   - Indirizzo... Città... CAP... Provincia...

4. **Prega di non aver fatto errori**
   - Perché se sbagli, la schedina viene rifiutata
   - E devi rifare tutto da capo

**Tempo totale: 20 minuti. PER OGNI OSPITE.**

![Il calvario di Alloggiati Web](/news/img1-news.png)

---

## La svolta: "Lo faccio io"

A un certo punto ho detto basta.

Sono un developer. Posso automatizzare questa roba.

**Idea:** un'estensione Chrome che compila automaticamente il form.

### Versione 1: Chrome Extension

Ho costruito un'estensione Chrome in 2 settimane:
- Carica foto documento
- Estrai dati con OCR
- Auto-compila il form di Alloggiati Web

**Funzionava! Ma aveva un problema: era instabile.**

Il form del portale cambiava spesso ID e selettori. L'estensione si rompeva ogni mese.

Non era una soluzione professionale.

![La prima versione: Chrome Extension per auto-compilare Alloggiati Web](/news/img3-news.png)

---

## La rivelazione: esiste un'API ufficiale!

Poi ho scoperto che **Alloggiati Web ha un'API ufficiale**: la **WSKEY**.

Tecnologia **SOAP** (sì, vecchia, ma funziona).

Con la WSKEY puoi:
- Autenticarti una volta
- Inviare schedine via API
- Ricevere conferma ufficiale dalla Questura
- **Zero rischio che si rompa**

Ho rifatto tutto da zero.

### Versione 2: WSKEY + Google Gemini AI

- **OCR con Gemini 2.5 Flash** (il miglior modello AI disponibile)
- **Invio diretto via SOAP API** (nessun browser, nessun copia-incolla)
- **Da foto a schedina inviata in 30 secondi**

Funzionava alla perfezione. Da 20 minuti a 30 secondi.

![CheckInly in azione: dalla foto alla schedina inviata](/news/img2-news.png)

---

## E ora? Lancio sul mercato

Mi sono chiesto: "Se io ho questo problema, quanti altri host lo hanno?"

Ho fatto ricerca. I competitor esistono, ma:
- **MyMaison**: €10/mese PER PROPRIETÀ (con 5 proprietà = €50/mese!)
- **Lodgify**: €33-49/mese + OCR assente (inserimento manuale)
- **Wiisy**: €3.99/mese MA OCR base (non AI)

**CheckInly è diverso:**
- ✅ **OCR Google Gemini AI** (precisione 99%, meglio di tutti)
- ✅ **Multi-proprietà INCLUSO** (€15/mese per illimitate proprietà)
- ✅ **Piano Free permanente** (5 scansioni/mese gratis, per sempre)
- ✅ **Tecnologia SOAP ufficiale** (affidabilità garantita)

![CheckInly pronto per il lancio sul mercato](/news/img4-news.png)

---

## Perché lo condivido?

Potrei tenermelo per me. Ma non è nel mio stile.

Ho costruito CheckInly per **risolvere un problema reale**.

Se tu hai lo stesso problema, voglio che tu possa risolverlo.

**Feedback diretto con il founder** (sono io).
**Feature richieste implementate rapidamente** (piccolo team = decisioni veloci).
**Prezzo bloccato per early adopters** (ti iscrivi oggi? Il tuo prezzo non aumenta mai).

---

## Provalo. È gratis.

5 scansioni/mese gratis. Per sempre.
Nessuna carta richiesta.
Attivo in 30 secondi.

**[Inizia Gratis →](/signup)**

---

*Hai domande? Scrivimi: support@checkinly.com*
*Sono sempre disponibile a parlare con chi usa il prodotto.*

— Fondatore CheckInly
Un host come te, non una software house.
`
    }
];
