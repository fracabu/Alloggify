 🎯 PERFETTO! Workflow Professionale Git + Vercel

  ✅ Esattamente Come Fa un Developer Serio

  Il tuo approccio è 100% corretto! 👏

  main branch (production)     → Resta funzionante
      ↓
  refactor/mega-routes branch  → Fai tutto il refactoring
      ↓
  Vercel preview deployment    → Testi in ambiente isolato
      ↓
  Tutto OK? → Merge in main    → Deploy production

  ---
  🌳 Git Branch Strategy

  Step 1: Creare Branch Refactoring

  # 1. Assicurati di essere aggiornato
  git checkout main
  git pull origin main

  # 2. Crea branch refactoring
  git checkout -b refactor/mega-routes

  # 3. Verifica branch
  git branch
  # * refactor/mega-routes
  #   main

  Step 2: Vercel Automatic Preview Deployment

  Vercel fa deploy automatico di OGNI branch! 🚀

  Quando pushdi refactor/mega-routes:
  → Vercel crea automaticamente: https://checkinly-git-refactor-mega-routes-xxx.vercel.app
  → Database: STESSO Neon DB (shared)
  → Env variables: STESSE del main branch

  Preview URL:
  Production (main):        https://checkinly.vercel.app
  Preview (refactor branch): https://checkinly-git-refactor-mega-routes-xxx.vercel.app

  ---
  📋 Piano Refactoring Completo

  Fase 1: Setup Branch + Database Schema

● Bash(git status)
  ⎿  On branch main
     Your branch is up to date with 'origin/main'.
     … +24 lines (ctrl+o to expand)

● Bash(git branch)
  ⎿  * main

● Perfetto! Hai modifiche da committare prima. Procediamo con ordine:

  Step 1: Committiamo le modifiche attuali (terminologia + docs)

  # Aggiungi tutte le modifiche
  git add .

  # Commit con messaggio descrittivo
  git commit -m "feat: update terminology scansioni→invii + add development docs

  - Update all UI text: 'scansioni' → 'invii'
  - Add DEVELOPMENT_WORKFLOW.md (local/production alignment plan)
  - Update CURRENT_STATUS.md (latest progress)
  - Add competitor analysis docs"

  # Push a main (production)
  git push origin main

  Vuoi che esegua questi comandi per te? Poi creiamo il branch refactoring. 🚀

  ---
  🏗️ Piano Completo Refactoring Branch

  Struttura Lavoro

  OGGI (main branch):
  ├── Commit modifiche attuali
  ├── Push to production
  └── Crea branch refactor/mega-routes

  BRANCH refactor/mega-routes:
  ├── 1. Crea tabella receipts (DB migration)
  ├── 2. Crea api/user.ts (receipts + profile)
  ├── 3. Crea api/auth.ts (merge 6 auth functions)
  ├── 4. Crea api/stripe.ts (merge 2 stripe functions)
  ├── 5. Rename api/ai/chat.ts → api/ai.ts
  ├── 6. Update frontend API calls
  ├── 7. Testing completo
  └── 8. Push + Vercel preview deploy

  TESTING (preview URL):
  ├── Test auth flow (login, register, forgot, reset)
  ├── Test OCR + invio schedina
  ├── Test receipts storage
  ├── Test Stripe checkout
  └── Smoke test completo

  OK? → Merge in main:
  ├── git checkout main
  ├── git merge refactor/mega-routes
  └── git push origin main → Deploy production

  ---
  📝 Checklist Refactoring Dettagliata

  Database (Schema Change)

  -- Eseguire su Neon DB (una sola volta)
  CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,

    receipt_number VARCHAR(100) NOT NULL,
    receipt_date DATE NOT NULL,
    receipt_pdf BYTEA NOT NULL,

    guest_name VARCHAR(255),
    guest_surname VARCHAR(255),
    property_name VARCHAR(255),

    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_receipts_user_date ON receipts(user_id, receipt_date DESC);
  CREATE INDEX idx_receipts_guest ON receipts(user_id, guest_surname);

  IMPORTANTE: Schema DB è SHARED tra main e preview branch!

  ---
  Functions Refactoring (12 → 6)

  1. Creare api/user.ts (NUOVA)

  // Gestisce:
  // - GET ?resource=profile
  // - GET ?resource=receipts
  // - GET ?resource=receipts&action=download&id=xxx
  // - POST ?resource=receipts&action=bulk
  // - GET ?resource=subscription
  // - GET ?resource=scans

  2. Consolidare api/auth.ts

  // Merge di:
  // - api/auth/login.ts        ❌ DELETE
  // - api/auth/register.ts     ❌ DELETE
  // - api/auth/verify.ts       ❌ DELETE
  // - api/auth/forgot.ts       ❌ DELETE
  // - api/auth/reset.ts        ❌ DELETE
  // - api/auth/google.ts       ❌ DELETE
  // - api/auth/google/callback.ts ❌ DELETE

  // In 1 solo file:
  // - api/auth.ts              ✅ NUOVO

  3. Consolidare api/stripe.ts

  // Merge di:
  // - api/stripe/create-checkout-session.ts  ❌ DELETE
  // - api/stripe/payment-success.ts (se esiste) ❌ DELETE

  // In 1 solo file:
  // - api/stripe.ts  ✅ NUOVO
  //   - ?action=checkout
  //   - ?action=portal
  //   - ?action=payment-success

  4. Rename api/ai/chat.ts → api/ai.ts

  // Rename + consolidare per future features
  // - ?action=chat
  // - (future: ?action=summarize, ?action=analyze)

  5. Mantenere Invariati

  // Questi sono già OK:
  api/alloggiati.ts  ✅ (già mega-route con ?action=)
  api/ocr.ts         ✅ (singola operazione, va bene)
  api/webhooks/stripe.ts ✅ (webhook separato, necessario)

  ---
  Frontend Updates (API Calls)

  Modifiche AuthContext.tsx

  // PRIMA:
  const response = await fetch('/api/auth/login', { ... });

  // DOPO:
  const response = await fetch('/api/auth?action=login', { ... });

  Modifiche Signup/Login Pages

  // Tutte le chiamate a /api/auth/* → /api/auth?action=*

  Modifiche Stripe Calls

  // PRIMA:
  fetch('/api/stripe/create-checkout-session')

  // DOPO:
  fetch('/api/stripe?action=checkout')

  ---
  🧪 Testing Checklist (Preview Branch)

  1. Auth Flow

  ✅ Register → Email verification → Login
  ✅ Forgot password → Reset email → Reset confirm
  ✅ Google OAuth (se configurato)
  ✅ JWT token validation

  2. OCR + SOAP API

  ✅ Upload documento → OCR extraction
  ✅ SOAP auth → Test schedina → Send
  ✅ Scan counter increment (solo su send success)

  3. Receipts Storage (NUOVO)

  ✅ Dopo invio schedina → PDF salvato in DB
  ✅ Dashboard "Le Mie Ricevute" → Lista completa
  ✅ Download singola ricevuta
  ✅ Bulk download (ZIP)
  ✅ Filtri (data, ospite)

  4. Stripe Payments

  ✅ Checkout session creation
  ✅ Webhook handling (usa Stripe CLI per testare)
  ✅ Upgrade/downgrade piano

  5. Smoke Test

  ✅ Landing page carica
  ✅ Login/Logout funziona
  ✅ Dashboard carica
  ✅ OCR funziona
  ✅ API tutte rispondono 200/401 (non 404)

  ---
  🚀 Workflow Git Completo

  Fase 1: Setup

  # Commit modifiche attuali
  git add .
  git commit -m "feat: update terminology + docs"
  git push origin main

  # Crea branch refactoring
  git checkout -b refactor/mega-routes

  Fase 2: Refactoring (nel branch)

  # Implementa tutti i cambiamenti
  # ...

  # Commit incrementali
  git add api/user.ts
  git commit -m "feat: add api/user.ts mega-route (receipts + profile)"

  git add api/auth.ts
  git commit -m "refactor: consolidate auth/* → api/auth.ts"

  git add api/stripe.ts
  git commit -m "refactor: consolidate stripe/* → api/stripe.ts"

  # ... etc

  # Push branch (Vercel fa auto-deploy preview)
  git push origin refactor/mega-routes

  Fase 3: Testing (Preview URL)

  # Vercel ti darà URL tipo:
  # https://checkinly-git-refactor-mega-routes-xxx.vercel.app

  # Testa TUTTO su preview URL
  # Se bug → Fix → Commit → Push → Vercel redeploy automatico

  Fase 4: Merge in Main

  # Quando tutto OK:
  git checkout main
  git pull origin main  # Assicurati di essere aggiornato
  git merge refactor/mega-routes

  # Risolvi eventuali conflitti
  # ...

  # Push (deploy production)
  git push origin main

  # (Opzionale) Cancella branch remoto
  git push origin --delete refactor/mega-routes

  # Cancella branch locale
  git branch -d refactor/mega-routes

  ---
  📊 Timeline Stimata

  | Fase                    | Tempo        | Dove            |
  |-------------------------|--------------|-----------------|
  | Setup branch            | 5 min        | Locale          |
  | DB schema receipts      | 10 min       | Neon Console    |
  | Crea api/user.ts        | 2-3 ore      | Branch refactor |
  | Consolida api/auth.ts   | 2-3 ore      | Branch refactor |
  | Consolida api/stripe.ts | 1-2 ore      | Branch refactor |
  | Update frontend calls   | 2-3 ore      | Branch refactor |
  | Testing preview         | 2-3 ore      | Preview URL     |
  | Fix bugs                | 1-2 ore      | Branch refactor |
  | Merge + deploy          | 15 min       | Main branch     |
  | TOTALE                  | 1.5-2 giorni | -               |

  ---
  ⚠️ Cose Importanti

  1. Database è SHARED

  Main branch: usa Neon DB production
  Refactor branch: usa STESSO Neon DB

  ⚠️ NON cancellare/modificare tabelle esistenti!
  ✅ Solo ADD nuove tabelle (receipts)

  2. Vercel Auto-Deploy

  Ogni push a qualsiasi branch → Vercel fa deploy automatico
  Main: https://checkinly.vercel.app
  Branch: https://checkinly-git-BRANCH_NAME-xxx.vercel.app

  3. Frontend Build Cache

  Se modifichi API routes ma frontend non vede cambiamenti:
  → Hard refresh (Ctrl+Shift+R)
  → Clear localStorage
  → Riapri browser

  ---
  ✅ PRONTO PER INIZIARE?

  Vuoi che proceda con:

  1. ✅ Commit modifiche attuali (terminologia + docs)
  2. ✅ Crea branch refactor/mega-routes
  3. ✅ Implementa refactoring completo (12 → 6 functions + receipts)
  4. ✅ Testing su preview URL
  5. ✅ Merge quando tutto OK

  Oppure preferisci step-by-step (ti mostro ogni file prima di scriverlo)?

  Dimmi come vuoi procedere! 🚀

  Todos
  [×] Aggiungere calcolatore tassa di soggiorno nazionale all'app
  [×] Personalizzare messaggio email di benvenuto per nuovi utenti
  [×] Proteggere endpoint /api/alloggiati con autenticazione JWT
  [×] Spostare scan counter da OCR a invio schedina (POST /api/alloggiati action=send)
  [×] Sostituire 'scansioni' con 'invii' in tutta l'app (terminologia)
  [ ] Creare tabella 'receipts' nel database Neon PostgreSQL
  [ ] Modificare /api/alloggiati per salvare ricevuta dopo invio schedina
  [ ] Creare endpoint GET /api/user/receipts (lista con filtri)
  [ ] Creare endpoint GET /api/user/receipts/:id/download
  [ ] Creare endpoint POST /api/user/receipts/bulk-download (ZIP)
  [ ] Creare pagina ReceiptsPage.tsx con tabella e filtri
  [ ] Aggiungere route /dashboard/receipts in App.tsx
  [ ] Aggiungere link 'Le Mie Ricevute' nel navbar dashboard
  [ ] Testing: salvare ricevuta dopo invio schedina
  [ ] Testing: filtri ricerca ricevute (ospite, data)
  [ ] Setup Stripe: creare prodotti con Price IDs corretti
  [ ] Implementare bottone Upgrade nel dashboard utente
  [ ] Implementare Stripe Customer Portal per gestione abbonamento
  [ ] Implementare cron job per reset mensile limiti invii