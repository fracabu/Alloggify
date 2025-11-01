# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alloggify is an OCR-powered web application that extracts information from identity documents (Italian ID cards, passports, driving licenses) and prepares data for the Alloggiati Web portal (Italian police hospitality reporting system).

### Current Architecture (MVP)

1. **React Web App**: Vite-based React application for document scanning and data extraction
2. **Chrome Extension**: Browser extension to auto-fill the Alloggiati Web portal form

### Future Vision (SaaS Platform)

The project is planned to evolve into a full SaaS platform with:
- **Backend API**: Node.js + Express/Fastify with PostgreSQL database
- **Authentication**: JWT-based auth with OAuth 2.0 support
- **Payment System**: Stripe integration with subscription tiers (Free, Basic €19, Pro €49, Enterprise €199)
- **Chrome Web Store**: Published extension with cloud sync
- **Multi-tenant Architecture**: Support for hotel chains and property managers

**See `SAAS_PLAN.md` for complete roadmap, financial projections, and technical architecture.**

## Common Development Commands

```bash
# Install dependencies (root - frontend)
npm install

# Install server dependencies
cd server && npm install

# Run FRONTEND development server (starts on port 5173)
npm run dev

# Run BACKEND server (starts on port 3001)
cd server && npm start
# OR for dev mode with auto-reload:
cd server && npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Full Stack Development

For full functionality, you need BOTH frontend and backend running:

```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
cd server && npm start
```

The frontend runs on `http://localhost:5173` and the backend API runs on `http://localhost:3001`.

## Environment Setup

**CRITICAL**: Before running the app, configure `.env.local` in the project root:

```env
# Gemini API for OCR (required for document scanning)
GEMINI_API_KEY=your_actual_api_key_here

# Alloggiati Web credentials (required for SOAP API integration)
VITE_ALLOGGIATI_USERNAME=your_username
VITE_ALLOGGIATI_PASSWORD=your_password

# API endpoint (optional, defaults to localhost:3001)
VITE_API_URL=http://localhost:3001
```

**Gemini API Key Resolution Order** (in `geminiService.ts`):
1. First checks `localStorage.getItem('geminiApiKey')` (user can set via UI)
2. Falls back to `import.meta.env.VITE_GEMINI_API_KEY` (from `.env.local`, injected at build time via Vite)

**Alloggiati Web Credentials**:
- Credentials are loaded from `.env.local` on app startup
- Stored in localStorage as `alloggifyCredentials`
- Token generated via `/api/alloggiati/auth` and persisted in localStorage as `alloggifyToken`
- Token is automatically refreshed when expired

The app includes an `ApiKeyGuide` component that allows users to set their Gemini API key through the UI, which stores it in localStorage.

## Project Structure

```
Alloggify/
├── components/           # React components
│   ├── MainForm.tsx     # Main form with 3 fieldsets (Dati Schedina, Anagrafici, Documento)
│   ├── Header.tsx       # Application header
│   ├── ApiKeyGuide.tsx  # UI component for setting Gemini API key
│   ├── ConfirmationModal.tsx
│   ├── Logo.tsx
│   ├── Sidebar.tsx
│   └── icons/           # Icon components
├── services/
│   └── geminiService.ts # Gemini 2.5 Flash API integration
├── utils/
│   └── fileUtils.ts     # File handling utilities (fileToBase64)
├── server/              # Backend Express server
│   ├── index.js         # Express app entry point
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Token generation endpoint
│   │   ├── test.js      # Test schedina (validation)
│   │   ├── send.js      # Send schedina to Alloggiati Web
│   │   └── ricevuta.js  # Download receipt PDF
│   ├── utils/
│   │   └── soap.js      # SOAP client utilities for Alloggiati Web API
│   └── package.json     # Server dependencies
├── chrome-extension/    # Chrome extension files
│   ├── manifest.json    # Extension manifest (v3)
│   ├── content.js       # Content script for Alloggiati Web
│   ├── background.js    # Service worker
│   ├── popup.html/js    # Extension popup UI
│   ├── alloggify-bridge.js  # Bridge script for localhost
│   └── icons/           # Extension icons
├── App.tsx              # Main application component
├── index.tsx            # React entry point
├── types.ts             # TypeScript interfaces
├── vite.config.ts       # Vite configuration
└── .env.local           # Environment variables (GEMINI_API_KEY)
```

## Architecture

### Web Application Flow

1. **Entry Point**: `index.tsx` → `App.tsx`
2. **Document Processing Pipeline**:
   - User uploads image → `App.tsx` (handleFileChange)
   - Image converted to base64 → `utils/fileUtils.ts` (fileToBase64)
   - Gemini API extracts document data → `services/geminiService.ts` (extractDocumentInfo)
   - Data populates form → `components/MainForm.tsx`
   - User has two submission options:
     - **Option A**: "Esporta per Estensione" → saves to localStorage → Chrome extension auto-fills portal
     - **Option B**: "Invia Schedina" → sends via SOAP API through backend server (requires credentials)

3. **SOAP API Submission Flow** (Option B):
   - User clicks "Invia Schedina" button
   - Frontend loads credentials from localStorage (populated from .env on startup)
   - `POST /api/alloggiati/auth` → Get authentication token (if not cached)
   - `POST /api/alloggiati/test` → Validate schedina data (optional pre-check)
   - `POST /api/alloggiati/send` → Submit schedina to Alloggiati Web
   - Backend (`server/`) handles SOAP XML communication
   - Success response → User can download receipt via `POST /api/alloggiati/ricevuta`

### Key Components

- **App.tsx**: Main application logic, state management, file upload handling
- **MainForm.tsx**: Form UI with three fieldsets (Dati Schedina, Dati Anagrafici, Documento)
- **geminiService.ts**: Gemini 2.5 Flash API integration with structured JSON schema output
- **types.ts**: TypeScript interfaces (DocumentData, ExtractedInfo)
- **ApiKeyGuide.tsx**: Allows users to input their Gemini API key via UI (stored in localStorage)

### Chrome Extension Flow

1. User clicks "Esporta per Estensione" button → saves data to localStorage as `alloggifyData` + triggers custom event
2. Content script (`chrome-extension/content.js`) injects on Alloggiati Web portal
3. Floating button "Compila da Alloggify" or popup trigger fills form
4. Field mappings use specific ID selectors (e.g., `#Cognome`, `#Nome`, `#datan`) and placeholder-based searches
5. Data transformations happen in content.js:
   - Dates converted from `YYYY-MM-DD` to `DD/MM/YYYY`
   - Sex values converted from "Maschio"/"Femmina" to "M"/"F"

### Chrome Extension Installation (Development)

To load the extension for development/testing:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory from this project
5. Extension will appear in Chrome toolbar

The extension works on:
- `https://alloggiatiweb.poliziadistato.it/*` (production portal)
- `http://localhost:*/*` (local development - uses bridge script)

### Backend Express Server (SOAP API Integration)

The `server/` directory contains an Express.js backend that provides SOAP API integration with the Alloggiati Web portal.

**Architecture**:
- **Port**: 3001 (default)
- **CORS**: Configured for localhost:5173 (Vite dev) and Vercel production/preview deployments
- **Purpose**: Proxies requests to Alloggiati Web SOAP API (avoids CORS issues in browser)

**API Endpoints**:
- `POST /api/alloggiati/auth` - Generate authentication token using credentials
- `POST /api/alloggiati/test` - Validate schedina data before submission
- `POST /api/alloggiati/send` - Send schedina to Alloggiati Web
- `POST /api/alloggiati/ricevuta` - Download receipt PDF

**Key Files**:
- `server/index.js` - Express app setup, middleware, route registration
- `server/utils/soap.js` - SOAP client implementation for Alloggiati Web API
- `server/routes/*.js` - Individual route handlers for each endpoint

**SOAP Integration**:
The backend communicates with the official Alloggiati Web SOAP API. Credentials are passed from the frontend and stored in localStorage (see App.tsx for token persistence). The server acts as a proxy to handle SOAP XML requests/responses and bypass browser CORS restrictions.

**Environment**:
- Development: `npm run dev` (auto-reload with --watch flag)
- Production: `npm start`
- Logs all requests with timestamp for debugging

### Document Type Classification Logic

The Gemini prompt in `geminiService.ts` follows a strict hierarchy:
1. Check for PASSPORT → classify as "PASSAPORTO ORDINARIO"
2. Check for DRIVING LICENCE → classify as "PATENTE DI GUIDA"
3. For Italian IDs:
   - Default to "CARTA DI IDENTITA'" (covers old paper/plastic cards)
   - Only use "CARTA IDENTITA' ELETTRONICA" if chip/EU flag visible

This logic prevents misclassification of older Italian ID cards as electronic.

## Path Aliases

Use `@/` prefix for imports from project root:
```typescript
import { DocumentData } from '@/types';
```

Configured in both `tsconfig.json` and `vite.config.ts`.

## Important Technical Notes

- **Date Formats**:
  - Internal storage: `YYYY-MM-DD`
  - Portal requires: `DD/MM/YYYY` (converted in content.js via `formatDateForPortal()`)
- **Sex Values**:
  - Internal: "Maschio" / "Femmina"
  - Portal requires: "M" / "F" (converted in content.js)
- **Place Names**: Gemini extracts Italian municipalities in uppercase (e.g., "ROMA") for Italian citizens, full country names for foreign citizens
- **Chrome Extension Selectors**: Content.js uses a combination of:
  - Direct ID selectors: `#Cognome`, `#Nome`, `#datan`, `#nascluo`, `#citt`, `#docT`, `#docN`, `#docLR`, `#NGioPerm`, `#dataA`
  - Placeholder/title-based searches: `fillByIdOrPlaceholder()` for fields without stable IDs
  - Select option matching: Case-insensitive matching by value or text content
- **localStorage Keys**:
  - `alloggifyData`: JSON-serialized DocumentData object
  - `alloggifyDataTimestamp`: Timestamp of last export
  - `geminiApiKey`: User's Gemini API key (optional, UI-configurable)
  - `alloggifyToken`: SOAP API authentication token (persisted from login)
  - `alloggifyCredentials`: Encrypted user credentials for Alloggiati Web (username/password from .env)
- **Custom Events**: `alloggifyDataExported` event is dispatched on window when data is exported (for extension bridge)
