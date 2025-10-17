# 🚀 Alloggify SaaS - Piano di Sviluppo

> Da MVP a Prodotto SaaS completo per il mercato dell'hospitality italiana

**Versione:** 1.0
**Data:** Ottobre 2025
**Status:** Planning Phase

---

## 📋 Indice

1. [Executive Summary](#executive-summary)
2. [Visione e Obiettivi](#visione-e-obiettivi)
3. [Analisi di Mercato](#analisi-di-mercato)
4. [Architettura Tecnica](#architettura-tecnica)
5. [Roadmap di Sviluppo](#roadmap-di-sviluppo)
6. [Modello di Business](#modello-di-business)
7. [Piano di Marketing](#piano-di-marketing)
8. [Budget e Costi](#budget-e-costi)
9. [Metriche di Successo](#metriche-di-successo)
10. [Rischi e Mitigazioni](#rischi-e-mitigazioni)

---

## 🎯 Executive Summary

### Problema
Le strutture ricettive italiane spendono **15-30 minuti per ospite** per inserire manualmente i dati nel portale Alloggiati Web della Polizia di Stato. Con una media di 50-200 check-in al mese, questo si traduce in **12-100 ore/mese di lavoro manuale**.

### Soluzione
Alloggify automatizza il processo attraverso:
- **OCR AI-powered** per estrarre dati da documenti (99% accuratezza)
- **Chrome Extension** per compilazione automatica form
- **Sistema cloud** con gestione utenti e fatturazione

### Opportunità di Mercato
- **Target primario**: 33,000+ strutture ricettive in Italia
- **Mercato potenziale**: €20M+/anno
- **Tasso di crescita turismo**: +15% annuo post-COVID

### Proiezioni Finanziarie (Anno 1)
- **Revenue target**: €120,000
- **Utenti paganti**: 300-500
- **Break-even**: Mese 8
- **Margine lordo**: ~85%

---

## 🌟 Visione e Obiettivi

### Vision Statement
*"Rendere la gestione degli alloggiati semplice come un click, permettendo agli operatori dell'hospitality di concentrarsi sull'accoglienza degli ospiti invece che sulla burocrazia."*

### Mission
Diventare lo standard de-facto per l'automazione del processo Alloggiati Web in Italia entro 24 mesi.

### Obiettivi a 6 mesi
- ✅ Completare backend e sistema di autenticazione
- ✅ Pubblicare estensione Chrome sul Web Store
- ✅ Raggiungere 100 utenti beta (free trial)
- ✅ Ottenere almeno 50 utenti paganti
- ✅ Raggiungere €2,000 MRR (Monthly Recurring Revenue)

### Obiettivi a 12 mesi
- ✅ 500 utenti paganti
- ✅ €10,000 MRR
- ✅ Partnership con 3-5 software gestionali per hotel
- ✅ Supporto per documenti internazionali (EU + extra-EU)
- ✅ API pubblica per integrazioni

### Obiettivi a 24 mesi
- ✅ 2,000+ utenti paganti
- ✅ €40,000 MRR
- ✅ Espansione in altri paesi EU con requisiti simili
- ✅ Mobile app (iOS/Android)

---

## 📊 Analisi di Mercato

### Mercato Target

#### Segmento Primario: Piccole strutture (1-20 camere)
- **Quantità**: ~25,000 strutture
- **Caratteristiche**: B&B, affittacamere, case vacanze
- **Pain points**: Alto rapporto tempo/ospiti, no personale dedicato
- **Willingness to pay**: Media-alta (€20-50/mese)

#### Segmento Secondario: Medie strutture (20-100 camere)
- **Quantità**: ~7,000 hotel
- **Caratteristiche**: Hotel 3-4 stelle, residence
- **Pain points**: Volume alto, turnover staff, errori manuali
- **Willingness to pay**: Alta (€50-150/mese)

#### Segmento Enterprise: Grandi catene (100+ camere)
- **Quantità**: ~1,000 gruppi
- **Caratteristiche**: Hotel 4-5 stelle, catene
- **Pain points**: Integrazione con PMS esistenti
- **Willingness to pay**: Molto alta (€200-500/mese + custom)

### Competitor Analysis

#### Competitors Diretti
**NESSUNO** - Non esistono soluzioni specifiche per Alloggiati Web automation

#### Competitors Indiretti
1. **Software gestionali hotel** (es. Vertical Booking, Octorate)
   - Pro: Già usati dalle strutture
   - Contro: Non hanno OCR, integrazione limitata
   - Opportunità: Partnership per integrazione

2. **Servizi di outsourcing dati**
   - Pro: Nessuna tecnologia da installare
   - Contro: Costosi (€2-5 per ospite), lenti
   - Vantaggio nostro: Automatico, istantaneo, economico

### Vantaggio Competitivo

1. **First-mover advantage**: Primi sul mercato
2. **Tecnologia proprietaria**: OCR ottimizzato per documenti italiani
3. **User experience**: 90% più veloce del processo manuale
4. **Prezzo**: 70% più economico dei servizi di outsourcing
5. **Privacy**: Dati rimangono in Italia, GDPR compliant

---

## 🏗️ Architettura Tecnica

### Stack Tecnologico

#### Frontend (Existing + Updates)
```
- React 19 + TypeScript
- Vite 6.2
- TailwindCSS
- Hosting: Vercel
```

#### Backend (NEW)
```
- Runtime: Node.js 20 LTS
- Framework: Express.js o Fastify
- Language: TypeScript
- API: RESTful + GraphQL (futuro)
- Hosting: Railway / Render / AWS Lambda
```

#### Database (NEW)
```
- Primary DB: PostgreSQL 15 (Supabase o Railway)
- Cache: Redis (Upstash)
- File Storage: AWS S3 o Cloudflare R2
```

#### Authentication & Authorization
```
- JWT tokens (access + refresh)
- OAuth 2.0 (Google, Microsoft)
- Password hashing: bcrypt
- Rate limiting: express-rate-limit
```

#### Payment Processing
```
- Provider: Stripe
- Webhooks per subscription management
- Piani: Monthly/Annual
- Supporto carte italiane + SEPA
```

#### AI/ML
```
- OCR: Google Gemini 2.5 Flash (current)
- Backup: GPT-4 Vision (fallback)
- Future: Self-hosted Tesseract per costi ridotti
```

#### Chrome Extension (UPDATE)
```
- Manifest V3 (già implementato)
- Background service worker
- Content scripts per Alloggiati Web
- Storage: chrome.storage.sync per token
- Updates: Chrome Web Store auto-update
```

#### Monitoring & Analytics
```
- Error tracking: Sentry
- Analytics: Plausible Analytics (GDPR-friendly)
- Logs: Better Stack (Logtail)
- Uptime: BetterUptime
```

### Architettura di Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LAYER                          │
├─────────────────────┬───────────────────┬───────────────────┤
│   Web App (Vercel)  │ Chrome Extension  │  Mobile (Future) │
└──────────┬──────────┴─────────┬─────────┴──────────┬────────┘
           │                    │                     │
           └────────────────────┼─────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   API Gateway         │
                    │   (Rate Limiting)     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Auth Middleware     │
                    │   (JWT Validation)    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐   ┌─────────▼──────────┐   ┌───────▼────────┐
│  User Service  │   │  Scan Service      │   │ Billing Service│
│  - Auth        │   │  - OCR Processing  │   │ - Stripe       │
│  - Profile     │   │  - Data Extraction │   │ - Subscriptions│
│  - Permissions │   │  - Validation      │   │ - Invoices     │
└───────┬────────┘   └─────────┬──────────┘   └───────┬────────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │      PostgreSQL Database    │
                │  - users                    │
                │  - scans                    │
                │  - subscriptions            │
                │  - usage_logs               │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │     Redis Cache             │
                │  - Session data             │
                │  - Rate limit counters      │
                │  - Frequently used results  │
                └─────────────────────────────┘
```

### Database Schema (Simplified)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  subscription_plan VARCHAR(50), -- free, basic, pro, enterprise
  subscription_status VARCHAR(50), -- active, cancelled, past_due
  stripe_customer_id VARCHAR(255),
  scan_count INTEGER DEFAULT 0,
  monthly_scan_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scans Table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  document_type VARCHAR(100),
  extracted_data JSONB,
  processing_time_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255),
  plan_name VARCHAR(50),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Logs Table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register      - Registrazione nuovo utente
POST   /api/auth/login         - Login e ottenimento JWT
POST   /api/auth/refresh       - Refresh del token
POST   /api/auth/logout        - Logout
POST   /api/auth/forgot-password - Reset password
```

#### User Management
```
GET    /api/user/profile       - Ottieni profilo utente
PUT    /api/user/profile       - Aggiorna profilo
GET    /api/user/usage         - Statistiche utilizzo
DELETE /api/user/account       - Elimina account
```

#### Scan Operations
```
POST   /api/scan               - Scansiona documento (OCR)
GET    /api/scan/history       - Cronologia scansioni
GET    /api/scan/:id           - Dettaglio singola scansione
DELETE /api/scan/:id           - Elimina scansione
```

#### Billing
```
GET    /api/billing/plans      - Lista piani disponibili
POST   /api/billing/subscribe  - Sottoscrivi piano
POST   /api/billing/cancel     - Cancella sottoscrizione
GET    /api/billing/invoices   - Lista fatture
POST   /api/billing/portal     - Ottieni link Stripe portal
```

#### Webhooks
```
POST   /api/webhooks/stripe    - Webhook Stripe (subscription updates)
```

---

## 🗓️ Roadmap di Sviluppo

### FASE 1: Foundation (Settimane 1-4) ⚙️

**Obiettivo**: Backend funzionante + Database + Auth

#### Week 1-2: Backend Setup
- [ ] Setup progetto Node.js + TypeScript + Express
- [ ] Configurazione PostgreSQL (Supabase)
- [ ] Implementazione database schema
- [ ] Setup ambiente dev/staging/prod
- [ ] CI/CD pipeline (GitHub Actions)

#### Week 3-4: Authentication System
- [ ] Implementazione JWT auth
- [ ] Endpoint registrazione/login/logout
- [ ] Password reset flow
- [ ] Rate limiting
- [ ] Email service (transazionali)

**Deliverables**:
- ✅ Backend API funzionante
- ✅ Database schema implementato
- ✅ Sistema auth completo
- ✅ Documentazione API (Swagger)

---

### FASE 2: Core Features (Settimane 5-8) 🔧

**Obiettivo**: Migrazione OCR a backend + User dashboard

#### Week 5-6: Scan Service
- [ ] Endpoint `/api/scan` con Gemini integration
- [ ] Gestione API key Gemini server-side
- [ ] Sistema di quota/limiti per piano
- [ ] Salvataggio risultati nel database
- [ ] Error handling e retry logic

#### Week 7-8: User Dashboard
- [ ] Frontend: Login/Signup page
- [ ] Dashboard con statistiche utilizzo
- [ ] Gestione profilo utente
- [ ] Cronologia scansioni
- [ ] Update Chrome Extension (chiamate a backend)

**Deliverables**:
- ✅ OCR tramite backend funzionante
- ✅ Dashboard utente completo
- ✅ Extension aggiornata con auth

---

### FASE 3: Monetization (Settimane 9-12) 💰

**Obiettivo**: Sistema di pagamento + Piani + Chrome Web Store

#### Week 9-10: Stripe Integration
- [ ] Setup Stripe account + webhooks
- [ ] Implementazione subscription logic
- [ ] Pagine pricing e checkout
- [ ] Gestione upgrade/downgrade piani
- [ ] Customer portal Stripe

#### Week 11-12: Chrome Web Store
- [ ] Preparazione assets estensione (icone, screenshots)
- [ ] Privacy policy e Terms of Service
- [ ] Submission a Chrome Web Store
- [ ] Testing e fixing review feedback
- [ ] Pubblicazione ufficiale

**Deliverables**:
- ✅ Sistema pagamenti funzionante
- ✅ Estensione pubblicata su Chrome Web Store
- ✅ Primi utenti paganti

---

### FASE 4: Growth (Settimane 13-16) 📈

**Obiettivo**: Marketing + Partnerships + Features avanzate

#### Week 13-14: Marketing & Launch
- [ ] Landing page ottimizzata
- [ ] SEO e content marketing
- [ ] Google Ads campaign
- [ ] Outreach a hotel e B&B
- [ ] Beta tester program

#### Week 15-16: Advanced Features
- [ ] Batch processing (scan multipli)
- [ ] Esportazione Excel/CSV
- [ ] API per integrazioni
- [ ] Dashboard analytics avanzati
- [ ] Supporto multi-utente (team accounts)

**Deliverables**:
- ✅ 100+ utenti registrati
- ✅ 20+ utenti paganti
- ✅ €500+ MRR

---

### FASE 5: Scale (Mesi 5-6) 🚀

**Obiettivo**: Ottimizzazione + Integrazioni + Espansione

- [ ] Performance optimization
- [ ] Integrazioni PMS (Property Management Systems)
- [ ] Programma di affiliazione
- [ ] Sistema di referral
- [ ] Supporto multilingua (EN, FR, DE)
- [ ] Mobile app (React Native)

**Target**:
- ✅ 500+ utenti registrati
- ✅ 100+ utenti paganti
- ✅ €2,500+ MRR
- ✅ Break-even point

---

## 💼 Modello di Business

### Pricing Strategy

#### 🆓 Piano FREE
**Target**: Trial users, strutture piccole occasionali
- **Prezzo**: €0/mese
- **Limiti**: 5 scansioni/mese
- **Features**:
  - ✅ OCR base
  - ✅ Chrome extension
  - ✅ Supporto email
  - ❌ Cronologia limitata (7 giorni)
  - ❌ Esportazione dati

**Conversione attesa**: 10-15% → Piano Basic dopo 2-3 mesi

---

#### ⭐ Piano BASIC
**Target**: B&B, affittacamere, piccoli hotel (<10 camere)
- **Prezzo**: €19/mese (€15/mese se annuale)
- **Limiti**: 100 scansioni/mese
- **Features**:
  - ✅ OCR avanzato
  - ✅ Chrome extension
  - ✅ Cronologia completa
  - ✅ Esportazione Excel/CSV
  - ✅ Supporto email prioritario
  - ✅ 10 template personalizzati

**ROI per cliente**:
- Tempo risparmiato: ~8 ore/mese
- Valore tempo: €15/ora × 8 = €120/mese
- ROI: **530%**

---

#### 🚀 Piano PRO
**Target**: Hotel medi (10-50 camere), gestori multi-property
- **Prezzo**: €49/mese (€39/mese se annuale)
- **Limiti**: 500 scansioni/mese
- **Features**:
  - ✅ Tutto di Basic +
  - ✅ Batch processing (10 doc insieme)
  - ✅ API access (rate-limited)
  - ✅ Multi-utente (5 account)
  - ✅ Supporto prioritario (chat)
  - ✅ Statistiche avanzate
  - ✅ Webhook notifications

**ROI per cliente**:
- Tempo risparmiato: ~30 ore/mese
- Valore tempo: €15/ora × 30 = €450/mese
- ROI: **820%**

---

#### 💎 Piano ENTERPRISE
**Target**: Catene hotel, grandi resort (50+ camere)
- **Prezzo**: €199/mese + custom
- **Limiti**: Scansioni illimitate
- **Features**:
  - ✅ Tutto di Pro +
  - ✅ API illimitata
  - ✅ Utenti illimitati
  - ✅ White-label option
  - ✅ Integrazione PMS custom
  - ✅ SLA 99.9% uptime
  - ✅ Supporto telefonico
  - ✅ Account manager dedicato
  - ✅ Training on-site

**Sales approach**: Direct B2B, contratti annuali

---

### Revenue Projections

#### Scenario Conservativo (Anno 1)

| Mese | Free | Basic | Pro | Enterprise | MRR | Cumulative |
|------|------|-------|-----|------------|-----|------------|
| M1   | 20   | 5     | 0   | 0          | €95 | €95        |
| M2   | 35   | 10    | 1   | 0          | €239| €334       |
| M3   | 60   | 20    | 3   | 0          | €527| €861       |
| M4   | 100  | 35    | 5   | 0          | €910| €1,771     |
| M5   | 150  | 50    | 8   | 1          | €1,541| €3,312   |
| M6   | 200  | 80    | 15  | 1          | €2,454| €5,766   |
| M7   | 250  | 100   | 20  | 2          | €3,378| €9,144   |
| M8   | 300  | 130   | 30  | 2          | €4,368| €13,512  |
| M9   | 350  | 160   | 40  | 3          | €5,557| €19,069  |
| M10  | 400  | 200   | 50  | 3          | €7,097| €26,166  |
| M11  | 450  | 240   | 60  | 4          | €8,756| €34,922  |
| M12  | 500  | 300   | 80  | 5          | €11,615| €46,537|

**Anno 1 Total Revenue**: €46,537
**Costi stimati**: ~€25,000 (vedi sezione budget)
**Profitto netto**: ~€21,537

#### Scenario Ottimistico (Anno 1)
- **Utenti totali**: 1,000+
- **MRR Mese 12**: €18,000
- **ARR**: €216,000
- **Profitto netto**: ~€140,000

---

### Unit Economics

#### Customer Acquisition Cost (CAC)
- **Marketing spend**: €50-150 per utente acquisito
- **Target**: Recupero CAC in 2-4 mesi

#### Lifetime Value (LTV)
- **Piano Basic**: €15/mese × 18 mesi = €270
- **Piano Pro**: €39/mese × 24 mesi = €936
- **LTV/CAC ratio target**: >3:1

#### Churn Rate Target
- **Anno 1**: <10% mensile
- **Anno 2**: <5% mensile
- **Strategie**:
  - Onboarding efficace
  - Customer success team
  - Features sticky (cronologia, templates)
  - Contratti annuali scontati

---

## 📣 Piano di Marketing

### Go-to-Market Strategy

#### Fase 1: Product-Led Growth (Mesi 1-3)
- **Free tier generoso** per attirare early adopters
- **Viral loop**: Referral program (1 mese gratis per referral)
- **Content marketing**: Guide pratiche su Alloggiati Web
- **SEO**: Posizionamento per "alloggiati web automatico", "compilare alloggiati velocemente"

#### Fase 2: Direct Outreach (Mesi 4-6)
- **Email campaigns** a database hotel (scraped da booking.com)
- **LinkedIn outreach** a property managers
- **Demo webinars** settimanali
- **Partnership con associazioni** (Federalberghi, Confcommercio)

#### Fase 3: Paid Acquisition (Mesi 7-12)
- **Google Ads**: Keywords intent-based
- **Facebook/Instagram Ads**: Targeting hotel owners
- **Retargeting campaigns**
- **Influencer marketing**: Travel & hospitality influencers

### Canali di Acquisizione

#### 1. SEO & Content Marketing (Budget: €500/mese)
**Blog topics**:
- "Come compilare Alloggiati Web in 30 secondi"
- "Guida completa Alloggiati Web 2025"
- "10 errori comuni nel check-in ospiti"
- "GDPR e gestione dati ospiti: cosa sapere"

**Keywords target**:
- "alloggiati web" (1,600 ricerche/mese)
- "portale alloggiati polizia" (800 ricerche/mese)
- "compilare alloggiati automatico" (200 ricerche/mese)

#### 2. Google Ads (Budget: €1,000/mese)
- **Search campaigns**: Intent keywords
- **Display campaigns**: Retargeting
- **CPC target**: €1-3
- **Conversione attesa**: 5-10%

#### 3. Social Media (Budget: €500/mese)
- **Facebook Groups**: Gruppi hotel & B&B
- **LinkedIn**: Targeting property managers
- **Instagram**: Visual content (before/after screenshots)
- **YouTube**: Tutorial & demo videos

#### 4. Partnerships (No direct cost)
- **Software gestionali hotel**: Integrazioni
- **Booking platforms**: Co-marketing
- **Associazioni di categoria**: Sponsor eventi

#### 5. Referral Program
- **Incentivo referrer**: 1 mese gratis o €20 credit
- **Incentivo referee**: 20% sconto primo mese
- **Target viral coefficient**: 1.2-1.5

### Sales Funnel

```
1000 Visitors → Landing Page
  ↓ (20% signup)
200 Free Signups
  ↓ (30% activation - prima scansione)
60 Active Users
  ↓ (15% conversion to paid)
9 Paying Customers
```

**Target CAC**: €100
**Target conversion rate**: 0.9% (visitor → customer)

---

## 💰 Budget e Costi

### Startup Costs (One-time)

| Item | Costo | Note |
|------|-------|------|
| Chrome Web Store Developer | $5 | Una tantum |
| Logo & Brand Design | €200 | Fiverr/99designs |
| Privacy Policy & ToS (legal) | €300 | Avvocato/template |
| Stripe account setup | €0 | Gratis |
| Domain & Email | €50 | alloggify.com + Google Workspace |
| **TOTALE** | **€555** | |

### Monthly Operating Costs (Steady State)

#### Infrastructure & SaaS Tools

| Item | Costo/mese | Note |
|------|------------|------|
| **Hosting & Infrastructure** | | |
| Vercel (Frontend) | €0-20 | Free tier OK fino a 100k visitors |
| Railway/Render (Backend) | €20-50 | Scalabile con usage |
| Supabase (Database) | €25 | Pro tier (100GB) |
| Redis (Upstash) | €10 | 10k requests/day |
| AWS S3 / Cloudflare R2 | €10 | Storage documenti |
| **Subtotale Infra** | **€65-115** | |
| | | |
| **APIs & Services** | | |
| Gemini API | €100-500 | Variabile con scansioni |
| Stripe fees | ~3% revenue | €30-350/mese |
| SendGrid (Email) | €20 | 100k email/mese |
| Sentry (Monitoring) | €0 | Free tier OK |
| Plausible Analytics | €9 | 100k pageviews |
| **Subtotale Services** | **€159-879** | |
| | | |
| **Marketing** | | |
| Google Ads | €1,000 | Performance marketing |
| SEO tools (Ahrefs) | €99 | Keyword research |
| Social Media Ads | €500 | Facebook/Instagram |
| Content creation | €200 | Freelancer blog posts |
| **Subtotale Marketing** | **€1,799** | |
| | | |
| **Team & Admin** | | |
| Freelance support (PT) | €500 | Customer support 20h/mese |
| Accounting software | €20 | Fatturazione/contabilità |
| **Subtotale Admin** | **€520** | |
| | | |
| **TOTALE MENSILE** | **€2,543-3,313** | Medio: **€2,900** |

### Break-Even Analysis

**Fixed costs mensili**: €2,900
**Variable cost per scan**: €0.05 (Gemini API)

**Break-even con mix clienti**:
- 100 clienti Basic (€1,900/mese) + 30 clienti Pro (€1,470/mese) = €3,370/mese
- **Break-even: ~130 clienti paganti**
- **Timeline target: Mese 7-8**

### Funding Requirements

#### Bootstrap Approach (Raccomandato)
- **Capital needed**: €10,000-15,000
- **Runway**: 6 mesi fino a break-even
- **Source**: Founder savings / Friends & Family

#### Alternative: Pre-seed Round
- **Amount**: €50,000-100,000
- **Use of funds**:
  - 60% Marketing & Sales
  - 30% Product development (team)
  - 10% Operations
- **Equity**: 10-15%
- **Valuation**: €500k-750k

---

## 📊 Metriche di Successo

### North Star Metric
**Scansioni completate con successo per utente attivo al mese**

Target progression:
- Mese 1-3: >10 scans/utente
- Mese 4-6: >20 scans/utente
- Mese 7-12: >30 scans/utente

### KPIs Primari

#### Acquisizione
- **Visitor to Signup**: >15%
- **Signup to Activation** (prima scansione): >40%
- **Activation to Paid**: >10%
- **CAC**: <€150
- **Payback period**: <4 mesi

#### Engagement
- **DAU/MAU ratio**: >30%
- **Avg scans/user/month**: >20
- **Feature adoption rate**: >60%
- **NPS (Net Promoter Score)**: >40

#### Revenue
- **MRR growth rate**: >20%/mese (primi 6 mesi)
- **ARPU** (Average Revenue Per User): >€25
- **LTV/CAC ratio**: >3:1
- **Gross margin**: >80%

#### Retention
- **Churn rate mensile**: <8%
- **Retention Mese 3**: >60%
- **Retention Mese 12**: >40%
- **Expansion MRR**: >5% (upgrade Basic→Pro)

### Dashboard Metrics (da tracciare quotidianamente)

```
Revenue Metrics:
- MRR
- ARR
- New MRR
- Churned MRR
- Expansion MRR

User Metrics:
- Total users
- Free users
- Paying users
- New signups
- Activated users

Product Metrics:
- Total scans
- Successful scans
- Failed scans
- Avg processing time
- Error rate

Support Metrics:
- Open tickets
- Avg response time
- Customer satisfaction score
```

---

## ⚠️ Rischi e Mitigazioni

### Rischi Tecnici

#### 1. Affidabilità OCR
**Rischio**: Accuratezza <90% → utenti insoddisfatti
**Probabilità**: Media
**Impatto**: Alto
**Mitigazione**:
- Multi-model approach (Gemini + GPT-4V fallback)
- Continuous training con feedback utenti
- Manual review option per scansioni dubbie
- SLA: 95% accuracy guarantee

#### 2. Scalabilità Infrastruttura
**Rischio**: Crash durante picchi di traffico
**Probabilità**: Media
**Impatto**: Alto
**Mitigazione**:
- Auto-scaling su Railway/Render
- Rate limiting aggressivo
- CDN per static assets
- Load testing pre-launch

#### 3. Dipendenza da Gemini API
**Rischio**: Google aumenta prezzi o depreca API
**Probabilità**: Bassa
**Impatto**: Critico
**Mitigazione**:
- Architettura multi-provider (facile switch a OpenAI/Anthropic)
- Budget buffer per aumenti prezzi (20%)
- Valutare self-hosted OCR a lungo termine

### Rischi di Business

#### 4. Cambio Regolamentare
**Rischio**: Alloggiati Web cambia portale/API
**Probabilità**: Media
**Impatto**: Alto
**Mitigazione**:
- Monitoraggio continuo portale Polizia
- Architettura modulare (facile adattamento selectors)
- Community di utenti per segnalazioni rapide
- Contingency: aggiornamento estensione in <48h

#### 5. Competitor Entry
**Rischio**: Competitor con più risorse entra nel mercato
**Probabilità**: Media (post-12 mesi)
**Impatto**: Alto
**Mitigazione**:
- First-mover advantage e brand awareness
- Focus su user experience superiore
- Lock-in con integrazioni PMS
- Network effects (referral program)
- Diversificazione: espansione EU

#### 6. Bassa Adozione di Mercato
**Rischio**: Target market non vede valore / resiste al cambiamento
**Probabilità**: Media
**Impatto**: Critico
**Mitigazione**:
- Extensive user research pre-launch
- Free tier generoso per trial
- Customer success team proattivo
- Case studies e testimonials
- Pivot: B2B2C via software gestionali

### Rischi Legali

#### 7. GDPR Compliance
**Rischio**: Violazione privacy dati ospiti
**Probabilità**: Bassa
**Impatto**: Critico
**Mitigazione**:
- Nessun salvataggio permanente dati sensibili
- Encryption at rest e in transit
- Data retention policy (auto-delete dopo 30 giorni)
- Privacy policy chiara
- Audit GDPR annuale

#### 8. Responsabilità Legale
**Rischio**: Errori OCR causano problemi legali per hotel
**Probabilità**: Bassa
**Impatto**: Alto
**Mitigazione**:
- Disclaimer chiaro: responsabilità verifica dati è dell'utente
- Terms of Service con limitation of liability
- Insurance professionale (E&O insurance)
- "Review before submit" step obbligatorio

---

## 🎯 Success Criteria

### Milestone 1: MVP Launch (Mese 3)
- ✅ Backend + Auth funzionante
- ✅ Estensione Chrome pubblicata
- ✅ 50+ beta users registrati
- ✅ 20+ utenti attivi giornalieri
- ✅ <2% error rate su scansioni

### Milestone 2: Product-Market Fit (Mese 6)
- ✅ 100+ utenti paganti
- ✅ €2,000+ MRR
- ✅ NPS >40
- ✅ <10% monthly churn
- ✅ Almeno 3 customer testimonials

### Milestone 3: Scale (Mese 12)
- ✅ 500+ utenti paganti
- ✅ €10,000+ MRR
- ✅ Break-even raggiunto
- ✅ 2+ partnership con PMS
- ✅ Presenza su Chrome Web Store con >4.5 stelle

### Milestone 4: Market Leader (Mese 24)
- ✅ 2,000+ utenti paganti
- ✅ €40,000+ MRR
- ✅ Top 3 risultati Google per keywords target
- ✅ Riconoscimento brand nel settore
- ✅ Valutazione €2M-5M per eventuale exit/fundraising

---

## 📝 Next Steps (Immediate Actions)

### Week 1: Planning & Setup
- [ ] Review e approvazione piano SaaS
- [ ] Setup task management (Linear/Notion)
- [ ] Create technical specification document
- [ ] Setup GitHub Projects per roadmap tracking

### Week 2: Backend Foundation
- [ ] Initialize Node.js + TypeScript project
- [ ] Setup PostgreSQL database (Supabase)
- [ ] Implement database schema
- [ ] Create first API endpoints (health check, auth skeleton)

### Week 3-4: Authentication & Core API
- [ ] Complete JWT authentication
- [ ] User registration/login endpoints
- [ ] Migrate OCR logic to backend
- [ ] Setup testing environment

### Ongoing
- [ ] Weekly progress reviews
- [ ] Bi-weekly pivot/persevere decisions
- [ ] Monthly financial review
- [ ] Quarterly strategic review

---

## 📚 Appendici

### A. Competitive Landscape Research
*(To be completed con analisi dettagliata competitors)*

### B. User Personas
*(To be completed con interviste utenti)*

### C. Technical Architecture Diagrams
*(To be completed con diagrammi dettagliati)*

### D. Financial Model Spreadsheet
*(To be created in Google Sheets)*

### E. Legal Documents Templates
- Privacy Policy
- Terms of Service
- GDPR Data Processing Agreement
- Service Level Agreement (Enterprise)

---

## 📞 Contact & Ownership

**Project Owner**: Francesco Capurso (@fracabu)
**Repository**: https://github.com/fracabu/Alloggify
**Document Version**: 1.0
**Last Updated**: Ottobre 2025

---

<div align="center">

**🚀 Let's build the future of Italian hospitality management! 🏨**

*Questions? Open an issue on GitHub or reach out directly.*

</div>
