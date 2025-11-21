# 📧 Setup SendGrid per Beta Testing

Guida rapida per configurare SendGrid e permettere ai beta tester di ricevere email di verifica.

## ✅ SOLUZIONE IMPLEMENTATA

Ho modificato il codice per supportare **sia SendGrid che Resend** tramite un wrapper unificato (`lib/email.ts`).

**Vantaggi SendGrid per Beta:**
- ✅ **100 email/giorno GRATIS** (permanente)
- ✅ **Nessun dominio richiesto** per iniziare
- ✅ Email inviate a **qualsiasi indirizzo** (non solo quelli verificati)
- ✅ Perfetto per 10-20 beta tester al giorno

---

## 🚀 Setup SendGrid (10 minuti)

### Step 1: Crea Account SendGrid

1. Vai su: https://signup.sendgrid.com/
2. Compila il form di registrazione
3. Verifica la tua email
4. Completa il questionario iniziale:
   - **Role**: Developer
   - **Company Size**: 1-10
   - **Purpose**: Email Verification / Transactional Emails

### Step 2: Crea API Key

1. Vai su: **Settings → API Keys**
2. Click **"Create API Key"**
3. Nome: `CheckInly Production`
4. Permessi: **Full Access** (o "Restricted Access" con solo "Mail Send" abilitato)
5. Click **"Create & View"**
6. **COPIA LA CHIAVE** (inizia con `SG.`)
   - ⚠️ La vedrai solo una volta!
   - Salvala subito in `.env.local`

### Step 3: Verifica Single Sender

1. Vai su: **Settings → Sender Authentication**
2. Click **"Get Started"** nella sezione **Single Sender Verification**
3. Compila il form:
   - **From Name**: CheckInly
   - **From Email Address**: La tua email personale (es. `tuonome@gmail.com`)
   - **Reply To**: Stessa email
   - **Company Address**: Un indirizzo qualsiasi (anche fittizio per test)
4. Click **"Create"**
5. **Controlla la tua email** e clicca sul link di verifica

### Step 4: Configura `.env.local`

Apri `.env.local` e aggiungi/modifica:

```env
# ==========================================
# EMAIL SERVICE
# ==========================================
EMAIL_PROVIDER=sendgrid

# SENDGRID
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=tuonome@gmail.com  # L'email che hai verificato
SENDGRID_FROM_NAME=CheckInly
```

### Step 5: Installa Dipendenza

```bash
npm install @sendgrid/mail
```

### Step 6: Testa!

1. **Riavvia i server**:
   ```bash
   npm run dev
   ```

2. **Registra un nuovo utente** con un'email qualsiasi (non la tua):
   - Vai su: http://localhost:3000/signup
   - Registrati con email di un amico/collega
   - L'email di verifica dovrebbe arrivare in pochi secondi!

3. **Controlla i log** nel terminale:
   ```
   ✅ [SendGrid] Email sent to test@example.com
   ```

---

## 🔄 Come Tornare a Resend (Quando Hai il Dominio)

Quando compri il dominio (es. `checkinly.it`):

1. **Configura dominio su Resend**:
   - Vai su Resend Dashboard → Domains
   - Aggiungi il dominio
   - Configura i record DNS (Resend ti guida)

2. **Modifica `.env.local`**:
   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM_EMAIL=CheckInly <noreply@checkinly.it>
   ```

3. **Riavvia i server** - fatto! Nessun cambio di codice richiesto.

---

## 🐛 Troubleshooting

### Errore: "The from address does not match a verified Sender Identity"

**Problema**: Email sender non verificata.

**Soluzione**:
1. Controlla che `SENDGRID_FROM_EMAIL` sia **esattamente** l'email verificata in Single Sender
2. Ricontrolla la Single Sender Verification in Settings → Sender Authentication
3. Verifica che l'email non abbia spazi extra

### Errore: "Forbidden"

**Problema**: API Key non valida o senza permessi.

**Soluzione**:
1. Rigenera l'API Key con **Full Access** o **Mail Send**
2. Copia la nuova chiave in `.env.local`
3. Riavvia i server

### Email non arriva

**Checklist**:
1. Controlla la **cartella SPAM** del destinatario
2. Verifica i log nel terminale (deve apparire "✅ Email sent")
3. Vai su SendGrid Dashboard → Activity → Email Activity
4. Cerca l'email inviata e controlla lo stato

### Limite 100 email/giorno raggiunto

**Soluzione temporanea**:
1. Usa un secondo account SendGrid (altro indirizzo email)
2. Oppure upgrade a SendGrid Essentials ($19.95/mese per 50k email)

**Soluzione definitiva**:
1. Compra dominio (~10€/anno)
2. Passa a Resend (100 email/giorno, ma con dominio custom)

---

## 📊 Monitoraggio Invio Email

### SendGrid Dashboard

**Activity Feed**: https://app.sendgrid.com/email_activity

Qui puoi vedere:
- ✅ Email inviate con successo
- ❌ Email rifiutate (bounce, spam)
- 📊 Statistiche click/open (se abilitate)

### Vercel Logs (Production)

Quando fai deploy su Vercel:
1. Vai su Vercel Dashboard → Functions
2. Seleziona la funzione `api/auth/register`
3. Controlla i log per vedere:
   ```
   ✅ [SendGrid] Email sent to user@example.com
   ```

---

## 💰 Quando Passare a Piano Paid?

**SendGrid Free**: 100 email/giorno (3,000/mese)
- ✅ Sufficiente per: 10-20 registrazioni/giorno
- ✅ Perfetto per: Beta testing, primi 100-200 utenti

**SendGrid Essentials**: $19.95/mese (50,000 email/mese)
- Quando superi 100 email/giorno costantemente
- Quando hai 500+ utenti attivi

**Resend con Dominio**: €0/mese (100 email/giorno)
- Quando compri dominio
- Deliverability migliore con dominio custom

---

## ✅ Checklist Pre-Launch

- [ ] SendGrid API Key configurata
- [ ] Single Sender verificato
- [ ] `.env.local` aggiornato con EMAIL_PROVIDER=sendgrid
- [ ] Dipendenza `@sendgrid/mail` installata
- [ ] Test registrazione utente completato
- [ ] Email ricevuta correttamente
- [ ] Link verifica funzionante
- [ ] Email password reset testata

---

## 🎯 Prossimi Passi

1. **Completa setup SendGrid** (10 min)
2. **Testa registrazione** con email di prova
3. **Invita 5-10 beta tester** per feedback
4. **Monitora Activity Feed** SendGrid
5. **Quando pronto**: Compra dominio e passa a Resend

---

**Hai domani il sistema email funzionante per i beta tester!** 🚀
