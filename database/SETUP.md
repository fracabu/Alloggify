# 📦 Vercel Postgres Setup Guide

## Step 1: Aggiungi Vercel Postgres al Progetto

### Via Vercel Dashboard (Consigliato)

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto **Alloggify** (o CheckInly)
3. Vai su **Storage** tab
4. Clicca **Create Database**
5. Seleziona **Postgres**
6. Scegli region: **Frankfurt (fra1)** o **Washington DC (iad1)** (più vicina all'Italia)
7. Click **Create**

✅ Vercel aggiungerà automaticamente queste variabili d'ambiente:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

### Via Vercel CLI (Alternativa)

```bash
# Se preferisci CLI
vercel link
vercel storage create postgres
```

---

## Step 2: Esegui lo Schema SQL

### Opzione A: Via Vercel Dashboard (Più facile)

1. Vai su **Storage** → **Postgres** → **Data**
2. Clicca **Query** tab
3. Copia e incolla tutto il contenuto di `database/schema.sql`
4. Clicca **Run Query**

### Opzione B: Via CLI Locale

```bash
# Installa Vercel Postgres CLI
npm install -g @vercel/postgres-cli

# Connettiti al database
vercel postgres connect

# Nel prompt SQL, copia e incolla lo schema.sql
\i database/schema.sql
```

### Opzione C: Script Node.js (Automatico)

Crea `scripts/init-db.ts`:

```typescript
import { sql } from '@vercel/postgres';
import fs from 'fs';

async function initDatabase() {
  console.log('🔄 Inizializzando database...');

  const schema = fs.readFileSync('./database/schema.sql', 'utf-8');

  try {
    await sql.query(schema);
    console.log('✅ Database inizializzato con successo!');
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

initDatabase();
```

Poi esegui:
```bash
npx tsx scripts/init-db.ts
```

---

## Step 3: Setup Vercel KV (Redis Cache)

1. Sempre in **Storage** tab su Vercel
2. Clicca **Create Database**
3. Seleziona **KV** (Redis)
4. Stessa region del Postgres
5. Click **Create**

✅ Vercel aggiungerà automaticamente:
```
KV_URL
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

---

## Step 4: Aggiungi Variabili d'Ambiente Manuali

Vai su **Settings** → **Environment Variables** e aggiungi:

```bash
# JWT Secret (genera una stringa random)
JWT_SECRET=your-super-secret-random-string-here-change-this

# Resend API Key (ottienilo da resend.com)
RESEND_API_KEY=re_xxxxxxxxxx

# Frontend URL
NEXT_PUBLIC_URL=https://your-domain.vercel.app
# In locale: http://localhost:3000

# Gemini API Key (già ce l'hai)
GEMINI_API_KEY=AIzaSyC-KEfGQIds27GRaRDUPjKP0vg2cccJ3ic
```

**Come generare JWT_SECRET sicuro:**
```bash
# In Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5: Setup Locale (Sviluppo)

Per testare in locale, crea `.env.local`:

```bash
# Copia le variabili da Vercel Dashboard
# Settings → Environment Variables → Show Secret

# Postgres
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
# ... (copia tutte)

# KV
KV_URL="redis://..."
KV_REST_API_URL="https://..."
# ... (copia tutte)

# Custom
JWT_SECRET="your-jwt-secret-here"
RESEND_API_KEY="re_xxxxxxxxxx"
NEXT_PUBLIC_URL="http://localhost:3000"
GEMINI_API_KEY="AIzaSyC-KEfGQIds27GRaRDUPjKP0vg2cccJ3ic"
```

---

## Step 6: Test Connessione

Crea `api/test-db.ts`:

```typescript
import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return res.status(200).json({
      success: true,
      time: result.rows[0].current_time,
      message: '✅ Database connesso!'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

Test:
```bash
# In locale
npm run dev
# Poi apri: http://localhost:3000/api/test-db

# Su Vercel (dopo deploy)
https://your-domain.vercel.app/api/test-db
```

---

## Step 7: Verifica Schema

```typescript
// api/test-schema.ts
import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    return res.status(200).json({
      success: true,
      tables: tables.rows.map(r => r.table_name)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

Dovresti vedere:
```json
{
  "success": true,
  "tables": ["users", "scans", "subscriptions", "usage_logs"]
}
```

---

## ✅ Checklist Setup Completo

- [ ] Vercel Postgres creato
- [ ] Schema SQL eseguito
- [ ] Vercel KV creato
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] `.env.local` configurato per sviluppo locale
- [ ] Test connessione database OK
- [ ] Tabelle visibili nel database

---

## 🆘 Troubleshooting

### Error: "connect ECONNREFUSED"
→ Verifica che le variabili `POSTGRES_URL` siano corrette in `.env.local`

### Error: "relation 'users' does not exist"
→ Lo schema SQL non è stato eseguito. Riesegui Step 2.

### Error: "password authentication failed"
→ Le credenziali del database sono sbagliate. Ricopia da Vercel Dashboard.

### Warning: "Unsupported engine"
→ Ignora, è solo un warning di Vite. L'app funziona.

---

## 📚 Risorse

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [@vercel/postgres NPM](https://www.npmjs.com/package/@vercel/postgres)

---

**Prossimo Step**: Creare endpoint `/api/auth/register.ts`
