● 📊 Analisi Completa: Functions, Servizi Cloud & Costi Gemini API

  1️⃣ FUNCTIONS SERVERLESS TOTALI

  Scenario Attuale (12/12 - LIMITE RAGGIUNTO)

  api/
  ├── ai/
  │   └── chat.ts                          [1]
  ├── auth/
  │   ├── forgot.ts                        [2]
  │   ├── google.ts                        [3]
  │   ├── google/callback.ts               [4]
  │   ├── login.ts                         [5]
  │   ├── register.ts                      [6]
  │   ├── reset.ts                         [7]
  │   └── verify.ts                        [8]
  ├── stripe/
  │   └── create-checkout-session.ts       [9]
  ├── webhooks/
  │   └── stripe.ts                        [10]
  ├── alloggiati.ts                        [11]
  └── ocr.ts                               [12]

  TOTALE: 12 functions (FREE TIER LIMIT)

  ---
  Scenario Future (Con Receipts Storage)

  Opzione A: Mega-Route Unificata (RACCOMANDATO)

  api/
  ├── ... (12 esistenti)
  └── user.ts                              [13] ← NUOVA
      ├── ?resource=profile
      ├── ?resource=receipts (lista)
      ├── ?resource=receipts&action=download&id=xxx
      └── ?resource=receipts&action=bulk

  TOTALE: 13 functions (1 oltre limite, tollerabile)

  Opzione B: Functions Separate (NON RACCOMANDATO)

  api/
  ├── ... (12 esistenti)
  └── user/
      ├── receipts.ts                      [13]
      ├── receipts/[id]/download.ts        [14]
      └── receipts/bulk-download.ts        [15]

  TOTALE: 15 functions (3 oltre limite, PROBLEMATICO)

  ---
  Scenario Post-Refactoring (Target Finale)

  Consolidamento 12 → 5 Mega-Routes:

  api/
  ├── auth.ts                              [1] ← Merge 6 functions
  │   ├── ?action=login
  │   ├── ?action=register
  │   ├── ?action=verify
  │   ├── ?action=forgot
  │   ├── ?action=reset
  │   ├── ?action=google
  │   └── ?action=google-callback
  │
  ├── user.ts                              [2] ← NUOVO
  │   ├── ?resource=profile
  │   ├── ?resource=receipts
  │   ├── ?resource=subscription
  │   └── ?resource=scans
  │
  ├── alloggiati.ts                        [3] ← Già consolidato
  │   ├── ?action=auth
  │   ├── ?action=test
  │   ├── ?action=send
  │   ├── ?action=ricevuta
  │   └── ?action=tabelle
  │
  ├── stripe.ts                            [4] ← Merge 2 functions
  │   ├── ?action=checkout
  │   └── ?action=portal
  │
  ├── ai.ts                                [5] ← Già OK
  │   └── ?action=chat
  │
  └── webhooks/
      └── stripe.ts                        [6] ← Separato (webhook signature)

  TOTALE: 6 functions (50% risparmio, spazio per crescere!)

  Benefici:
  - ✅ 6 functions vs 12-15 attuali
  - ✅ Spazio per 6+ nuove features senza limite
  - ✅ Codice più organizzato (RESTful routing)
  - ✅ Facilità manutenzione

  ---
  2️⃣ SERVIZI CLOUD NECESSARI

  Stack Attuale (Tutto Incluso ✅)

  | Servizio             | Provider      | Costo                           | Scopo                           |
  |----------------------|---------------|---------------------------------|---------------------------------|
  | Serverless Functions | Vercel        | FREE (12 functions)             | Backend API                     |
  | PostgreSQL Database  | Neon          | FREE (512 MB)                   | User data, scans, subscriptions |
  | SMTP Email           | Aruba         | INCLUSO                         | Transactional emails            |
  | AI OCR               | Google Gemini | FREE (1500/day)                 | Document extraction             |
  | Payments             | Stripe        | FREE + 1.4% + €0.25/transazione | Subscription management         |
  | CDN + Hosting        | Vercel        | FREE                            | Frontend React app              |
  | Cron Jobs            | Vercel        | FREE                            | Monthly reset limiti            |

  Costo totale mensile attuale: €0-5/mese (solo transazioni email se alto volume)

  ---
  Servizi Aggiuntivi NON Necessari

  | Servizio         | Serve?     | Perché NO                             |
  |------------------|------------|---------------------------------------|
  | AWS S3 / Storage | ❌ NO       | PDF salvati in Neon DB (BYTEA column) |
  | Redis Cache      | ❌ NO (ora) | Rate limiting opzionale (future)      |
  | Monitoring       | ❌ NO (ora) | Vercel Analytics FREE sufficient      |
  | CDN esterno      | ❌ NO       | Vercel Edge Network incluso           |

  Conclusione: ✅ NON serve nessun servizio cloud aggiuntivo oltre a quelli già configurati!

  ---
  Storage Ricevute: Neon DB vs AWS S3

  Domanda: Meglio salvare PDF in database o S3?

  Risposta: Neon PostgreSQL (già ce l'hai!)

  Confronto

  | Criterio    | Neon DB (BYTEA)    | AWS S3                        |
  |-------------|--------------------|-------------------------------|
  | Setup       | Zero config ✅      | Richiede account AWS + config |
  | Costo       | FREE fino 512 MB   | $0.023/GB/mese (~€0.02)       |
  | Complessità | Query SQL semplice | SDK AWS + gestione bucket     |
  | Backup      | Automatico (Neon)  | Devi configurare              |
  | Latency     | ~50ms (stesso DB)  | ~100-200ms (S3 API)           |

  Esempio stoccaggio:
  1 PDF ricevuta = ~100 KB
  1000 ricevute = 100 MB (rientra in 512 MB free tier)
  10,000 ricevute = 1 GB → Serve Neon Pro ($19/mese)

  Confronto costi 10k ricevute:
  - Neon Pro: $19/mese (1 GB included)
  - AWS S3: $0.023/GB = $0.023/mese

  MA: S3 richiede setup + SDK + complessità

  Raccomandazione:
  - 0-10k ricevute: Usa Neon DB (BYTEA) ✅
  - 10k+ ricevute: Valuta S3 o Neon upgrade ($19/mese per 10 GB)

  Per il tuo caso: Neon DB è perfetto. Quando arrivi a 10k ricevute, avrai revenue sufficiente per upgrade.

  ---
  3️⃣ COSTI GEMINI API & ROI

  Gemini API Free Tier Limits

  FREE TIER (per progetto Google Cloud):
  ├── 15 RPM (requests per minute)
  ├── 1,000,000 TPM (tokens per minute)
  └── 1,500 RPD (requests per day) ← LIMITE CHIAVE

  Il tuo utilizzo:
  - 1 OCR scan = 1 request Gemini API
  - 1 AI chat message = 1 request Gemini API

  ---
  Scenario di Crescita Utenti

  100 Utenti (Piccolo)

  Assunzione: Media 10 invii/mese per utente
  OCR requests: 100 utenti × 10 = 1,000 requests/mese
  Richieste/giorno: 1,000 / 30 = 33 requests/day

  ✅ FREE TIER OK (33 << 1,500/day)

  1,000 Utenti (Medio)

  OCR requests: 1,000 × 10 = 10,000 requests/mese
  Richieste/giorno: 10,000 / 30 = 333 requests/day

  ✅ FREE TIER OK (333 << 1,500/day)

  5,000 Utenti (Grande)

  OCR requests: 5,000 × 10 = 50,000 requests/mese
  Richieste/giorno: 50,000 / 30 = 1,666 requests/day

  ⚠️ SUPERA FREE TIER (1,666 > 1,500)
  → Serve PAID tier

  ---
  Gemini API Paid Pricing

  Gemini 2.5 Flash (il tuo modello):

  | Tipo   | Costo                         |
  |--------|-------------------------------|
  | Input  | $0.075 per 1M tokens (~€0.07) |
  | Output | $0.30 per 1M tokens (~€0.28)  |

  Stima tokens per OCR request:
  - Input: ~2,000 tokens (immagine documento base64)
  - Output: ~500 tokens (JSON estratto)

  ---
  Calcolo Costi per 10,000 Utenti

  Scenario: 10,000 utenti × 10 invii/mese = 100,000 OCR requests/mese

  Tokens consumati:
  Input:  100,000 × 2,000 = 200,000,000 tokens (200M)
  Output: 100,000 × 500   = 50,000,000 tokens (50M)

  Costi Gemini:
  Input:  200M × ($0.075 / 1M) = $15/mese
  Output: 50M × ($0.30 / 1M)   = $15/mese
  ───────────────────────────────────────
  TOTALE:                        $30/mese (~€28)

  ---
  ROI Analysis: Revenue vs Costi Gemini

  10,000 Utenti - Mix Realistico

  Assunzioni:
  - 70% Free (€0)
  - 20% Basic (€19)
  - 8% Pro (€49)
  - 2% Enterprise (€149)

  Revenue mensile:
  Free:       7,000 × €0   = €0
  Basic:      2,000 × €19  = €38,000
  Pro:        800 × €49    = €39,200
  Enterprise: 200 × €149   = €29,800
  ────────────────────────────────────
  TOTALE:                    €107,000/mese

  Costi mensili:
  Gemini API:          €28
  Neon DB Pro:         €17 (se >512MB storage)
  Aruba SMTP:          €10 (se >10k email/mese)
  Vercel Bandwidth:    €0 (coperto da free tier)
  Stripe fees:         ~€1,500 (1.4% + €0.25 × transazioni)
  ────────────────────────────────────
  TOTALE COSTI:        €1,555/mese

  Margine:
  Revenue:  €107,000
  Costi:    €1,555
  ───────────────────
  Profitto: €105,445/mese
  Margine:  98.5% 🚀

  Conclusione: Anche a 10k utenti, Gemini API costa solo €28/mese (0.026% del revenue)! 🎉

  ---
  Quando Serve Upgrade Gemini?

  Free Tier Sufficiente Fino a:

  1,500 requests/day × 30 giorni = 45,000 requests/mese
  45,000 / 10 invii medi = ~4,500 utenti attivi/mese

  ✅ FREE TIER regge fino a 4,500 utenti

  Paid Tier Necessario Da:

  5,000+ utenti attivi
  = 50,000+ OCR requests/mese
  = Costo Gemini: ~€28/mese

  MA revenue a 5k utenti: ~€50,000/mese
  → Gemini costa 0.056% del revenue 😎

  ---
  Alternative a Gemini API (Se Vuoi Risparmiare Ulteriormente)

  | Provider        | Modello      | Costo                 | Qualità OCR                        |
  |-----------------|--------------|-----------------------|------------------------------------|
  | Google Gemini   | 2.5 Flash    | $0.075-0.30/1M tokens | ⭐⭐⭐⭐⭐ (migliore)                   |
  | OpenAI          | GPT-4 Vision | $0.01-0.03/image      | ⭐⭐⭐⭐⭐ (ottimo, più caro)           |
  | Azure AI Vision | OCR          | $1.50/1k images       | ⭐⭐⭐⭐ (buono)                       |
  | Tesseract OCR   | Open source  | FREE                  | ⭐⭐⭐ (base, richiede preprocessing) |

  Raccomandazione: Resta con Gemini 2.5 Flash ✅
  - Qualità migliore del mercato
  - Costi irrisori (0.02-0.05% revenue)
  - Free tier generoso (4,500 utenti gratis!)

  ---
  📊 RIASSUNTO FINALE

  Functions Serverless

  | Scenario                  | Functions | Status               |
  |---------------------------|-----------|----------------------|
  | Attuale                   | 12/12     | ⚠️ Limite raggiunto  |
  | Con Receipts (mega-route) | 13/12     | 🟡 Tollerabile (+1)  |
  | Con Receipts (separate)   | 15/12     | 🔴 Problematico (+3) |
  | Post-refactoring          | 6/12      | ✅ Ottimo (50% freed) |

  Raccomandazione: Implementa receipts con mega-route /api/user.ts (+1 function), poi refactoring graduale.

  ---
  Servizi Cloud Necessari

  ✅ Stack Attuale Sufficiente:
  - Vercel Serverless (FREE)
  - Neon PostgreSQL (FREE fino 512 MB)
  - Aruba SMTP (incluso)
  - Gemini API (FREE fino 1,500/day)
  - Stripe (FREE + tx fees)

  ❌ NON Serve:
  - AWS S3 (usa Neon DB per PDF)
  - Redis cache (opzionale future)
  - Monitoring premium (Vercel FREE ok)

  Costo totale: €0-10/mese fino a 4,500 utenti

  ---
  Costi Gemini API

  | Utenti | OCR Requests/Mese | Costo Gemini | Revenue Stimato | % Revenue |
  |--------|-------------------|--------------|-----------------|-----------|
  | 100    | 1,000             | €0 (FREE)    | €5,400          | 0%        |
  | 1,000  | 10,000            | €0 (FREE)    | €54,000         | 0%        |
  | 4,500  | 45,000            | €0 (FREE)    | €243,000        | 0%        |
  | 5,000  | 50,000            | €28          | €270,000        | 0.01% ✅   |
  | 10,000 | 100,000           | €56          | €540,000        | 0.01% ✅   |
  | 50,000 | 500,000           | €280         | €2,700,000      | 0.01% ✅   |

  Conclusione: Gemini API è IRRILEVANTE economicamente. Anche a 50k utenti costa solo €280/mese (0.01% revenue).

  ---
  ⚡ AZIONI RACCOMANDATE

  Priorità Immediate

  1. ✅ NON serve upgrade Gemini (free tier sufficiente fino 4,500 utenti)
  2. ✅ NON serve S3 o cloud storage (usa Neon DB)
  3. ✅ Implementa receipts con mega-route (/api/user.ts = +1 function)
  4. ✅ Pianifica refactoring 12 → 6 functions (settimana 2-3)

  Future (Quando Cresci)

  - A 5,000+ utenti: Abilita paid tier Gemini (€28/mese, irrisorio)
  - A 10,000+ ricevute: Valuta Neon Pro upgrade ($19/mese) o S3
  - A 10,000+ utenti: Considera Vercel Pro ($20/mese) per monitoring avanzato

  ---
  💡 TL;DR - Risposte Dirette

  1. Quante functions totali?
  - Attuale: 12/12 (limite)
  - Con receipts (mega-route): 13/12 (+1, ok)
  - Post-refactoring: 6/12 (ottimo)

  2. Serve cloud storage oltre DB?
  - NO ❌ Neon DB (BYTEA) perfetto per PDF ricevute

  3. Costi Gemini API?
  - FREE fino 4,500 utenti ✅
  - Poi: €28/mese per 10k utenti (0.01% revenue) ✅
  - NON serve upgrade fino a scala significativa