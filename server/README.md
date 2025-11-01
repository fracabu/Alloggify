# Alloggify Backend Server

Backend Express per l'integrazione SOAP con il portale Alloggiati Web della Polizia di Stato.

## 🚀 Quick Start

### Local Development

```bash
cd server
npm install
npm start
```

Il server parte su `http://localhost:3001`

### Test

```bash
# Dalla root del progetto
node test-local-server.js
```

## 📡 API Endpoints

- `POST /api/alloggiati/auth` - Genera token autenticazione
- `POST /api/alloggiati/test` - Testa schedina prima dell'invio
- `POST /api/alloggiati/send` - Invia schedina al portale
- `POST /api/alloggiati/ricevuta` - Scarica ricevuta PDF

## 🌐 Deploy

### Railway (Consigliato)

1. Vai su [railway.app](https://railway.app)
2. Crea nuovo progetto da GitHub
3. Seleziona questo repository
4. Railway rileva automaticamente il `railway.json`
5. Il deploy parte automaticamente

### Render

1. Vai su [render.com](https://render.com)
2. Crea nuovo Web Service da GitHub
3. Seleziona questo repository
4. Render rileva automaticamente il `render.yaml`
5. Clicca "Create Web Service"

## 🔧 Environment Variables

Nessuna variabile d'ambiente richiesta per il funzionamento base.

Opzionale:
- `PORT` - Porta del server (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 📝 CORS Configuration

Il server accetta richieste da:
- `http://localhost:5173` (Vite dev)
- `https://alloggify.vercel.app` (Production)
- Tutti i domini `*.vercel.app` (Preview deployments)

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express 4.18
- **CORS**: cors 2.8
- **API Format**: SOAP 1.2

## 📋 Note

- Il server comunica con `https://alloggiatiweb.poliziadistato.it/service/service.asmx`
- Usa SOAP 1.2 con namespace `AlloggiatiService`
- Timeout di default: nessun limite (gestito dal portale)
