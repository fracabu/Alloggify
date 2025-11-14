# Stripe Integration Setup Guide

Guida completa per configurare Stripe e abilitare i pagamenti su CheckInly.

---

## 📋 Prerequisiti

- Account Stripe (creato su https://stripe.com)
- Accesso al Stripe Dashboard
- Vercel project deployato (per configurare webhook)

---

## 🚀 Passo 1: Creare Account Stripe

1. Vai su https://stripe.com
2. Clicca **"Start now"**
3. Completa la registrazione con email aziendale
4. Verifica l'email

---

## 💳 Passo 2: Configurare Prodotti e Prezzi

### A. Accedi al Stripe Dashboard

https://dashboard.stripe.com

### B. Crea i Prodotti

Vai su **Products** → **Add product**

#### Prodotto 1: CheckInly Basic

- **Name**: CheckInly Basic
- **Description**: 100 scansioni documenti al mese con API Alloggiati Web
- **Pricing**:
  - **Type**: Recurring
  - **Price**: €19.00 EUR
  - **Billing period**: Monthly
- Clicca **Save product**
- **COPIA IL PRICE ID** (formato: `price_1ABC...XYZ`) → Lo useremo dopo

#### Prodotto 2: CheckInly Pro

- **Name**: CheckInly Pro
- **Description**: 500 scansioni documenti al mese con AI Assistant e analytics
- **Pricing**:
  - **Type**: Recurring
  - **Price**: €49.00 EUR
  - **Billing period**: Monthly
- Clicca **Save product**
- **COPIA IL PRICE ID**

#### Prodotto 3: CheckInly Enterprise

- **Name**: CheckInly Enterprise
- **Description**: Scansioni illimitate con supporto dedicato e multi-utente
- **Pricing**:
  - **Type**: Recurring
  - **Price**: €199.00 EUR
  - **Billing period**: Monthly
- Clicca **Save product**
- **COPIA IL PRICE ID**

---

## 🔑 Passo 3: Configurare Environment Variables

### A. Ottieni le API Keys

1. Stripe Dashboard → **Developers** → **API keys**
2. **Test Mode** (per development):
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`
3. **Live Mode** (per production):
   - Secret key: `sk_live_...`
   - Publishable key: `pk_live_...`

### B. Aggiungi a `.env.local`

```env
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (copia da Step 2)
STRIPE_PRICE_BASIC=price_1ABC...XYZ
STRIPE_PRICE_PRO=price_1DEF...UVW
STRIPE_PRICE_ENTERPRISE=price_1GHI...RST
```

### C. Aggiungi a Vercel Environment Variables

1. Vercel Dashboard → Il tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi le stesse variabili:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_BASIC`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_ENTERPRISE`
3. Imposta **Environment**: Production, Preview, Development
4. Clicca **Save**

---

## 🔔 Passo 4: Configurare Webhook

I webhook permettono a Stripe di notificare la tua app quando avvengono eventi (pagamenti, cancellazioni, etc.).

### A. Crea Webhook Endpoint

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Clicca **Add endpoint**
3. **Endpoint URL**:
   - **Production**: `https://tuodominio.vercel.app/api/webhooks/stripe`
   - **Development**: `http://localhost:3000/api/webhooks/stripe` (per testing locale)
4. **Description**: CheckInly Subscription Events
5. **Events to send**: Seleziona:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
6. Clicca **Add endpoint**

### B. Ottieni Webhook Secret

1. Dopo aver creato il webhook, clicca sul webhook nella lista
2. **Signing secret** → Clicca **Reveal**
3. Copia il webhook secret (formato: `whsec_...`)

### C. Aggiungi Webhook Secret a Environment Variables

**`.env.local`**:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Vercel Environment Variables**:
- Nome: `STRIPE_WEBHOOK_SECRET`
- Valore: `whsec_...`
- Environment: Production, Preview, Development

---

## 🧪 Passo 5: Testing (Test Mode)

### A. Test Checkout Flow

1. Avvia l'app localmente:
   ```bash
   npm run dev
   ```
2. Registrati/Login
3. Vai su `/pricing`
4. Clicca **"Upgrade"** su un piano (Basic/Pro/Enterprise)
5. Verrai reindirizzato a Stripe Checkout

### B. Usa Carte di Test Stripe

Stripe fornisce carte di test per simulare pagamenti:

**Carte di Successo**:
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard
- Data di scadenza: qualsiasi data futura (es. `12/34`)
- CVC: qualsiasi 3 cifre (es. `123`)

**Carte di Errore** (per testare failure):
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

**Guida completa**: https://stripe.com/docs/testing

### C. Verifica Webhook Localmente

**Opzione 1: Stripe CLI** (consigliato)

1. Installa Stripe CLI:
   ```bash
   # Windows (con Scoop)
   scoop install stripe

   # Mac (con Homebrew)
   brew install stripe/stripe-cli/stripe

   # Linux
   # Download da https://github.com/stripe/stripe-cli/releases
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks al tuo localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Questo comando ti darà un **webhook signing secret** per testing locale. Copialo e usalo in `.env.local`.

**Opzione 2: Ngrok / Cloudflare Tunnel**

Se non vuoi usare Stripe CLI, puoi esporre il tuo localhost con ngrok e configurare il webhook su quell'URL.

### D. Verifica Eventi nel Dashboard

1. Stripe Dashboard → **Developers** → **Events**
2. Dovresti vedere gli eventi:
   - `checkout.session.completed` quando completi un pagamento test
   - `invoice.payment_succeeded` per pagamenti ricorrenti
3. Clicca su un evento → **Webhook** tab → Verifica che sia stato inviato correttamente

---

## 🚀 Passo 6: Go Live (Production Mode)

### A. Completa Stripe Activation

1. Stripe Dashboard → **Complete account setup**
2. Compila:
   - Business details
   - Banking information (per ricevere pagamenti)
   - Identity verification
3. Aspetta approvazione (solitamente 1-2 giorni)

### B. Crea Prodotti in Live Mode

1. Stripe Dashboard → Switch to **Live mode** (toggle in alto a destra)
2. Ripeti **Passo 2** per creare i prodotti in Live mode
3. Copia i **Live Price IDs**

### C. Aggiorna Environment Variables in Production

**Vercel Dashboard**:
1. Settings → Environment Variables
2. Aggiorna con le **Live keys**:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_PRICE_BASIC` → `price_live_...`
   - `STRIPE_PRICE_PRO` → `price_live_...`
   - `STRIPE_PRICE_ENTERPRISE` → `price_live_...`
3. Imposta **Environment**: Solo **Production**

### D. Configura Webhook in Live Mode

1. Stripe Dashboard (Live mode) → Developers → Webhooks
2. Add endpoint:
   - URL: `https://tuodominio.vercel.app/api/webhooks/stripe`
   - Events: Same as test mode
3. Copia **Live Webhook Secret** → Aggiornalo in Vercel Environment Variables (solo Production)

### E. Redeploy

```bash
git add .
git commit -m "Configure Stripe Live mode"
git push
```

Vercel farà auto-deploy e le nuove environment variables saranno attive.

---

## ✅ Checklist Finale

**Development (Test Mode)**:
- [ ] Account Stripe creato
- [ ] 3 prodotti creati in Test mode (Basic, Pro, Enterprise)
- [ ] Price IDs copiati
- [ ] Secret key e Publishable key copiati
- [ ] Environment variables configurati in `.env.local`
- [ ] Webhook endpoint creato con URL localhost
- [ ] Webhook secret copiato
- [ ] Test checkout completato con carta di test
- [ ] Webhook events ricevuti correttamente

**Production (Live Mode)**:
- [ ] Stripe account activation completato
- [ ] Banking information verificata
- [ ] 3 prodotti creati in Live mode
- [ ] Live Price IDs copiati
- [ ] Live Secret key e Publishable key copiati
- [ ] Environment variables aggiornati in Vercel (Production only)
- [ ] Webhook endpoint creato con URL production
- [ ] Live Webhook secret copiato
- [ ] App redeployed con Live keys
- [ ] Test checkout con carta reale completato
- [ ] Email confirmation ricevuta

---

## 🔧 Troubleshooting

### Webhook non ricevuti

**Problema**: Gli eventi Stripe non arrivano al tuo endpoint.

**Soluzione**:
1. Verifica URL webhook in Stripe Dashboard
2. Controlla che `STRIPE_WEBHOOK_SECRET` sia corretto
3. Verifica logs in Vercel Dashboard → Functions → `/api/webhooks/stripe`
4. Usa Stripe CLI per debugging locale: `stripe listen --forward-to ...`

### "Signature verification failed"

**Problema**: Il webhook secret non corrisponde.

**Soluzione**:
1. Vai su Stripe Dashboard → Webhooks → Il tuo endpoint
2. Clicca **Reveal** su Signing secret
3. Copia il secret e aggiornalo in `.env.local` e Vercel
4. Redeploy

### Pagamento completato ma subscription non aggiornato

**Problema**: Il webhook `checkout.session.completed` non aggiorna il database.

**Soluzione**:
1. Verifica che `client_reference_id` o `metadata.userId` sia impostato correttamente nel checkout session
2. Controlla i logs della funzione webhook in Vercel
3. Verifica che il database sia accessibile dalla funzione serverless

### Errore "Stripe API key invalid"

**Problema**: Le keys Stripe non sono corrette o mancano.

**Soluzione**:
1. Verifica che `STRIPE_SECRET_KEY` sia impostato correttamente
2. Assicurati di usare `sk_test_...` in development e `sk_live_...` in production
3. Controlla di non aver copiato spazi extra o caratteri nascosti

---

## 📚 Risorse

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Subscription Lifecycle**: https://stripe.com/docs/billing/subscriptions/overview

---

## 🎉 Prossimi Passi

Dopo aver configurato Stripe:
1. ✅ Testa il flow completo: registrazione → upgrade → OCR con limiti
2. ✅ Aggiungi bottone "Upgrade" nel dashboard
3. ✅ Implementa Stripe Customer Portal (per gli utenti che vogliono gestire il loro abbonamento)
4. ✅ Aggiungi email templates per conferma upgrade

---

**Hai domande?** Consulta la documentazione Stripe o contatta il supporto Stripe (disponibile 24/7 via chat).
