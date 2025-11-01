# 🚀 Deployment Guide - Alloggify Backend

## ✅ Cosa abbiamo fatto

Abbiamo creato un **backend Express dedicato** per risolvere i problemi con le Vercel serverless functions.

### Struttura creata:
```
server/
├── index.js              # Entry point Express
├── package.json          # Dependencies
├── routes/
│   ├── auth.js          # POST /api/alloggiati/auth
│   ├── test.js          # POST /api/alloggiati/test
│   ├── send.js          # POST /api/alloggiati/send
│   └── ricevuta.js      # POST /api/alloggiati/ricevuta
└── utils/
    └── soap.js          # SOAP utilities
```

### ✅ Test locale completato

Il server funziona perfettamente in locale:
- Server: `http://localhost:3001`
- Test: `node test-local-server.js`
- Risultato: ✅ Token generato con successo

## 🌐 Deploy su Railway (Consigliato)

### Perché Railway?
- ✅ Free tier generoso (500 ore/mese)
- ✅ Deploy automatico da GitHub
- ✅ HTTPS gratuito
- ✅ Regione Europa disponibile
- ✅ Zero configurazione necessaria

### Passi:

1. **Vai su Railway**
   - https://railway.app
   - Fai login con GitHub

2. **Crea nuovo progetto**
   - Clicca "New Project"
   - Seleziona "Deploy from GitHub repo"
   - Scegli il repository `fracabu/Alloggify`

3. **Railway rileva automaticamente il config**
   - Legge `railway.json`
   - Installa le dipendenze in `server/`
   - Avvia il server

4. **Ottieni l'URL del backend**
   - Railway ti darà un URL tipo: `https://alloggify-production-xxxx.up.railway.app`
   - Copia questo URL

5. **Configura il frontend**
   - Vai su Vercel → Progetto Alloggify → Settings → Environment Variables
   - Aggiungi: `VITE_BACKEND_URL` = `https://alloggify-production-xxxx.up.railway.app`
   - Redeploy il frontend

6. **Test**
   - Apri la tua app su Vercel
   - Prova il login
   - Dovrebbe funzionare! ✅

## 🟢 Deploy su Render (Alternativa)

### Passi:

1. **Vai su Render**
   - https://render.com
   - Fai login con GitHub

2. **Crea Web Service**
   - Clicca "New +" → "Web Service"
   - Connetti il repository GitHub
   - Seleziona `fracabu/Alloggify`

3. **Render rileva automaticamente**
   - Legge `render.yaml`
   - Configura automaticamente

4. **Clicca "Create Web Service"**
   - Render fa il build e deploy
   - Ti dà un URL tipo: `https://alloggify-backend.onrender.com`

5. **Configura frontend** (come sopra con Railway)

## 🧪 Test dopo il deploy

### Test con curl (da terminale):

```bash
curl -X POST https://YOUR-BACKEND-URL/api/alloggiati/auth \
  -H "Content-Type: application/json" \
  -d '{
    "utente": "RM047548",
    "password": "20p07s6s",
    "wskey": "AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw=="
  }'
```

### Test con script:

```bash
node test-vercel-api.js https://YOUR-BACKEND-URL
```

Dovresti vedere:
```
✅ SUCCESS! API is working
   Token (first 20 chars): ...
```

## 📊 Architettura finale

```
┌─────────────────┐
│  Vercel         │  Frontend React + Vite
│  (Frontend)     │  https://alloggify.vercel.app
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Railway/Render │  Backend Express + Node.js
│  (Backend)      │  https://alloggify-production.railway.app
└────────┬────────┘
         │ SOAP 1.2
         ▼
┌─────────────────┐
│  Polizia        │  Alloggiati Web Service
│  di Stato       │  https://alloggiatiweb.poliziadistato.it
└─────────────────┘
```

## 🔧 Troubleshooting

### Il frontend non si connette al backend

1. Controlla che `VITE_BACKEND_URL` sia configurata su Vercel
2. Verifica che il backend sia online: `https://YOUR-BACKEND-URL/health`
3. Controlla i log su Railway/Render

### Errore CORS

Il backend è già configurato per accettare richieste da:
- `https://alloggify.vercel.app`
- Tutti i domini `*.vercel.app`
- `localhost` (per development)

### Backend offline su Railway

Railway free tier: 500 ore/mese = ~20 giorni
Se finisci le ore, il backend si spegne.
Upgrade a $5/mese per ore illimitate.

## 💰 Costi

- **Frontend (Vercel)**: Gratis
- **Backend (Railway)**: Gratis (500h/mese) o $5/mese
- **Backend (Render)**: Gratis (ma più lento) o $7/mese

## 🎯 Prossimi passi

Dopo il deploy, nella roadmap SaaS:
1. Aggiungere PostgreSQL database
2. Implementare autenticazione JWT
3. Aggiungere Stripe per i pagamenti
4. Multi-tenancy per hotel chains

Vedi `SAAS_PLAN.md` per dettagli.
