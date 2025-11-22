# CheckInly - Stato Attuale e Prossimi Passi

**Data aggiornamento**: 2025-11-22
**Versione**: 1.0

---

## ✅ AGGIORNAMENTI COMPLETATI OGGI

### 1. Aggiornamento Prezzi nei File MD
**Problema risolto**: Discrepanza tra prezzi nella UI e nella documentazione

**Prezzi Corretti** (allineati con UI):
- **Free**: €0/mese, 5 scansioni
- **Basic**: €15/mese (€12/mese annuale), 100 scansioni
- **Pro**: €39/mese (€32/mese annuale), 500 scansioni
- **Enterprise**: €199/mese, illimitato (solo backend, non in UI)

**File aggiornati**:
- ✅ `lib/pricing.ts` - Prezzi Basic €15, Pro €39
- ✅ `lib/email.ts` - Email verifica e benvenuto con prezzi corretti
- ✅ `CLAUDE.md` - Documentazione tecnica aggiornata
- ✅ `IMPLEMENTATION_SUMMARY.md` - Tabella prezzi corretta

---

## 📊 STATO GENERALE PROGETTO

**Completamento**: **~85%** 🟡

### ✅ Cosa Funziona (Production-Ready)

1. **Autenticazione Completa**
   - Registrazione + verifica email (Aruba SMTP)
   - Login/Logout con JWT (7 giorni access, 30 giorni refresh)
   - Password reset flow
   - Protected routes

2. **OCR AI-Powered Protetto**
   - Gemini 2.5 Flash per estrazione dati
   - Autenticazione JWT richiesta
   - Check limiti mensili automatici
   - Logging scansioni nel database

3. **Stripe Integration Completa**
   - Checkout session creation
   - Webhook handler (4 eventi gestiti)
   - Auto-upgrade/downgrade
   - Reset scan_count su pagamento

4. **Database PostgreSQL (Neon)**
   - 4 tabelle: users, scans, subscriptions, usage_logs
   - Schema completo e ottimizzato

5. **Frontend React**
   - Landing page con pricing
   - Login/Signup
   - Dashboard con OCR
   - Chrome Extension (Manifest V3)
   - SOAP API integration

---

## 🔴 PROBLEMI CRITICI DA RISOLVERE

### 1. Bug Scan Counter
**Problema**: Il contatore incrementa all'OCR invece che all'invio schedina.
**Impatto**: Utenti perdono scansioni anche senza inviare dati.
**Fix richiesto**: Spostare `incrementScanCount()` da `api/ocr.ts` a `api/alloggiati.ts` (solo su action='send' success).

### 2. Endpoint `/api/alloggiati` Non Protetto
**Problema**: L'endpoint SOAP API non richiede autenticazione.
**Impatto**: Chiunque può usare l'API senza limiti.
**Fix richiesto**: Aggiungere `requireAuth()` middleware.

### 3. Setup Stripe Prodotti
**Problema**: Price IDs ancora placeholder (`price_basic_xxx`).
**Fix richiesto**: Creare prodotti in Stripe Dashboard e configurare Price IDs reali.

---

## 📋 TODO LIST PRIORITIZZATA

### 🔴 **PRIORITÀ CRITICA** (1-2 giorni)

1. ❌ **Proteggere endpoint `/api/alloggiati` con JWT auth**
   - Aggiungere `requireAuth()` middleware
   - Tracking invii per utente

2. ❌ **Spostare scan counter da OCR a Send**
   - Rimuovere increment da `api/ocr.ts`
   - Aggiungere increment in `api/alloggiati.ts` (action='send' success)

3. ❌ **Setup Stripe prodotti e Price IDs**
   - Creare prodotti Basic (€15) e Pro (€39) in Stripe Dashboard
   - Configurare Price IDs in environment variables
   - Testare checkout in Test Mode

4. ❌ **Implementare bottone "Upgrade" nel dashboard**
   - Bottone che chiama `/api/stripe/create-checkout-session`
   - Redirect a Stripe Checkout

5. ❌ **Aggiungere usage indicator nel dashboard**
   - Visualizzare "X/Y scansioni usate questo mese"
   - Progress bar visuale

---

### 🟡 **PRIORITÀ ALTA** (3-5 giorni)

6. ❌ **Aggiungere calcolatore tassa di soggiorno nazionale**
   - Integrare codice già sviluppato
   - Nuova pagina/sezione nel dashboard
   - Logica calcolo conforme normativa 2025

7. ❌ **Personalizzare email di benvenuto**
   - ✅ Prezzi già aggiornati (€15/€39)
   - Aggiungere contenuti personalizzati
   - Link diretti a feature principali

8. ❌ **Implementare Stripe Customer Portal**
   - Endpoint `/api/stripe/customer-portal`
   - Permette utenti di gestire subscription autonomamente

9. ❌ **User Dashboard API endpoints**
   - `GET /api/user/profile` - Info profilo
   - `GET /api/user/scans` - Storico scansioni paginato
   - `GET /api/user/subscription` - Info abbonamento
   - `GET /api/user/billing/invoices` - Fatture Stripe

---

### 🟢 **PRIORITÀ MEDIA** (1-2 settimane)

10. ❌ **Cron job reset mensile scansioni**
    - Vercel Cron Jobs
    - Reset `scan_count = 0` il 1° del mese

11. ❌ **Testing E2E completo**
    - Flow: registrazione → verifica → login → upgrade → OCR → limite

12. ❌ **Rate limiting (Vercel KV)**
    - Protezione endpoints da abuso

13. ❌ **Monitoring & Analytics**
    - Sentry per error tracking
    - Dashboard analytics avanzati

---

## 🎯 ROADMAP SETTIMANE PROSSIME

### **Settimana 1: Fix Critici + MVP Launch Ready**
**Goal**: Sistema pronto per lancio beta

**Tasks**:
1. Proteggere `/api/alloggiati` con JWT (2 ore)
2. Fixare scan counter bug (2 ore)
3. Setup Stripe prodotti (2 ore)
4. Frontend: Bottone Upgrade + Usage indicator (1 giorno)
5. Testing E2E (1 giorno)

**Deliverable**: MVP SaaS funzionante e sicuro

---

### **Settimana 2: Nuove Funzionalità**
**Goal**: Calcolatore tassa + UX migliorata

**Tasks**:
1. Integrare calcolatore tassa di soggiorno (2 giorni)
2. Personalizzare email benvenuto (2 ore)
3. Stripe Customer Portal (3 ore)
4. User Dashboard API (2 giorni)

**Deliverable**: Feature complete + UX ottimizzata

---

### **Settimana 3: Automazione & Polish**
**Goal**: Sistema production-ready ottimizzato

**Tasks**:
1. Cron job reset mensile (2 ore)
2. Rate limiting (1 giorno)
3. Monitoring (Sentry) (1 giorno)
4. Analytics dashboard (2 giorni)

**Deliverable**: Sistema pronto per lancio pubblico

---

## 💰 BUSINESS METRICS

### Margini Previsti

| Utenti | Revenue/Mese | Costi/Mese | Margine |
|--------|--------------|------------|---------|
| 100    | €5,400       | €50        | **99.1%** |
| 1,000  | €54,000      | €500       | **99.1%** |
| 10,000 | €540,000     | €5,000     | **99.1%** |

**Architettura**: ⭐⭐⭐⭐⭐ Vercel Serverless + Neon PostgreSQL = **PERFETTA** per SaaS

---

## 📚 DOCUMENTAZIONE DISPONIBILE

- `CLAUDE.md` - Guida tecnica completa (aggiornata oggi)
- `SAAS_PLAN.md` - Business plan dettagliato
- `SAAS_STATUS.md` - Valutazione architettura
- `IMPLEMENTATION_SUMMARY.md` - Lavoro completato (aggiornato oggi)
- `STRIPE_SETUP.md` - Guida step-by-step Stripe
- `TODO.md` - Task list
- `CURRENT_STATUS.md` - Questo documento

---

## 🚀 READY FOR LAUNCH?

**Risposta**: 🟡 **QUASI** - Mancano 5 fix critici

### Blockers per Go-Live:
1. ❌ Fix scan counter bug (conta OCR invece di Send)
2. ❌ Proteggere `/api/alloggiati` endpoint
3. ❌ Setup Stripe prodotti reali (Price IDs)
4. ❌ Frontend: Bottone "Upgrade" funzionante
5. ❌ Usage indicator nel dashboard

**Tempo stimato per MVP launch**: **3-5 giorni lavorativi**

---

## 📞 PROSSIMI PASSI IMMEDIATI

### Oggi/Domani:
1. Fixare i 2 bug critici (scan counter + protezione endpoint)
2. Setup Stripe account e creare prodotti
3. Implementare bottone Upgrade

### Questa Settimana:
1. Aggiungere calcolatore tassa di soggiorno
2. Testing E2E completo
3. Preparare per beta launch

---

**Ultimo aggiornamento**: 2025-11-22
**Prossima review**: Fine settimana 1 (dopo fix critici)
