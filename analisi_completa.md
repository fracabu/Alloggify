● 📊 CheckInly - Analisi Completa dell'App

  ✅ FEATURES IMPLEMENTATE

  🔐 Autenticazione & User Management

  - Registrazione: Email + password → Email verification obbligatoria (24h token)
  - Login/Logout: JWT con access token (7 giorni) + refresh token (30 giorni)
  - Password Reset: Flow completo con email + token temporaneo
  - Session Management: sessionStorage (auto-logout alla chiusura browser)
  - Protected Routes: Dashboard accessibile solo se autenticato

  📄 OCR & Document Processing (CORE FEATURE)

  - Upload immagine: Drag & drop o click (supporta tutti i formati immagine)
  - AI OCR: Google Gemini 2.5 Flash estrae dati in <2 secondi
  - Documenti supportati:
    - Carta Identità (vecchia/nuova/elettronica)
    - Passaporti (EU/extra-EU)
    - Patenti guida
  - Accuratezza: 99.2%
  - Auto-fill form: Campi compilati automaticamente (cognome, nome, sesso, data nascita, luogo nascita, cittadinanza, tipo/numero documento)
  - Revisione manuale: Utente può modificare qualsiasi campo prima dell'invio

  🌐 SOAP API Integration (Alloggiati Web)

  - Autenticazione WSKEY: Genera token temporaneo per sessione (30-60 min)
  - Test Schedina: Validazione pre-invio (verifica campi obbligatori/formati)
  - Invio Schedina: POST diretto al portale Polizia via API SOAP ufficiali
  - Download Ricevuta: PDF ufficiale Questura post-invio
  - Gestione Token: Auto-refresh su scadenza (401/403)

  💳 Subscription System (SaaS)

  4 Piani:
  - Free: 5 invii/mese, no carta richiesta, permanente
  - Basic: 100 invii/mese, €15/mese (€19 visualizzato ma prezzo reale €15)
  - Pro: 500 invii/mese, €39/mese (€49 visualizzato ma prezzo reale €39)
  - Enterprise: Illimitato, €199/mese (non mostrato in UI)

  Stripe Integration:
  - Checkout session (redirect a Stripe)
  - Webhook handler per 4 eventi:
    - checkout.session.completed → Upgrade piano
    - invoice.payment_succeeded → Rinnovo + reset scan_count
    - customer.subscription.deleted → Downgrade a Free
    - customer.subscription.updated → Update status

  Limiti & Tracking:
  - ✅ Scan counter incrementato su invio schedina (non più su OCR - FIXATO)
  - ✅ Blocco invii se limite raggiunto
  - ✅ Endpoint /api/ocr protetto con JWT + check limiti
  - ✅ Endpoint /api/alloggiati protetto con JWT (FIXATO)

  🎨 Frontend

  - Landing Page: Hero, Features, Pricing, FAQ, Testimonials, News
  - Dashboard: Upload, Form, API credentials panel, AI chat widget
  - News Section: Lista articoli + dettaglio (markdown-like rendering)
  - Responsive: Mobile-first, funziona su tablet/smartphone
  - Chrome Extension: Auto-fill su portale Alloggiati Web (Method A - client-side)

  📧 Email System

  - Provider: Aruba SMTP via Nodemailer (STARTTLS port 587)
  - Email inviate:
    - Welcome email post-registrazione (con link verifica)
    - Email verification
    - Password reset
    - (MANCA: upgrade confirmation, invoice, cancellation)

  💾 Database (Neon PostgreSQL)

  - Tabelle: users, scans, subscriptions, usage_logs
  - Features: UUID primary keys, JSONB, trigger auto-updated_at, indexing
  - Multi-tenant: Isolamento utenti, scan history per user

  🤖 AI Chat Assistant

  - Model: Gemini 2.5 Flash (FREE, 1500 req/day)
  - Expertise: Alloggiati Web, normative D.Lgs. 286/1998, troubleshooting
  - UI: Floating widget, chat history, suggested questions

  ---
  ⚠️ CRITICITÀ ATTUALI

  🔴 CRITICHE (Blockers)

  1. Stripe Price IDs sono Placeholder
    - lib/pricing.ts usa price_xxx hardcoded
    - BLOCCA: Upgrade non funziona in produzione
    - Fix: Creare prodotti reali su Stripe Dashboard, sostituire IDs
  2. Nessun Upgrade Button nel Dashboard
    - Utente deve andare a /upgrade manualmente (no CTA visibile)
    - IMPATTO: Bassa conversione Free → Paid
    - Fix: Aggiungere banner/bottone "Upgrade" quando vicino a limite
  3. Nessun Customer Portal (Stripe)
    - Utente non può:
        - Cancellare abbonamento
      - Cambiare metodo pagamento
      - Vedere invoice history
    - IMPATTO: Richieste supporto manuali
    - Fix: Implementare stripe.billingPortal.sessions.create()
  4. Nessun Cron Job per Reset Mensile
    - scan_count non si resetta automaticamente ogni mese
    - IMPATTO: Utenti bloccati anche se abbonamento rinnovato
    - Fix: Vercel Cron Job giornaliero che resetta scan_count se last_reset_date < inizio mese

  🟡 MEDIE (UX/Completezza)

  5. User Dashboard API Mancanti
    - Endpoint per:
        - GET /api/user/profile (dati utente)
      - GET /api/user/scans (cronologia invii)
      - GET /api/user/subscription (dettagli piano)
      - PATCH /api/user/profile (update dati)
    - IMPATTO: Dashboard mostra solo dati base (no history, no analytics)
  6. Usage Indicator Poco Visibile
    - C'è solo nell'header mobile/desktop (X/Y invii)
    - MANCA: Progress bar, warning quando vicino a limite, promemoria upgrade
  7. Email Transazionali Incomplete
    - MANCA:
        - Email conferma upgrade
      - Invoice PDF allegato
      - Email cancellazione abbonamento
      - Email reminder limite raggiunto
  8. Nessun Test Automatizzato
    - No unit tests, no integration tests, no E2E
    - IMPATTO: Regressioni non rilevate, deploy rischioso
    - Fix: Vitest + Playwright

  🟢 MINORI (Nice-to-Have)

  9. Admin Dashboard Mancante
    - Nessuna UI per:
        - Vedere lista utenti
      - Analytics (revenue, churn, usage)
      - Gestione piani manuale
    - IMPATTO: Gestione business manuale via DB
  10. Rate Limiting Assente
    - API non protette da abusi (spam registrazioni, brute force, DDoS)
    - Fix: Vercel Edge Config + Upstash Redis per rate limiting
  11. Analytics/Tracking Mancanti
    - No Google Analytics, Mixpanel, Posthog
    - IMPATTO: Non sai cosa fanno gli utenti, dove droppano, conversioni

  ---
  🚧 COSA MANCA DA FARE (Priority Order)

  P0 - BLOCKERS (Da fare SUBITO)

  1. ✅ Terminologia scansioni → invii (FATTO)
  2. Stripe Setup Reale:
    - Creare prodotti Basic/Pro su dashboard.stripe.com
    - Copiare Price IDs reali in lib/pricing.ts
    - Configurare webhook endpoint in Stripe (firma secret)
  3. Bottone Upgrade nel Dashboard:
    - Banner "Upgrade to Pro" quando utente usa 80%+ limite
    - Link diretto /upgrade?reason=scan_limit

  P1 - CORE UX (Settimana 1-2)

  4. Stripe Customer Portal:
    - Endpoint POST /api/stripe/create-portal-session
    - Link "Gestisci Abbonamento" nel dashboard
  5. Cron Job Reset Mensile:
    - vercel.json → "crons": [{"path": "/api/cron/reset-limits", "schedule": "0 0 * * *"}]
    - Logica: UPDATE users SET scan_count = 0 WHERE last_reset_date < (inizio mese corrente)
  6. Usage Indicator Migliorato:
    - Progress bar nel dashboard
    - Warning toast quando 80%/90%/100% limite
    - CTA upgrade inline

  P2 - FEATURES COMPLETE (Settimana 3-4)

  7. User Dashboard API:
    - GET /api/user/profile, /scans, /subscription
    - Frontend: Pagina "Account" con tab (Profilo, Cronologia, Abbonamento)
  8. Email Transazionali:
    - Template HTML (Handlebars/Mjml)
    - Email upgrade success
    - Invoice attachment
    - Reminder limiti
  9. Testing E2E:
    - Playwright: Registrazione → Login → Upload → Invio → Upgrade
    - Stripe test mode

  P3 - SCALE & OPTIMIZE (Future)

  10. Admin Dashboard:
    - React Admin / Retool
    - Metriche: MRR, churn, utenti attivi, invii/giorno
  11. Rate Limiting:
    - Upstash Redis + @upstash/ratelimit
    - 10 req/min per IP (auth), 100 req/hour (OCR)
  12. Analytics:
    - PostHog/Mixpanel per funnels
    - Stripe Analytics per revenue

  ---
  💡 OPPORTUNITÀ / SUGGERIMENTI

  1. Onboarding Migliorato: Tour guidato primo login (Intro.js)
  2. Referral Program: "Invita un amico, ottieni 10 invii gratis"
  3. API Pubblica: Esporre /api/ocr come API esterna (monetizzabile)
  4. Integrazione PMS: Zapier/Make.com per integrarsi con Booking.com, Airbnb
  5. Mobile App: React Native per esperienza nativa
  6. Multi-lingua: i18n (EN, DE, FR per mercato EU)

  ---
  In sintesi: L'app è 85% completa come SaaS MVP. Le criticità principali sono:
  - ❌ Stripe non configurato (blocca revenue)
  - ❌ No self-service per utenti (alto carico supporto)
  - ❌ No automazioni (reset mensile, email)

  Priority: Stripe setup → Customer Portal → Cron job → Dashboard API → Testing. 🚀