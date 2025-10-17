# 🏠 Alloggiati Web Auto-Fill - Estensione Chrome

Estensione Chrome per compilare automaticamente i campi del **Portale Alloggiati Web** della Polizia di Stato con dati estratti da documenti tramite l'applicazione **Scan-Doc-ID**.

## 📋 Caratteristiche

- ✅ **Compilazione automatica** di tutti i campi del form Alloggiati Web
- 🔒 **Sicura**: i dati restano sul tuo computer (nessun server esterno)
- 🎯 **Facile da usare**: un solo click per compilare il form
- 🌍 **Supporto multi-lingua**: funziona con documenti internazionali
- 💾 **Salvataggio temporaneo**: i dati vengono salvati finché non vengono usati

## 🚀 Installazione

### 1. Scarica l'estensione

L'estensione si trova nella cartella `chrome-extension` del progetto **Scan-Doc-ID**.

### 2. Carica l'estensione in Chrome

1. Apri Chrome e vai su: `chrome://extensions/`
2. Attiva la **Modalità sviluppatore** (toggle in alto a destra)
3. Clicca su **"Carica estensione non pacchettizzata"**
4. Seleziona la cartella `chrome-extension` dal progetto
5. L'estensione verrà installata e apparirà nella barra delle estensioni

### 3. (Opzionale) Fissa l'estensione

- Clicca sull'icona del puzzle 🧩 nella barra di Chrome
- Trova "Alloggiati Web Auto-Fill"
- Clicca sulla puntina 📌 per fissarla nella barra

## 📖 Come Usare

### Workflow Completo

1. **Estrai i dati dal documento**:
   - Apri **Scan-Doc-ID** (`http://localhost:8000`)
   - Carica un documento (passaporto, carta d'identità, ecc.)
   - Attendi l'elaborazione OCR
   - Verifica e correggi i dati estratti se necessario

2. **Esporta i dati per l'estensione**:
   - In Scan-Doc-ID, clicca **"Esporta per Estensione Chrome"** (pulsante viola)
   - Apparirà una notifica di conferma con le istruzioni

3. **Compila il form su Alloggiati Web**:
   - Apri una nuova scheda: `https://alloggiatiweb.poliziadistato.it`
   - Effettua il login con le tue credenziali
   - Vai alla pagina di inserimento ospite

4. **Auto-compila i campi**:
   - **OPZIONE A**: Clicca sul **pulsante floating viola** in basso a destra della pagina
   - **OPZIONE B**: Clicca sull'icona dell'estensione in alto a destra e poi su **"Compila Form"**

5. **Verifica e invia**:
   - Controlla che tutti i campi siano corretti
   - Modifica eventuali errori
   - Salva/invia il form come di consueto

## 🎯 Funzionalità

### Pulsante Floating
Quando sei su `alloggiatiweb.poliziadistato.it`, vedrai un **pulsante floating viola** in basso a destra con la scritta "Compila da Scan-Doc-ID". Cliccaci per compilare automaticamente il form.

### Popup dell'Estensione
Cliccando sull'icona dell'estensione nella barra di Chrome, vedrai:
- **Stato dei dati**: indica se ci sono dati disponibili o meno
- **Anteprima dati**: mostra un riepilogo dei dati dell'ospite corrente
- **Pulsanti**:
  - **Compila Form**: compila automaticamente la pagina Alloggiati Web
  - **Carica Dati da Scan-Doc-ID**: ricarica i dati (utile se ci sono problemi)
  - **Cancella Dati**: rimuove i dati correnti

### Campi Compilati Automaticamente

L'estensione compila i seguenti campi:
- ✅ Cognome
- ✅ Nome
- ✅ Sesso (M/F)
- ✅ Data di nascita
- ✅ Luogo di nascita
- ✅ Cittadinanza / Paese di cittadinanza
- ✅ Tipo documento (Passaporto, Carta d'Identità, ecc.)
- ✅ Numero documento
- ✅ Luogo di rilascio documento
- ✅ Data di arrivo (compilata automaticamente con la data odierna)

## 🔧 Risoluzione Problemi

### L'estensione non trova i dati
- Assicurati di aver cliccato **"Esporta per Estensione Chrome"** in Scan-Doc-ID
- Riapri il popup dell'estensione
- Prova a cliccare su **"Carica Dati da Scan-Doc-ID"**

### Il pulsante floating non appare
- Ricarica la pagina di Alloggiati Web (F5)
- Controlla di essere sulla pagina corretta: `alloggiatiweb.poliziadistato.it`
- Verifica che l'estensione sia attiva in `chrome://extensions/`

### Alcuni campi non vengono compilati
- I nomi dei campi del portale potrebbero essere cambiati
- Compila manualmente i campi mancanti
- Segnala il problema su GitHub per un aggiornamento

### L'estensione non si carica
- Verifica di aver attivato la **Modalità sviluppatore** in Chrome
- Controlla che tutti i file siano presenti nella cartella `chrome-extension`
- Ricarica l'estensione da `chrome://extensions/` (icona ↻)

## 🔒 Privacy e Sicurezza

- **Nessun dato in cloud**: tutti i dati restano sul tuo computer
- **Nessuna raccolta dati**: l'estensione non raccoglie né invia dati a server esterni
- **Storage locale**: i dati sono salvati temporaneamente nello storage di Chrome
- **Cancellazione facile**: puoi cancellare i dati in qualsiasi momento dal popup
- **Open source**: il codice è completamente visibile e verificabile

## ⚠️ Note Legali

- Questa estensione è uno **strumento di assistenza** per compilare più velocemente il form
- **L'operatore mantiene la responsabilità** di verificare i dati prima dell'invio
- **Non è un bot**: l'operatore controlla e invia manualmente i dati
- Uso conforme ai termini di servizio: l'estensione aiuta l'operatore umano, non lo sostituisce

## 📝 Licenza

Questa estensione fa parte del progetto **Scan-Doc-ID**.

## 🤝 Contributi

Segnalazioni bug e suggerimenti sono benvenuti! Apri un issue su:
[https://github.com/fracabu/scan-doc-id](https://github.com/fracabu/scan-doc-id)

## 📧 Supporto

Per domande o problemi:
- Apri un issue su GitHub
- Controlla la documentazione di Scan-Doc-ID

---

**Sviluppato per Case Vacanze e Strutture Ricettive Italiane** 🏠
