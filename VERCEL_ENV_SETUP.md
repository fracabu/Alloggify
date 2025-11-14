# ⚙️ Configurazione Variabili d'Ambiente su Vercel

Prima di testare l'app in produzione, verifica che queste variabili siano configurate nel **Vercel Dashboard**.

## 📍 Dove configurarle

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto **Alloggify** (o CheckInly)
3. Vai su **Settings** → **Environment Variables**

---

## 🔑 Variabili OBBLIGATORIE

### 1. Frontend URL
```
NEXT_PUBLIC_URL=https://TUO_DOMINIO.vercel.app
```
**Importante:** Sostituisci `TUO_DOMINIO` con l'URL effettivo del deploy (es. `checkinly.vercel.app`)

### 2. JWT Secret
```
JWT_SECRET=024f0841814d132f293f938bedc56439f8a109031fffcffb02a4648195606cc3
```

### 3. Resend API Key
```
RESEND_API_KEY=re_b4CV5rcc_BC2F4S76wuMFLgPS54QmEYcM
```

### 4. Gemini API Key
```
GEMINI_API_KEY=AIzaSyC-KEfGQIds27GRaRDUPjKP0vg2cccJ3ic
```

### 5. Backend URL (stesso del frontend)
```
VITE_BACKEND_URL=https://TUO_DOMINIO.vercel.app
```

---

## 🗄️ Database Postgres (Neon)

Se hai collegato il database Neon tramite Vercel Marketplace, queste variabili dovrebbero essere **già configurate automaticamente**:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Verifica:** Vai su Settings → Environment Variables e controlla che ci siano variabili con prefisso `POSTGRES_*`.

---

## ✅ Checklist Pre-Deploy

- [ ] `NEXT_PUBLIC_URL` configurato con URL produzione
- [ ] `JWT_SECRET` presente
- [ ] `RESEND_API_KEY` presente
- [ ] `GEMINI_API_KEY` presente
- [ ] `VITE_BACKEND_URL` configurato (stesso di NEXT_PUBLIC_URL)
- [ ] Variabili `POSTGRES_*` presenti (dovrebbero esserci automaticamente)

---

## 🚀 Dopo il Deploy

1. **Primo deploy:** Vercel potrebbe chiederti di confermare le variabili
2. **Test registrazione:** Vai su `https://tuo-dominio.vercel.app/signup`
3. **Verifica email:** Controlla che arrivi l'email di verifica da Resend
4. **Controlla logs:** Settings → Deployments → Latest → Function Logs

---

## ⚠️ Note Importanti

- **NON** committare `.env.local` su Git (è già in `.gitignore`)
- Le variabili con prefisso `NEXT_PUBLIC_*` e `VITE_*` sono esposte al client
- Le altre variabili (JWT_SECRET, RESEND_API_KEY) sono accessibili solo lato server
- Ogni modifica alle env vars richiede un **redeploy**

---

## 🐛 Troubleshooting

**Errore 500 sugli endpoint API?**
→ Controlla Function Logs nel Vercel Dashboard

**Email non arrivano?**
→ Verifica RESEND_API_KEY e controlla dashboard Resend

**Database connection error?**
→ Verifica che le variabili POSTGRES_* siano presenti
