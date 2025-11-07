# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alloggify is an OCR-powered web application that extracts information from identity documents (Italian ID cards, passports, driving licenses) and prepares data for the Alloggiati Web portal (Italian police hospitality reporting system).

### Project Evolution

**Phase 1 - Chrome Extension (MVP)**
- Initial implementation: Browser extension for form auto-fill
- Client-side localStorage communication
- Manual submission through portal interface
- Simple setup, no backend required

**Phase 2 - SOAP API Integration (Current)**
- Discovered official Alloggiati Web SOAP API
- Implemented WSKEY-based authentication
- Full automation: OCR → Test → Send → Receipt download
- Express backend server for SOAP proxy
- Production-ready for high-volume operations

**Phase 3 - SaaS Platform (Future Vision)**
The project is planned to evolve into a full SaaS platform with:
- **Backend API**: Node.js + Express/Fastify with PostgreSQL database
- **Authentication**: JWT-based auth with OAuth 2.0 support
- **Payment System**: Stripe integration with subscription tiers (Free, Basic €19, Pro €49, Enterprise €199)
- **Chrome Web Store**: Published extension with cloud sync
- **Multi-tenant Architecture**: Support for hotel chains and property managers

**See `SAAS_PLAN.md` for complete roadmap, financial projections, and technical architecture.**

### Current Architecture (SaaS Platform)

1. **React Web App**: Vite + React 19 + React Router application with:
   - Landing page with pricing, testimonials, FAQ
   - Authentication system (login/signup)
   - Protected dashboard for document scanning
   - Responsive UI with Tailwind CSS
2. **Authentication Layer**: React Context-based auth with localStorage (mock implementation, ready for backend API)
3. **Chrome Extension**: Browser extension to auto-fill the Alloggiati Web portal form (Method A)
4. **Express Backend**: SOAP API proxy for direct submission with WSKEY authentication (Method B)
5. **AI Chat Assistant**: Gemini 2.5 Flash-powered assistant for hospitality support (integrated in dashboard)

## Common Development Commands

```bash
# Install dependencies (root - frontend)
npm install

# Install server dependencies
cd server && npm install

# Run FRONTEND development server (starts on port 3000)
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

The frontend runs on `http://localhost:3000` and the backend API runs on `http://localhost:3001`.

## Environment Setup

**CRITICAL**: Before running the app, configure `.env.local` in the project root:

```env
# Gemini API for OCR (required for document scanning)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (Express server)
VITE_BACKEND_URL=http://localhost:3001

# Alloggiati Web credentials (required for SOAP API integration)
VITE_ALLOGGIATI_UTENTE=your_username_here
VITE_ALLOGGIATI_PASSWORD=your_password_here
VITE_ALLOGGIATI_WSKEY=your_wskey_here
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
├── src/
│   ├── pages/              # React pages (routing)
│   │   ├── LandingPage.tsx      # Public landing page with pricing
│   │   ├── LoginPage.tsx        # Login form
│   │   ├── SignupPage.tsx       # Registration form
│   │   ├── DashboardPage.tsx    # Protected dashboard (main app)
│   │   ├── PrivacyPolicy.tsx    # Legal page
│   │   └── TermsOfService.tsx   # Legal page
│   ├── components/
│   │   ├── MainForm.tsx         # Main form (Dati Schedina, Anagrafici, Documento)
│   │   ├── AlloggiatiCredentials.tsx  # SOAP API credentials panel
│   │   ├── ConfirmationModal.tsx      # Confirmation dialog
│   │   ├── AIChatWidget.tsx           # AI assistant chat UI
│   │   ├── SEOHead.tsx                # SEO meta tags
│   │   ├── ProtectedRoute.tsx         # Auth route guard
│   │   ├── landing/                   # Landing page sections
│   │   │   ├── Pricing.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Alert.tsx
│   │   └── icons/                     # Icon components
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── hooks/
│   │   └── useAuth.tsx          # Authentication hook
│   ├── services/
│   │   ├── geminiService.ts     # Gemini 2.5 Flash API integration
│   │   └── alloggiatiApiService.ts  # SOAP API client wrapper
│   └── utils/
│       └── fileUtils.ts         # File handling utilities (fileToBase64)
├── server/                      # Backend Express server
│   ├── index.js                 # Express app entry point
│   ├── routes/                  # API route handlers
│   │   ├── auth.js              # WSKEY authentication + token generation
│   │   ├── test.js              # Test schedina (validation)
│   │   ├── send.js              # Send schedina to Alloggiati Web
│   │   ├── ricevuta.js          # Download receipt PDF
│   │   ├── chat.js              # AI assistant endpoint
│   │   └── tabelle.js           # Download reference tables (CSV)
│   ├── utils/
│   │   └── soap.js              # SOAP client utilities for Alloggiati Web API
│   └── package.json             # Server dependencies
├── chrome-extension/            # Chrome extension files
│   ├── manifest.json            # Extension manifest (v3)
│   ├── content.js               # Content script for Alloggiati Web
│   ├── background.js            # Service worker
│   ├── popup.html/js            # Extension popup UI
│   ├── alloggify-bridge.js      # Bridge script for localhost
│   └── icons/                   # Extension icons
├── App.tsx                      # React Router setup + route definitions
├── index.tsx                    # React entry point
├── types.ts                     # TypeScript interfaces
├── vite.config.ts               # Vite configuration
└── .env.local                   # Environment variables (GEMINI_API_KEY)
```

## Architecture

### Routing & Authentication System

The application uses **React Router v7** with protected routes:

**Public Routes** (accessible without login):
- `/` - Landing page (pricing, features, testimonials)
- `/login` - Login page
- `/signup` - Signup page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Protected Routes** (require authentication):
- `/dashboard` - Redirects to `/dashboard/scan`
- `/dashboard/scan` - Main document scanning interface (DashboardPage)

**Authentication Flow**:
```
index.tsx → App.tsx (Router + AuthProvider wrapper)
  ↓
AuthContext provides: { user, login, signup, logout, isAuthenticated }
  ↓
ProtectedRoute component checks isAuthenticated
  ↓
If authenticated: Render dashboard
If not: Redirect to /login
```

**Current Auth Implementation**:
- **Storage**: localStorage (`alloggify_user`, `alloggify_token`)
- **State Management**: React Context API (AuthContext)
- **Mock Backend**: Login/signup simulate API calls with setTimeout
- **User Model**: { id, email, fullName, companyName, subscriptionPlan, scanCount, monthlyScanLimit }
- **Future**: Ready to connect to real backend API (see `AuthContext.tsx` TODO comments)

**Auto-redirect Logic**:
- Authenticated users visiting `/login` or `/signup` → redirect to `/dashboard`
- Unauthenticated users visiting `/dashboard/*` → redirect to `/login`

### Web Application Flow

1. **Entry Point**: `index.tsx` → `App.tsx`

2. **Common Document Processing Pipeline** (Both Methods):
   - User uploads image → `DashboardPage.tsx` (handleFileChange)
   - Image converted to base64 → `utils/fileUtils.ts` (fileToBase64)
   - Gemini API extracts document data → `services/geminiService.ts` (extractDocumentInfo)
   - Data populates form → `components/MainForm.tsx`
   - User reviews/edits extracted data

3. **Method A: Chrome Extension Flow** (Client-Side):
   ```
   User clicks "Esporta per Estensione"
   ↓
   DashboardPage.tsx saves data to localStorage (alloggifyData)
   ↓
   Custom event "alloggifyDataExported" dispatched
   ↓
   User navigates to Alloggiati Web portal
   ↓
   Content script (chrome-extension/content.js) injects
   ↓
   Floating button "Compila da Alloggify" appears
   ↓
   User clicks button → Extension reads localStorage
   ↓
   Form fields auto-filled via DOM manipulation
   ↓
   Date/sex transformations applied (YYYY-MM-DD → DD/MM/YYYY, etc.)
   ↓
   User manually reviews and clicks Submit on portal
   ```

4. **Method B: SOAP API Flow** (Server-Side):
   ```
   User expands "API Alloggiati Web" panel (AlloggiatiCredentials.tsx)
   ↓
   Enter credentials: Utente, Password, WSKEY
   ↓
   Click "Connetti" → Authentication flow:
      POST /api/alloggiati/auth
      ↓
      server/routes/auth.js processes request
      ↓
      server/utils/soap.js builds SOAP XML:
        <GenerateToken>
          <Utente>...</Utente>
          <Password>...</Password>
          <WsKey>...</WsKey>
        </GenerateToken>
      ↓
      Alloggiati Web SOAP API returns token + expiry
      ↓
      Token stored in localStorage (alloggifyToken)
   ↓
   User clicks "Invia Schedina" → Submission flow:
      ConfirmationModal appears for user confirmation
      ↓
      POST /api/alloggiati/test (optional validation)
      ↓
      POST /api/alloggiati/send
      ↓
      server/routes/send.js builds schedina XML
      ↓
      SOAP request with token authentication
      ↓
      Success → Receipt number returned
      ↓
      Optional: Download PDF via POST /api/alloggiati/ricevuta
   ```

**Key Differences**:
- **Method A**: Requires manual portal interaction; no WSKEY needed; client-side only
- **Method B**: Fully automated; requires WSKEY + backend; server-side SOAP communication

### Key Components

- **App.tsx**: React Router setup, route definitions, AuthProvider wrapper
- **DashboardPage.tsx**: Main dashboard - document upload, OCR processing, form management, SOAP API integration
- **LandingPage.tsx**: Public landing page with pricing tiers, features, testimonials, FAQ
- **LoginPage.tsx / SignupPage.tsx**: Authentication pages
- **MainForm.tsx**: Form UI with three fieldsets (Dati Schedina, Dati Anagrafici, Documento)
- **AlloggiatiCredentials.tsx**: SOAP API credentials management panel
- **AIChatWidget.tsx**: Floating AI assistant chat widget (Gemini 2.5 Flash)
- **ProtectedRoute.tsx**: Route guard for authenticated pages
- **AuthContext.tsx**: Authentication state management (Context API)
- **geminiService.ts**: Gemini 2.5 Flash API integration with structured JSON schema output
- **alloggiatiApiService.ts**: Frontend service for SOAP API calls
- **types.ts**: TypeScript interfaces (DocumentData, ExtractedInfo, User)

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

The `server/` directory contains an Express.js backend that provides SOAP API integration with the Alloggiati Web portal using **WSKEY authentication**.

**Architecture**:
- **Port**: 3001 (default, configurable via PORT env var)
- **CORS**: Configured for localhost:3000 (Vite dev) and Vercel production/preview deployments
- **Purpose**: Proxies requests to Alloggiati Web SOAP API (avoids CORS issues in browser)
- **Authentication**: WSKEY-based token generation for API access

**API Endpoints**:
- `POST /api/alloggiati/auth` - **Generate authentication token** using Username + Password + **WSKEY**
- `POST /api/alloggiati/test` - Validate schedina data before submission (requires token)
- `POST /api/alloggiati/send` - Send schedina to Alloggiati Web (requires token)
- `POST /api/alloggiati/ricevuta` - Download receipt PDF (requires token + date range)
- `GET /api/alloggiati/tabelle` - Download reference tables (Luoghi, Tipi Documento, Tipi Alloggiato) as CSV
- `POST /api/ai/chat` - AI assistant chat endpoint (Gemini 2.5 Flash)

**Key Files**:
- `server/index.js` - Express app setup, middleware, route registration
- `server/utils/soap.js` - SOAP client implementation for Alloggiati Web API
- `server/routes/auth.js` - **WSKEY authentication** and token generation
- `server/routes/test.js` - Schedina validation endpoint
- `server/routes/send.js` - Schedina submission endpoint
- `server/routes/ricevuta.js` - Receipt download endpoint
- `server/routes/tabelle.js` - Reference tables download (CSV format)
- `server/routes/chat.js` - AI assistant backend endpoint

**WSKEY Role & Authentication Flow**:

The **WSKEY (Web Service Key)** is a secret credential that enables programmatic access to Alloggiati Web API.

1. **What is WSKEY?**
   - Secret API key generated from Alloggiati Web portal (Profilo → Chiave Web Service)
   - Base64-encoded string (e.g., `AFWxClHwW6PKdenzGh0nsQMiFqttTvH2...==`)
   - Permanent until regenerated by user
   - Required for `GenerateToken` SOAP operation

2. **Authentication Flow**:
   ```
   Frontend sends: { utente, password, wskey }
   ↓
   server/routes/auth.js receives request
   ↓
   server/utils/soap.js builds SOAP envelope:
     <GenerateToken>
       <Utente>username</Utente>
       <Password>password</Password>
       <WsKey>base64_wskey</WsKey>
     </GenerateToken>
   ↓
   SOAP API validates WSKEY + credentials
   ↓
   Returns: { token, expiryTimestamp }
   ↓
   Frontend stores token in localStorage
   ↓
   Token used for subsequent Test/Send/Ricevuta operations
   ```

3. **Token vs WSKEY**:
   - **WSKEY**: Permanent credential (until regenerated); used once per session
   - **Token**: Temporary session token (expires after 30-60 min); regenerated as needed

4. **Security**:
   - WSKEY passed from frontend (stored in .env.local or UI)
   - Never logged or committed to git
   - Transmitted only over HTTPS
   - Token automatically refreshed on expiry

**SOAP Integration**:
The backend communicates with the official Alloggiati Web SOAP API endpoint:
- **URL**: `https://alloggiatiweb.poliziadistato.it/wsAlloggiati/service.asmx`
- **Protocol**: SOAP 1.1 (XML over HTTPS)
- **Operations**: GenerateToken, TestSchedula, InviaSchedula, DownloadRicevuta

The server acts as a proxy to:
- Handle SOAP XML request/response serialization
- Bypass browser CORS restrictions
- Manage token lifecycle
- Provide REST-like interface for frontend

**Environment**:
- Development: `npm run dev` (auto-reload with --watch flag)
- Production: `npm start`
- Logs all requests with timestamp for debugging
- No database required (stateless operation)

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

## AI Chat Assistant Feature

The application includes a Gemini 2.5 Flash-powered AI assistant accessible via a floating chat widget in the dashboard.

**Architecture**:
- **Frontend**: `src/components/AIChatWidget.tsx` - Floating chat button and UI
- **Backend**: `server/routes/chat.js` - API endpoint for chat interactions
- **Model**: Gemini 2.5 Flash (completely FREE up to 1500 req/day)
- **System Prompt**: Embedded in AIChatWidget component (expert in Alloggiati Web, Italian hospitality, regulations)

**Key Features**:
- Contextual conversation with chat history
- Suggested questions for quick help
- Expert knowledge on Alloggiati Web portal, Italian hospitality regulations (D.Lgs. 286/1998), document types, troubleshooting
- Markdown-formatted responses with emoji visual cues
- Real-time typing indicator

**API Endpoint**:
- `POST /api/ai/chat` - Send message and get AI response
- Request body: `{ systemPrompt: string, messages: Array<{role, content}> }`
- Response: `{ response: string, usage: {inputTokens, outputTokens, totalTokens} }`

**Environment Variable**:
- Uses same `GEMINI_API_KEY` as OCR feature
- Falls back to localStorage if not set in `.env.local`

**Common Issues**:
- **"fetch failed" error on Windows**: Fixed by installing `node-fetch@2` as polyfill
- **503 Network error**: Check firewall, proxy, or internet connection
- **504 Timeout**: Request took >30 seconds, retry recommended

**See `AI_CHAT_FEATURE.md` for detailed design documentation, system prompt, and roadmap.**

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
  - `alloggifyData`: JSON-serialized DocumentData object (for Chrome Extension method)
  - `alloggifyDataTimestamp`: Timestamp of last export
  - `geminiApiKey`: User's Gemini API key (optional, UI-configurable)
  - `alloggifyToken`: SOAP API authentication token (temporary, expires after session)
  - `alloggifyCredentials`: JSON object with { utente, password, wskey } for SOAP API
  - `alloggify_user`: Mock user object (SaaS authentication)
  - `alloggify_token`: Mock auth token (SaaS authentication)
- **Custom Events**: `alloggifyDataExported` event is dispatched on window when data is exported (for extension bridge)
- **WSKEY Technical Details**:
  - **Format**: Base64-encoded string, typically 88 characters ending with `==`
  - **Generation**: Portal → Profilo → Chiave Web Service → Genera Chiave
  - **Lifecycle**: Permanent until manually regenerated by user
  - **Usage**: Required parameter for `GenerateToken` SOAP operation
  - **Storage**: Environment variable `VITE_ALLOGGIATI_WSKEY` or UI input (stored in localStorage)
  - **Security**: Never log, commit to git, or expose in error messages
  - **Validation**: Backend checks presence but doesn't validate format (API validates)
- **Token Management**:
  - **Generation**: POST /api/alloggiati/auth with (utente, password, wskey)
  - **Format**: Opaque string returned by Alloggiati Web API
  - **Expiry**: Typically 30-60 minutes of inactivity
  - **Refresh**: Automatic re-authentication when 401/403 errors occur
  - **Storage**: localStorage.alloggifyToken (cleared on logout or expiry)

## Development Workflow Notes

### Making Changes to Authentication
- **Frontend**: Edit `src/context/AuthContext.tsx` for auth logic
- **Protected Routes**: Use `<ProtectedRoute>` wrapper in `App.tsx`
- **Backend Integration**: Look for `TODO` comments in AuthContext - replace mock API calls with real endpoints
- **Testing Auth**: Currently uses mock users - login with any email/password

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `App.tsx` (public or protected)
3. Update navigation links in `LandingPage.tsx` or dashboard header
4. Use existing UI components from `src/components/ui/`

### Modifying Document Processing
- **OCR Logic**: `src/services/geminiService.ts` - contains Gemini prompt and response parsing
- **Form Fields**: `components/MainForm.tsx` - three fieldsets structure
- **Data Model**: `types.ts` - DocumentData interface
- **Validation**: Happens client-side in MainForm + server-side via SOAP test endpoint

### Working with SOAP API
- **Backend Routes**: `server/routes/*.js` - each endpoint handles specific SOAP operation
- **SOAP XML Building**: `server/utils/soap.js` - helper functions for XML construction
- **Testing SOAP Calls**: Use tools like Postman/Insomnia or test via frontend panel
- **Error Handling**: SOAP errors parsed in backend and returned as JSON to frontend

### Chrome Extension Development
- **Content Script**: `chrome-extension/content.js` - runs on Alloggiati Web portal
- **Testing**: Load unpacked extension, make changes, click "Reload" in chrome://extensions
- **Debugging**: Open DevTools on portal page, check Console for errors
- **Data Format**: Extension expects `alloggifyData` in localStorage with specific DocumentData structure
