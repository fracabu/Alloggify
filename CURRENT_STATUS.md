# CheckInly - Stato Attuale e Prossimi Passi

**Data aggiornamento**: 2025-11-22 (Sera)
**Versione**: 1.1

---

## ✅ AGGIORNAMENTI COMPLETATI OGGI

### 1. Fix Critici Implementati ✅
- ✅ **JWT Auth su `/api/alloggiati`** - Endpoint SOAP protetto con `requireAuth()`
- ✅ **Scan counter spostato** - Ora incrementa su invio schedina (non più su OCR)
- ✅ **Terminologia aggiornata** - "Scansioni" → "Invii" in tutta l'app
- ✅ **Calcolatore tassa soggiorno** - Integrato nel dashboard (link esterno)
- ✅ **Email benvenuto personalizzata** - Prezzi corretti + branding CheckInly

### 2. Documentazione Aggiornata ✅
- ✅ `DEVELOPMENT_WORKFLOW.md` - Nuovo piano per allineamento local/production
- ✅ `COMPETITOR_ANALYSIS.md` - Analisi competitor con pricing comparison
- ✅ Prezzi allineati: Free €0/10 invii, Basic €19, Pro €49
- ✅ `CLAUDE.md` - Documentazione tecnica completa

---

## 🚨 NUOVO PROBLEMA CRITICO RILEVATO

### Disallineamento Local/Production

**Problema**: Sviluppo locale (Express) NON allineato con production (Vercel)

**Features mancanti in locale**:
- ❌ JWT Auth su `/api/alloggiati`
- ❌ Scan counter increment su Send
- ❌ Password reset endpoints (forgot/reset)
- ❌ Google OAuth
- ❌ Stripe webhook handler

**Impatto**:
- 🚨 Testing locale inaffidabile
- 🚨 Bug non rilevabili prima del deploy
- 🚨 Doppia manutenzione (Express + Vercel)

**Soluzione Raccomandata**:
Passare a `vercel dev` (vedi `DEVELOPMENT_WORKFLOW.md`)

**Priorità**: 🔴 **P0 - DA RISOLVERE PRIMA DI CONTINUARE**

---

## 📊 STATO GENERALE PROGETTO

**Completamento**: **~85%** 🟡

### ✅ Cosa Funziona (Production-Ready)

1. **Autenticazione Completa**
   - ✅ Registrazione + verifica email (Aruba SMTP)
   - ✅ Login/Logout con JWT (7 giorni access, 30 giorni refresh)
   - ✅ Password reset flow (forgot + reset)
   - ✅ Google OAuth (init + callback)
   - ✅ Protected routes

2. **OCR AI-Powered Protetto** ✅
   - ✅ Gemini 2.5 Flash per estrazione dati
   - ✅ Autenticazione JWT richiesta
   - ✅ Check limiti mensili automatici
   - ✅ Logging scansioni nel database
   - ✅ Scan counter corretto (incrementa su Send, non su OCR)

3. **SOAP API Integration** ✅
   - ✅ Endpoint `/api/alloggiati` protetto con JWT
   - ✅ Actions: auth, test, send, ricevuta, tabelle
   - ✅ Scan counter incrementato SOLO su send success
   - ✅ User tracking per ogni invio

4. **Stripe Integration Completa** ✅
   - ✅ Checkout session creation
   - ✅ Webhook handler (4 eventi gestiti)
   - ✅ Auto-upgrade/downgrade
   - ✅ Reset scan_count su pagamento
   - ⚠️ Price IDs ancora placeholder (da configurare in Stripe Dashboard)

5. **Database PostgreSQL (Neon)** ✅
   - ✅ 4 tabelle: users, scans, subscriptions, usage_logs
   - ✅ Schema completo e ottimizzato
   - ✅ User isolation e multi-tenancy

6. **Frontend React** ✅
   - ✅ Landing page con pricing
   - ✅ Login/Signup flow
   - ✅ Dashboard con OCR
   - ✅ Chrome Extension (Manifest V3)
   - ✅ SOAP API integration
   - ✅ Calcolatore Tassa Soggiorno integrato
   - ✅ Terminologia "invii" invece di "scansioni"

---

## 🔴 PRIORITÀ CRITICHE

### 1. Allineamento Local/Production 🚨
**Status**: 🔴 **NON RISOLTO**
**Blocco**: Sviluppo locale inaffidabile
**Soluzione**: Passare a `vercel dev` (30 min setup)
**Documento**: `DEVELOPMENT_WORKFLOW.md`

### 2. Setup Stripe Prodotti
**Status**: ⚠️ **PARZIALE**
**Problema**: Price IDs sono placeholder (`price_xxx`)
**Fix richiesto**:
1. Creare prodotti in Stripe Dashboard
2. Configurare Price IDs reali in `.env.local`
3. Testare checkout in Test Mode

### 3. Receipts Storage (Nuova Feature)
**Status**: 🟡 **PIANIFICATA**
**Problema**: MyMaison competitor ha storage ricevute, noi no
**Gap competitivo**: Medio-Alto
**Implementazione**: Vedi `DEVELOPMENT_WORKFLOW.md` Fase 3
**Stima**: 1-2 giorni

### 4. Limiti Vercel Functions
**Status**: ⚠️ **12/12 FUNCTIONS USATE**
**Problema**: Nessuno spazio per nuove features senza consolidamento
**Soluzione**: Refactoring mega-routes (12 → 5 functions)
**Stima**: 2-3 giorni

---

## 📋 TODO LIST AGGIORNATA

### 🔴 **P0 - BLOCKERS** (Da fare PRIMA di tutto)

1. ❌ **Allineamento Local/Production**
   - Setup `vercel dev` workflow
   - Deprecare Express server
   - Testing completo in locale
   - **Tempo**: 30 min setup + 2h testing

### 🟠 **P1 - CRITICI** (Questa settimana)

2. ❌ **Setup Stripe prodotti reali**
   - Creare Basic (€19/mese) e Pro (€49/mese) in Stripe
   - Configurare Price IDs
   - Testare checkout
   - **Tempo**: 2-3 ore

3. ❌ **Implementare bottone Upgrade nel dashboard**
   - CTA quando utente vicino a limite
   - Link a `/upgrade` page
   - **Tempo**: 2-3 ore

4. ❌ **Stripe Customer Portal**
   - Endpoint `/api/stripe/create-portal-session`
   - Link "Gestisci Abbonamento" nel dashboard
   - **Tempo**: 2-3 ore

### 🟡 **P2 - IMPORTANTI** (Prossime 2 settimane)

5. ❌ **Receipts Storage Implementation**
   - Tabella `receipts` in database
   - Salvataggio automatico dopo invio schedina
   - Dashboard "Le Mie Ricevute" con filtri
   - Download singolo/bulk (ZIP)
   - **Tempo**: 1-2 giorni

6. ❌ **Refactoring Functions (12 → 5)**
   - Consolidare `/api/auth/*` → `/api/auth.ts`
   - Creare `/api/user.ts` (profile, receipts, subscription)
   - Merge `/api/stripe/*` → `/api/stripe.ts`
   - **Tempo**: 2-3 giorni

7. ❌ **User Dashboard API endpoints**
   - `GET /api/user?resource=profile`
   - `GET /api/user?resource=receipts`
   - `GET /api/user?resource=subscription`
   - `GET /api/user?resource=scans`
   - **Tempo**: 1 giorno (dopo refactoring)

8. ❌ **Cron job reset mensile**
   - Vercel Cron Jobs (`vercel.json`)
   - Reset `scan_count = 0` ogni 1° del mese
   - Email notifica reset
   - **Tempo**: 3-4 ore

### 🟢 **P3 - NICE-TO-HAVE** (Lungo termine)

9. ❌ **Testing E2E completo**
   - Playwright/Cypress setup
   - Flow: registrazione → upgrade → OCR → limite
   - **Tempo**: 2-3 giorni

10. ❌ **Rate Limiting**
    - Upstash Redis integration
    - Limiti per IP/user
    - **Tempo**: 1 giorno

11. ❌ **Analytics & Monitoring**
    - Sentry error tracking
    - Dashboard metriche business
    - **Tempo**: 2-3 giorni

---

## 🎯 ROADMAP PROSSIME SETTIMANE

### **Settimana 1: Allineamento + Stripe Setup**
**Goal**: Development environment affidabile + Payments funzionanti

**Giorni 1-2**:
- ✅ Setup `vercel dev` (30 min)
- ✅ Testing completo locale (2h)
- ✅ Deprecare Express (1h)

**Giorni 3-4**:
- ✅ Setup Stripe prodotti (3h)
- ✅ Implementare bottone Upgrade (3h)
- ✅ Stripe Customer Portal (3h)

**Giorni 5**:
- ✅ Testing E2E payments
- ✅ Deploy to production

**Deliverable**: ✅ MVP SaaS con payments funzionanti

---

### **Settimana 2: Receipts Storage + Refactoring**
**Goal**: Feature parity con MyMaison competitor + Codebase pulita

**Giorni 1-2**:
- ✅ Implementare receipts storage (backend + frontend)
- ✅ Testing download/bulk

**Giorni 3-5**:
- ✅ Refactoring 12 functions → 5 mega-routes
- ✅ Update frontend API calls
- ✅ Testing completo

**Deliverable**: ✅ Feature complete + Architettura scalabile

---

### **Settimana 3: Automazione + Polish**
**Goal**: Production-ready ottimizzato

**Tasks**:
- ✅ Cron job reset mensile
- ✅ User Dashboard API
- ✅ Rate limiting (opzionale)
- ✅ Analytics setup (opzionale)

**Deliverable**: ✅ Sistema pronto per lancio pubblico

---

## 💡 DECISIONI ARCHITETTURALI

### Development Workflow
**Decisione**: ✅ Passare a `vercel dev`
**Rationale**:
- Industry best practice
- 100% parità local/production
- Zero manutenzione doppia
- Testing affidabile

**Alternative scartate**:
- ❌ Sincronizzare Express (doppio lavoro)
- ❌ Mantenere disallineamento (rischio bug)

### Functions Consolidation
**Decisione**: ✅ Refactoring 12 → 5 mega-routes
**Rationale**:
- Free tier Vercel: 12 functions limit
- Receipts storage: +3 functions necessarie
- Mega-routes: più organizzate e scalabili

**Target Architecture**:
```
api/
├── auth.ts         (login, register, verify, forgot, reset, google)
├── user.ts         (profile, receipts, subscription, scans)
├── alloggiati.ts   (auth, test, send, ricevuta, tabelle)
├── stripe.ts       (checkout, portal)
└── webhooks.ts     (stripe webhook)
```

### Pricing Strategy
**Decisione**: ✅ Attendere analisi competitor prima di finalizzare
**Opzioni valutate**:
- Opzione 1: €19/50 invii, €99/500, €399/∞
- Opzione 2: €19/150 invii, €49/∞ prop, €99/storage
- **PENDING**: Decisione finale dopo review competitor analysis

---

## 💰 BUSINESS METRICS (Updated)

### Competitor Positioning

| Competitor | Modello Pricing | Per 5 proprietà |
|------------|-----------------|-----------------|
| **Wiisy** | €3.99/proprietà | €20/mese |
| **MyMaison** | €10/proprietà | €50/mese |
| **Lodgify** | €13-49/proprietà | €65-245/mese |
| **CheckInly** | Flat fee | €19-49/mese ✅ |

**Vantaggio Competitivo**: Multi-proprietà incluso = 2-10x più economico

### Margini Previsti (Invariati)

| Utenti | Revenue/Mese | Costi/Mese | Margine |
|--------|--------------|------------|---------|
| 100    | €5,400       | €50        | **99.1%** |
| 1,000  | €54,000      | €500       | **99.1%** |
| 10,000 | €540,000     | €5,000     | **99.1%** |

---

## 📚 DOCUMENTAZIONE AGGIORNATA

**Nuovi documenti**:
- ✅ `DEVELOPMENT_WORKFLOW.md` - Piano allineamento local/production
- ✅ `COMPETITOR_ANALYSIS.md` - Analisi mercato dettagliata

**Documenti esistenti**:
- `CLAUDE.md` - Guida tecnica completa
- `SAAS_PLAN.md` - Business plan dettagliato
- `SAAS_STATUS.md` - Valutazione architettura
- `IMPLEMENTATION_SUMMARY.md` - Lavoro completato
- `STRIPE_SETUP.md` - Guida Stripe
- `TODO.md` - Task list
- `CURRENT_STATUS.md` - Questo documento

---

## 🚀 READY FOR LAUNCH?

**Risposta**: 🟡 **QUASI** - Mancano 3 blockers critici

### Blockers per Go-Live:
1. 🔴 **Allineamento local/production** - Setup `vercel dev`
2. 🟠 **Setup Stripe prodotti** - Price IDs reali
3. 🟠 **Bottone Upgrade funzionante** - CTA nel dashboard

### Nice-to-Have (non blockers):
4. 🟡 Receipts storage (gap vs MyMaison)
5. 🟡 Customer Portal (self-service)
6. 🟡 Cron job reset mensile

**Tempo stimato per MVP launch**: **2-3 giorni lavorativi**

---

## 📞 PROSSIMI PASSI IMMEDIATI

### Oggi (Sera):
1. ✅ Leggere `DEVELOPMENT_WORKFLOW.md`
2. ❌ Decidere: Opzione A (vercel dev) o B (Express sync)?
3. ❌ Se Opzione A: Setup `vercel dev` (30 min)

### Domani:
1. ❌ Setup Stripe prodotti (2-3 ore)
2. ❌ Implementare bottone Upgrade (2-3 ore)
3. ❌ Testing completo checkout flow

### Questa Settimana:
1. ❌ Customer Portal (2-3 ore)
2. ❌ Receipts storage planning/start
3. ❌ Deploy aggiornamenti a production

---

## 🎓 LEZIONI APPRESE

### Cosa Ha Funzionato ✅
- Architettura serverless Vercel + Neon = Perfetta per SaaS
- JWT auth + protected endpoints = Sicurezza solida
- Stripe webhooks = Payments automation impeccabile
- Documentazione MD = Chiarezza e tracking efficace

### Cosa Migliorare ⚠️
- ❌ Mantenere Express + Vercel in parallelo = Tech debt
- ❌ Non usare `vercel dev` da subito = Disallineamento
- ❌ Free tier functions limit = Richiede planning architetturale

### Best Practices Adottate ✅
- ✅ Environment variables via Vercel
- ✅ Database migrations documentate
- ✅ API endpoint consolidation (action-based routing)
- ✅ Comprehensive documentation (CLAUDE.md, etc.)

---

**Ultimo aggiornamento**: 2025-11-22 (Sera)
**Prossima review**: Dopo setup `vercel dev` (domani)
**Status**: 🚨 **ACTION REQUIRED** - Risolvere allineamento local/production
