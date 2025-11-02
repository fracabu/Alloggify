# 📋 Alloggify - Roadmap Sviluppo SaaS

> Documento di tracciamento implementazione da MVP a SaaS completo
>
> **Ultima modifica**: 2 Novembre 2025
> **Status attuale**: Frontend Landing completo (25% totale)

---

## 🎯 Executive Summary

### ✅ Completato (Fase 1-7)
- Landing page completa con design system Tailwind
- Privacy Policy e Terms of Service (GDPR compliant)
- Autenticazione MOCK (Login/Signup/Dashboard)
- SEO optimization completa
- Mobile responsive
- Chrome Extension funzionante (compilazione form)
- Backend SOAP API per Alloggiati Web

### ❌ Da Completare
- **Backend database** con PostgreSQL
- **Autenticazione reale** con JWT
- **22 pagine mancanti** (auth flow, dashboard, billing)
- **Stripe integration** per pagamenti
- **Email service** per notifiche
- **Chrome Web Store** pubblicazione

**Completamento totale**: ~25%

---

## 📄 PAGINE DA CREARE

### 🔐 FASE IMMEDIATA - Authentication Flow (Priorità ALTA)

#### 1. Forgot Password Page
- **Percorso**: `/forgot-password`
- **File**: `src/pages/ForgotPasswordPage.tsx`
- **Descrizione**: Form con campo email per richiedere reset password
- **UI Components necessari**:
  - Input email con validazione
  - Button "Invia Link Reset"
  - Messaggio successo/errore
  - Link "Torna al Login"
- **Backend endpoint**: `POST /api/auth/forgot-password`
- **Logica**:
  1. User inserisce email
  2. Backend verifica email esiste
  3. Genera token reset univoco
  4. Invia email con link: `https://alloggify.com/reset-password/:token`
  5. Token valido 1 ora
- **Email template necessario**: Reset password

#### 2. Reset Password Page
- **Percorso**: `/reset-password/:token`
- **File**: `src/pages/ResetPasswordPage.tsx`
- **Descrizione**: Form per impostare nuova password con token validazione
- **UI Components necessari**:
  - Input nuova password con strength indicator
  - Input conferma password
  - Button "Resetta Password"
  - Messaggio errore se token invalido/scaduto
- **Backend endpoint**: `POST /api/auth/reset-password`
- **Logica**:
  1. Verifica token valido e non scaduto
  2. Valida nuova password (min 8 char, 1 maiuscola, 1 numero)
  3. Hash password con bcrypt
  4. Aggiorna database
  5. Invalida token usato
  6. Redirect a `/login` con messaggio successo

#### 3. Verify Email Page
- **Percorso**: `/verify-email/:token`
- **File**: `src/pages/VerifyEmailPage.tsx`
- **Descrizione**: Pagina di conferma email dopo registrazione
- **UI Components necessari**:
  - Spinner loading durante verifica
  - Messaggio successo con redirect a dashboard
  - Messaggio errore con opzione "Invia nuovo link"
- **Backend endpoint**: `POST /api/auth/verify-email`
- **Logica**:
  1. Auto-chiamata API all'apertura pagina
  2. Backend verifica token
  3. Aggiorna `email_verified = true` nel database
  4. Auto-login (genera JWT)
  5. Redirect a `/dashboard`
- **Email template necessario**: Conferma registrazione

#### 4. 404 Not Found Page
- **Percorso**: `*` (fallback route)
- **File**: `src/pages/NotFoundPage.tsx`
- **Descrizione**: Pagina errore personalizzata
- **UI Components necessari**:
  - Illustrazione 404 (SVG)
  - Messaggio simpatico
  - Button "Torna alla Home"
  - Link utili (Pricing, Help, Login)
- **Backend endpoint**: Nessuno (statica)

---

### 📊 FASE 2 - Dashboard Completo (Priorità ALTA)

#### 5. Dashboard Overview
- **Percorso**: `/dashboard` o `/dashboard/overview`
- **File**: `src/pages/DashboardOverviewPage.tsx`
- **Descrizione**: Homepage dashboard con statistiche
- **UI Components necessari**:
  - Card "Quota mensile": progress bar con scansioni usate/totali
  - Card "Piano attivo": nome piano con button "Upgrade"
  - Card "Scansioni recenti": lista ultimi 5 scan
  - Card "Quick Actions": pulsanti rapidi (Nuova scansione, Vedi cronologia)
- **Backend endpoint**: `GET /api/user/stats`
- **Response**:
```json
{
  "totalScans": 127,
  "monthlyScans": 23,
  "remainingQuota": 77,
  "planName": "Basic",
  "planLimit": 100,
  "recentScans": [...]
}
```

#### 6. Scan History Page
- **Percorso**: `/dashboard/history`
- **File**: `src/pages/ScanHistoryPage.tsx`
- **Descrizione**: Tabella completa scansioni con filtri
- **UI Components necessari**:
  - Tabella con colonne: Data, Tipo documento, Nome, Cognome, Status, Azioni
  - Filtri: Data range, Tipo documento, Search bar
  - Paginazione (20 per pagina)
  - Button "Esporta CSV"
  - Click riga → `/dashboard/history/:id`
- **Backend endpoint**: `GET /api/scan/history?page=1&limit=20&search=&type=`
- **Response**:
```json
{
  "scans": [
    {
      "id": "uuid",
      "createdAt": "2025-11-01T10:30:00Z",
      "documentType": "CARTA DI IDENTITA'",
      "extractedData": { "nome": "Mario", "cognome": "Rossi" },
      "success": true
    }
  ],
  "total": 127,
  "page": 1,
  "totalPages": 7
}
```

#### 7. Scan Detail Page
- **Percorso**: `/dashboard/history/:id`
- **File**: `src/pages/ScanDetailPage.tsx`
- **Descrizione**: Dettaglio singola scansione
- **UI Components necessari**:
  - Card con tutti i dati estratti
  - Timestamp scansione
  - Tipo documento
  - Button "Re-invia ad Alloggiati Web"
  - Button "Scarica JSON"
  - Button "Elimina scansione"
- **Backend endpoint**: `GET /api/scan/:id`

#### 8. Profile Settings Page
- **Percorso**: `/dashboard/settings/profile`
- **File**: `src/pages/ProfileSettingsPage.tsx`
- **Descrizione**: Modifica profilo utente
- **UI Components necessari**:
  - Form con campi: Nome completo, Email, Nome azienda
  - Button "Salva modifiche"
  - Sezione "Cambia password" con modal
  - Avatar upload (opzionale)
- **Backend endpoint**:
  - `PUT /api/user/profile`
  - `PUT /api/user/password`

#### 9. Account Settings Page
- **Percorso**: `/dashboard/settings/account`
- **File**: `src/pages/AccountSettingsPage.tsx`
- **Descrizione**: Impostazioni account e GDPR
- **UI Components necessari**:
  - Sezione "Esporta dati" con button download ZIP (GDPR)
  - Sezione "Elimina account" con conferma modale + password
  - Checkbox "Ricevi newsletter"
  - Email notifiche preferenze
- **Backend endpoint**:
  - `GET /api/user/export` → ZIP con tutti i dati
  - `DELETE /api/user/account`

---

### 💳 FASE 3 - Billing & Monetization (Priorità ALTA)

#### 10. Pricing Page (Pubblico)
- **Percorso**: `/pricing`
- **File**: `src/pages/PricingPage.tsx`
- **Descrizione**: Landing page piani senza login richiesto
- **UI Components necessari**:
  - Tabella comparazione piani (Free, Basic, Pro, Enterprise)
  - Toggle Mensile/Annuale (sconto 20% annuale)
  - Button "Inizia Gratis" / "Scegli Piano"
  - FAQ prezzi
  - Sezione "Garanzia soddisfatti o rimborsati"
- **Backend endpoint**: `GET /api/billing/plans` (opzionale, può essere statico)

#### 11. Checkout Page
- **Percorso**: `/checkout/:plan`
- **File**: `src/pages/CheckoutPage.tsx`
- **Descrizione**: Stripe Checkout embedded
- **UI Components necessari**:
  - Stripe Checkout iframe embedded
  - Riepilogo piano selezionato
  - Spinner loading
- **Backend endpoint**: `POST /api/billing/create-checkout`
- **Logica**:
  1. User clicca "Scegli Piano" da `/pricing`
  2. Backend crea Stripe Checkout Session
  3. Frontend redirect a Checkout URL Stripe
  4. Dopo pagamento → redirect a `/checkout/success?session_id=xxx`

#### 12. Checkout Success Page
- **Percorso**: `/checkout/success`
- **File**: `src/pages/CheckoutSuccessPage.tsx`
- **Descrizione**: Conferma pagamento completato
- **UI Components necessari**:
  - Icona successo animata
  - Messaggio "Pagamento completato!"
  - Dettagli piano attivato
  - Button "Vai alla Dashboard"
  - Messaggio "Ti abbiamo inviato la ricevuta via email"
- **Backend endpoint**: Nessuno (verifica session_id in query param)

#### 13. Subscription Management Page
- **Percorso**: `/dashboard/billing`
- **File**: `src/pages/SubscriptionPage.tsx`
- **Descrizione**: Gestione abbonamento corrente
- **UI Components necessari**:
  - Card "Piano attivo": nome, prezzo, data rinnovo
  - Progress bar utilizzo quota mensile
  - Button "Upgrade piano" → `/pricing`
  - Button "Gestisci pagamento" → Stripe Customer Portal
  - Button "Cancella abbonamento" con conferma modale
  - Alert se subscription in "past_due"
- **Backend endpoint**:
  - `GET /api/billing/subscription`
  - `POST /api/billing/portal` → redirect Stripe Portal
  - `POST /api/billing/cancel`

#### 14. Invoices Page
- **Percorso**: `/dashboard/billing/invoices`
- **File**: `src/pages/InvoicesPage.tsx`
- **Descrizione**: Storico fatture
- **UI Components necessari**:
  - Tabella: Data, Numero fattura, Importo, Status, Download PDF
  - Filtro per anno
  - Button "Scarica PDF" per ogni fattura
- **Backend endpoint**: `GET /api/billing/invoices`
- **Response**:
```json
{
  "invoices": [
    {
      "id": "inv_123",
      "date": "2025-11-01",
      "amount": 1900,
      "currency": "EUR",
      "status": "paid",
      "pdfUrl": "https://stripe.com/..."
    }
  ]
}
```

---

### 🆘 FASE 4 - Support & Help (Priorità MEDIA)

#### 15. Help Center Page
- **Percorso**: `/help`
- **File**: `src/pages/HelpCenterPage.tsx`
- **Descrizione**: Centro assistenza con guide
- **UI Components necessari**:
  - Search bar per cercare articoli
  - Categorie: Getting Started, OCR, Extension, Billing, Troubleshooting
  - Lista articoli per categoria
  - Link "Contatta supporto"
- **Backend endpoint**: Nessuno (può usare CMS o file MD statici)

#### 16. Contact Support Page
- **Percorso**: `/support`
- **File**: `src/pages/ContactSupportPage.tsx`
- **Descrizione**: Form contatto supporto
- **UI Components necessari**:
  - Form: Nome, Email, Oggetto, Messaggio, Allegati
  - Dropdown "Categoria": Tecnico, Fatturazione, Feature request, Altro
  - Button "Invia ticket"
  - Messaggio "Ti risponderemo entro 24h"
- **Backend endpoint**: `POST /api/support/ticket`

---

### ⚠️ FASE 5 - Error Pages (Priorità MEDIA)

#### 17. 500 Server Error Page
- **Percorso**: `/error`
- **File**: `src/pages/ServerErrorPage.tsx`
- **Descrizione**: Errore server generico
- **UI Components necessari**:
  - Illustrazione errore
  - Messaggio "Qualcosa è andato storto"
  - Button "Riprova"
  - Link "Contatta supporto"

#### 18. Forbidden Page
- **Percorso**: `/forbidden`
- **File**: `src/pages/ForbiddenPage.tsx`
- **Descrizione**: Accesso negato (es. quota esaurita)
- **UI Components necessari**:
  - Messaggio "Quota esaurita" o "Accesso negato"
  - Spiegazione del problema
  - Button "Upgrade piano"

---

### 🤖 FASE 6 - AI Chat Assistant (Priorità ALTA) ⭐ NEW!

#### 19. AI Chat Widget (Floating + Dedicated Page)
- **Percorsi**:
  - Floating button: visibile in tutte le pagine dashboard
  - Pagina dedicata: `/dashboard/ai-assistant`
- **File**:
  - `src/components/AIChatWidget.tsx`
  - `src/pages/AIAssistantPage.tsx` (optional full-screen)
- **Descrizione**: Chat AI 24/7 esperta in hospitality e Alloggiati Web
- **UI Components necessari**:
  - Floating button bottom-right (come Intercom)
  - Chat sidebar con header, messaggi, input
  - Typing indicator ("L'assistente sta scrivendo...")
  - Suggested questions dinamiche
  - Feedback thumbs up/down
  - Message formatting (Markdown, emoji, links)
  - Copy message button
  - New conversation button
- **Backend endpoint**: `POST /api/ai/chat`
- **Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Come compilo cittadinanza?" },
    { "role": "assistant", "content": "..." }
  ]
}
```
- **Response**:
```json
{
  "response": "Per compilare la cittadinanza...",
  "usage": { "input_tokens": 50, "output_tokens": 300 }
}
```
- **AI Provider**: Gemini 2.0 Flash (Google)
  - Model: `gemini-2.0-flash`
  - System prompt: Esperto hospitality + Alloggiati Web
  - Costo: **GRATIS** (FREE tier: 1500 req/day, 2M tokens/day)
- **Funzionalità**:
  - Supporto Alloggiati Web (compilazione campi, normativa)
  - Consigli gestione ospiti
  - Best practices hospitality
  - Troubleshooting tecnico Alloggify
  - Normativa italiana (D.Lgs. 286/1998)
- **Context aware**: Ricorda conversazione precedente
- **Multilingua** (Future): IT, EN, FR, DE
- **Voice input** (Future): Dettare domande
- **Document upload** (Future): Analisi documento + domanda

**Dettagli completi**: Vedi `AI_CHAT_FEATURE.md`

---

## 🔧 BACKEND DA IMPLEMENTARE

### Database Setup (PostgreSQL - Supabase)

#### Schema Tables

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  scan_count INTEGER DEFAULT 0,
  monthly_scan_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scans Table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  extracted_data JSONB,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table (Stripe sync)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_name VARCHAR(50),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage Logs (analytics)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### API Endpoints da Implementare

#### Authentication
```typescript
POST   /api/auth/register
  Body: { email, password, fullName, companyName? }
  Response: { user, token, verificationEmailSent: true }

POST   /api/auth/login
  Body: { email, password }
  Response: { user, token }

POST   /api/auth/refresh
  Headers: { Authorization: "Bearer <refresh_token>" }
  Response: { token }

POST   /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: "Logged out" }

POST   /api/auth/forgot-password
  Body: { email }
  Response: { message: "Reset email sent" }

POST   /api/auth/reset-password
  Body: { token, newPassword }
  Response: { message: "Password updated" }

POST   /api/auth/verify-email
  Body: { token }
  Response: { message: "Email verified", token }
```

#### User Management
```typescript
GET    /api/user/profile
  Headers: { Authorization: "Bearer <token>" }
  Response: { id, email, fullName, companyName, emailVerified, plan }

PUT    /api/user/profile
  Body: { fullName?, email?, companyName? }
  Response: { user }

PUT    /api/user/password
  Body: { currentPassword, newPassword }
  Response: { message: "Password updated" }

GET    /api/user/stats
  Response: { totalScans, monthlyScans, remainingQuota, planName, planLimit }

GET    /api/user/export
  Response: ZIP file with all user data (GDPR)

DELETE /api/user/account
  Body: { password }
  Response: { message: "Account deleted" }
```

#### Scan Operations
```typescript
POST   /api/scan
  Body: { imageBase64, mimeType }
  Response: { scanId, extractedData, processingTime }

GET    /api/scan/history?page=1&limit=20&search=&type=
  Response: { scans: [], total, page, totalPages }

GET    /api/scan/:id
  Response: { scan }

DELETE /api/scan/:id
  Response: { message: "Scan deleted" }
```

#### Billing (Stripe)
```typescript
GET    /api/billing/plans
  Response: { plans: [{ id, name, price, features, limits }] }

POST   /api/billing/create-checkout
  Body: { planId, billingCycle: "monthly" | "yearly" }
  Response: { checkoutUrl }

GET    /api/billing/subscription
  Response: { plan, status, currentPeriodEnd, cancelAtPeriodEnd }

POST   /api/billing/portal
  Response: { portalUrl }

POST   /api/billing/cancel
  Response: { subscription }

GET    /api/billing/invoices
  Response: { invoices: [] }

POST   /api/billing/webhook
  Headers: { stripe-signature }
  Body: Stripe webhook event
  Response: { received: true }
```

---

## 🔗 INTEGRAZIONI ESTERNE NECESSARIE

### 1. Database - Supabase (FREE TIER)
- **URL**: https://supabase.com
- **Piano**: Free (500MB database, 2GB bandwidth)
- **Setup**:
  1. Crea progetto Supabase
  2. Esegui schema SQL
  3. Ottieni connection string
  4. Aggiungi a `.env`: `DATABASE_URL=postgresql://...`

### 2. Email Service - Resend (FREE TIER)
- **URL**: https://resend.com
- **Piano**: Free (100 email/giorno, 3000/mese)
- **Setup**:
  1. Crea account Resend
  2. Verifica dominio (o usa resend.dev per test)
  3. Crea API key
  4. Aggiungi a `.env`: `RESEND_API_KEY=re_...`
- **Email templates necessari**:
  - Welcome email (dopo registrazione)
  - Email verification
  - Password reset
  - Subscription confirmed
  - Subscription canceled
  - Invoice receipt

### 3. Stripe - STRIPE TEST MODE (FREE)
- **URL**: https://stripe.com
- **Piano**: Test mode (nessun costo, carte test)
- **Setup**:
  1. Crea account Stripe
  2. Crea prodotti e prezzi (Free, Basic €19, Pro €49, Enterprise €199)
  3. Ottieni API keys (test mode)
  4. Configura webhook endpoint: `https://alloggify.com/api/billing/webhook`
  5. Aggiungi a `.env`:
     - `STRIPE_SECRET_KEY=sk_test_...`
     - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
     - `STRIPE_WEBHOOK_SECRET=whsec_...`
- **Eventi webhook da gestire**:
  - `checkout.session.completed` → Attiva subscription
  - `customer.subscription.updated` → Aggiorna status
  - `customer.subscription.deleted` → Cancella subscription
  - `invoice.payment_succeeded` → Log fattura
  - `invoice.payment_failed` → Notifica utente

### 4. Authentication - JWT (nessun costo)
- **Library**: `jsonwebtoken`
- **Setup**:
  1. Genera secret key: `openssl rand -base64 32`
  2. Aggiungi a `.env`: `JWT_SECRET=...`
  3. Token expiry: 7 giorni (access), 30 giorni (refresh)

### 5. AI Chat - Gemini 2.0 Flash (GRATIS) ⭐
- **URL**: https://aistudio.google.com/apikey
- **Modello**: Gemini 2.0 Flash
- **Piano**: **FREE tier permanente** (1500 req/day, 2M tokens input/day)
- **Setup**:
  1. Usa stesso account già configurato per OCR
  2. Usa stessa API key già in `.env`: `GEMINI_API_KEY=AIzaSy...`
  3. Nessun setup aggiuntivo necessario!
- **Vantaggi rispetto ad Anthropic**:
  - ✅ **Completamente GRATIS** (vs $50/mese con Claude)
  - ✅ **Già integrato** (stesso SDK usato per OCR)
  - ✅ **Velocissimo** (< 1 secondo risposta)
  - ✅ **Ottimo in Italiano** (supporto nativo)
  - ✅ **Nessun costo operativo** (FREE tier sufficiente)
- **Pricing**: GRATIS fino a 1500 req/day
  - FREE tier: 1500 RPD (Requests Per Day), 2M tokens input/day
  - 500 utenti × 20 msg/mese = ~333 msg/day → **Ben sotto il limite**
  - Costo mensile: **$0/mese**
- **System Prompt**: Vedi `AI_CHAT_FEATURE.md` per prompt completo (~2000 tokens)
- **Rate limits**: 1500 req/day (più che sufficiente per startup)
- **Costo mensile stimato** (500 utenti, 20 msg/mese): **$0/mese** 🎉

---

## 📦 DIPENDENZE NPM DA INSTALLARE

### Backend
```bash
npm install --save \
  express \
  cors \
  helmet \
  express-rate-limit \
  pg \
  @supabase/supabase-js \
  bcryptjs \
  jsonwebtoken \
  joi \
  stripe \
  resend \
  uuid \
  date-fns

npm install --save-dev \
  @types/express \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/cors \
  typescript \
  ts-node \
  nodemon
```

### Frontend (già installati)
- react-router-dom ✅
- lucide-react ✅
- tailwindcss ✅

### Frontend (da installare)
```bash
npm install --save \
  @stripe/stripe-js \
  @stripe/react-stripe-js \
  react-hot-toast \
  date-fns \
  recharts \
  react-markdown \
  remark-gfm

# @google/generative-ai è già installato (usato per OCR) ✅
```

---

## 🎯 PRIORITÀ FASI

### FASE IMMEDIATA (Settimana 1-2)
**Obiettivo**: Autenticazione completa funzionante

- [ ] Setup Supabase database
- [ ] Implementare schema SQL
- [ ] Setup Resend email service
- [ ] Creare ForgotPasswordPage
- [ ] Creare ResetPasswordPage
- [ ] Creare VerifyEmailPage
- [ ] Creare 404Page
- [ ] Backend: POST /api/auth/forgot-password
- [ ] Backend: POST /api/auth/reset-password
- [ ] Backend: POST /api/auth/verify-email
- [ ] Email templates (reset, verify)
- [ ] Sostituire mock auth con JWT reale

**Deliverable**: Sistema auth completo end-to-end

---

### FASE 2 (Settimana 3-4)
**Obiettivo**: Dashboard funzionante

- [ ] Migrare OCR da client a server
- [ ] Implementare quota management
- [ ] Creare DashboardOverviewPage
- [ ] Creare ScanHistoryPage
- [ ] Creare ScanDetailPage
- [ ] Creare ProfileSettingsPage
- [ ] Creare AccountSettingsPage
- [ ] Backend: GET /api/user/stats
- [ ] Backend: GET /api/scan/history
- [ ] Backend: GET /api/scan/:id
- [ ] Backend: PUT /api/user/profile
- [ ] Backend: DELETE /api/user/account

**Deliverable**: Dashboard completo con gestione scansioni

---

### FASE 3 (Settimana 5-8)
**Obiettivo**: Monetization + Chrome Web Store

- [ ] Setup Stripe account
- [ ] Creare prodotti Stripe (4 piani)
- [ ] Creare PricingPage
- [ ] Creare CheckoutPage
- [ ] Creare CheckoutSuccessPage
- [ ] Creare SubscriptionPage
- [ ] Creare InvoicesPage
- [ ] Backend: POST /api/billing/create-checkout
- [ ] Backend: GET /api/billing/subscription
- [ ] Backend: POST /api/billing/webhook
- [ ] Backend: POST /api/billing/portal
- [ ] Test complete payment flow con carte test
- [ ] Preparare assets Chrome Extension
- [ ] Submission Chrome Web Store

**Deliverable**: Sistema pagamenti funzionante + Extension pubblicata

---

### FASE 4 (Settimana 9-12)
**Obiettivo**: Support + Polish

- [ ] Creare HelpCenterPage
- [ ] Creare ContactSupportPage
- [ ] Creare error pages (500, forbidden)
- [ ] Backend: POST /api/support/ticket
- [ ] Testing completo su tutti i flussi
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] SEO final optimization

**Deliverable**: Applicazione production-ready

---

## 📊 METRICHE DI SUCCESSO

### Milestone 1 (Fine Fase 1)
- ✅ Utenti possono registrarsi e verificare email
- ✅ Utenti possono resettare password
- ✅ JWT authentication funzionante
- ✅ Database popolato con primi test users

### Milestone 2 (Fine Fase 2)
- ✅ Utenti possono fare scan tramite dashboard
- ✅ Cronologia scansioni visibile
- ✅ Quota management funzionante (5 scan free)
- ✅ Profilo modificabile

### Milestone 3 (Fine Fase 3)
- ✅ Primo utente pagante (test mode)
- ✅ Stripe subscription attiva
- ✅ Estensione Chrome pubblicata
- ✅ Sistema di upgrade/downgrade funzionante

### Milestone 4 (Fine Fase 4)
- ✅ 10+ utenti beta registrati
- ✅ 0 critical bugs
- ✅ Lighthouse score >90
- ✅ Ready for production launch

---

## 🚀 PROSSIMI PASSI IMMEDIATI

### Questa settimana
1. **Setup Supabase** - Crea progetto e database
2. **Setup Resend** - Crea account e verifica dominio
3. **Implementare schema database** - Esegui SQL
4. **Creare prime 4 pagine auth** - Forgot, Reset, Verify, 404

### Prossima settimana
1. **Backend auth endpoints** - Implementare tutti gli endpoint auth
2. **Email templates** - Creare template con Resend
3. **Testing flow completo** - Registrazione → Verifica → Login → Reset password
4. **Sostituire mock auth** - Rimuovere AuthContext mock, usare JWT reale

---

## 📝 NOTE TECNICHE

### Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@alloggify.com

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Gemini (OCR + AI Chat) - Stesso API key per entrambi
GEMINI_API_KEY=AIzaSyxxxxxxxxxx

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### Security Checklist
- [ ] Password hashing con bcrypt (salt rounds: 10)
- [ ] JWT con expiry e refresh token
- [ ] Rate limiting su auth endpoints (5 tentativi/15min)
- [ ] HTTPS su production (Vercel automatico)
- [ ] Helmet.js per security headers
- [ ] CORS configurato correttamente
- [ ] Input validation con Joi
- [ ] SQL injection protection (parametrized queries)
- [ ] XSS protection (React auto-escape)
- [ ] CSRF tokens su form critici

---

## 📚 RISORSE UTILI

### Documentazione
- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- Stripe Docs: https://stripe.com/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com

### Tutorial
- Stripe + React: https://stripe.com/docs/payments/checkout
- JWT Authentication: https://jwt.io/introduction
- PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Don%27t_Do_This

---

**Documento creato**: 2 Novembre 2025
**Prossimo aggiornamento**: Dopo completamento Fase 1
