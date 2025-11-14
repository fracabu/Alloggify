# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CheckInly** (formerly Alloggify) is an OCR-powered web application that extracts information from identity documents (Italian ID cards, passports, driving licenses) and prepares data for the Alloggiati Web portal (Italian police hospitality reporting system).

**Note**: The codebase is currently undergoing rebranding from "Alloggify" to "CheckInly". You may see both names in the code - when adding new features or making changes, prefer using "CheckInly" for user-facing elements while maintaining backward compatibility with existing code references.

### Project Evolution

**Phase 1 - Chrome Extension (MVP)**
- Initial implementation: Browser extension for form auto-fill
- Client-side localStorage communication
- Manual submission through portal interface
- Simple setup, no backend required

**Phase 2 - SOAP API Integration**
- Discovered official Alloggiati Web SOAP API
- Implemented WSKEY-based authentication
- Full automation: OCR → Test → Send → Receipt download
- Express backend server for SOAP proxy (deprecated - see Phase 3)

**Phase 3 - SaaS Platform (CURRENT)**
Now deployed as a production SaaS platform with:
- **Vercel Serverless Functions**: Auto-scaling API endpoints (no Express server)
- **Neon PostgreSQL**: Serverless database via `@vercel/postgres`
- **JWT Authentication**: Email verification, password reset, session management
- **Transactional Email**: Resend API integration
- **Subscription System**: Database schema ready for Stripe integration
- **Multi-tenant Architecture**: User isolation with scan usage limits

**See `SAAS_PLAN.md` for complete roadmap and financial projections.**

### Current Architecture (Vercel Serverless)

1. **React Web App**: Vite + React 19 + React Router application with:
   - Landing page with pricing, testimonials, FAQ
   - Authentication system (login/signup with email verification)
   - Protected dashboard for document scanning
   - Responsive UI with Tailwind CSS
2. **Vercel Serverless API**: TypeScript functions in `api/` directory:
   - Authentication endpoints (`/api/auth/*`)
   - OCR endpoint (`/api/ocr`)
   - SOAP API proxy (`/api/alloggiati`)
   - AI chat assistant (`/api/ai/chat`)
3. **Neon PostgreSQL**: Serverless database with:
   - User management (email verification, password reset)
   - Scan history tracking
   - Subscription management (Stripe integration ready)
   - Usage analytics
4. **Chrome Extension**: Browser extension to auto-fill the Alloggiati Web portal form (Method A)
5. **AI Services**: Gemini 2.5 Flash for OCR and chat assistant

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server (frontend + serverless API)
npm run dev
# Opens on http://localhost:3000 (Vite dev server)
# API routes available at /api/* (auto-proxied in dev)

# Build for production
npm run build

# Preview production build locally
npm run preview

# Database management
node scripts/init-db.js              # Initialize database schema
node scripts/delete-test-users.js    # Clean up test users
```

### Local Development Setup

The app runs on a single Vite dev server with API routes handled by Vercel's local development environment:

1. Configure `.env.local` with all required environment variables
2. Run `npm run dev`
3. API endpoints are available at `http://localhost:3000/api/*`
4. Frontend served at `http://localhost:3000`

**Note**: The old `server/` directory with Express is deprecated. All backend logic now lives in `api/` as Vercel Serverless Functions.

## Environment Setup

**CRITICAL**: Configure `.env.local` in the project root. See `.env.local.example` for template.

```env
# ==========================================
# FRONTEND URL
# ==========================================
NEXT_PUBLIC_URL=http://localhost:3000

# ==========================================
# JWT SECRET (REQUIRED)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ==========================================
JWT_SECRET=your_generated_secret_here

# ==========================================
# RESEND API KEY (for email verification/reset)
# Get free key from: https://resend.com
# ==========================================
RESEND_API_KEY=re_XXXXX

# ==========================================
# GEMINI API KEY (for OCR + AI chat)
# ==========================================
GEMINI_API_KEY=your_gemini_api_key_here

# ==========================================
# BACKEND URL (Vercel Serverless - use http://localhost:3000 for dev)
# ==========================================
VITE_BACKEND_URL=http://localhost:3000

# ==========================================
# VERCEL POSTGRES (Neon Database)
# Copy from: Vercel Dashboard → Storage → Postgres → .env.local tab
# These are AUTO-CONFIGURED when you deploy to Vercel
# ==========================================
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

**Important Notes**:
- **JWT_SECRET**: Generate a secure random string (32+ characters) - NEVER use default in production
- **Database Variables**: Automatically set by Vercel when you add Postgres storage
- **Local Development**: Copy database variables from Vercel Dashboard → Storage → Postgres
- **Gemini API**: Users can still configure via UI (stored in localStorage), env var is fallback

## Project Structure

```
Alloggify/
├── api/                         # Vercel Serverless Functions (TypeScript)
│   ├── auth/
│   │   ├── login.ts             # POST /api/auth/login - JWT authentication
│   │   ├── register.ts          # POST /api/auth/register - User registration + email
│   │   ├── verify.ts            # GET /api/auth/verify - Email verification
│   │   ├── forgot.ts            # POST /api/auth/forgot - Password reset request
│   │   └── reset.ts             # POST /api/auth/reset - Password reset confirmation
│   ├── ai/
│   │   └── chat.ts              # POST /api/ai/chat - Gemini AI assistant
│   ├── ocr.ts                   # POST /api/ocr - Document OCR extraction
│   └── alloggiati.ts            # POST /api/alloggiati - SOAP API proxy (unified)
├── lib/                         # Shared backend utilities
│   ├── db.ts                    # Database helpers (Neon PostgreSQL via @vercel/postgres)
│   ├── auth.ts                  # JWT generation, password hashing, validation
│   └── soap.ts                  # SOAP client for Alloggiati Web API
├── database/
│   └── schema.sql               # PostgreSQL schema (users, scans, subscriptions, usage_logs)
├── scripts/
│   ├── init-db.js               # Initialize database schema
│   └── delete-test-users.js     # Clean up test data
├── src/
│   ├── pages/                   # React pages (routing)
│   │   ├── LandingPage.tsx      # Public landing page with pricing
│   │   ├── LoginPage.tsx        # Login form
│   │   ├── SignupPage.tsx       # Registration form
│   │   ├── DashboardPage.tsx    # Protected dashboard (main app)
│   │   ├── PrivacyPolicy.tsx    # Legal page
│   │   └── TermsOfService.tsx   # Legal page
│   ├── components/
│   │   ├── AIChatWidget.tsx     # AI assistant chat UI
│   │   ├── ProtectedRoute.tsx   # Auth route guard
│   │   ├── landing/             # Landing page sections (Pricing, FAQ, etc.)
│   │   └── ui/                  # Reusable UI components (Button, Card, Alert)
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication state (calls /api/auth/*)
│   ├── hooks/
│   │   └── useAuth.tsx          # Authentication hook
│   ├── services/
│   │   ├── geminiService.ts     # Gemini 2.5 Flash API integration
│   │   └── alloggiatiApiService.ts  # SOAP API client wrapper
│   └── utils/
│       └── fileUtils.ts         # File handling utilities (fileToBase64)
├── components/                  # Root-level legacy components
│   ├── MainForm.tsx             # Main form (Dati Schedina, Anagrafici, Documento)
│   ├── AlloggiatiCredentials.tsx # SOAP API credentials panel
│   ├── ConfirmationModal.tsx    # Confirmation dialog
│   └── ...                      # Header, Logo, Sidebar, icons
├── chrome-extension/            # Chrome extension files (Manifest V3)
│   ├── manifest.json
│   ├── content.js               # Auto-fill script for Alloggiati Web
│   └── ...
├── server/                      # DEPRECATED - Legacy Express server (use api/ instead)
├── App.tsx                      # React Router setup + route definitions
├── types.ts                     # TypeScript interfaces (DocumentData, User, etc.)
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel deployment config
└── .env.local                   # Environment variables
```

**Key Directories**:
- **`api/`**: Vercel Serverless Functions - all backend logic lives here
- **`lib/`**: Shared utilities for serverless functions (DB, auth, SOAP)
- **`database/`**: SQL schema and migration scripts
- **`src/`**: React frontend application
- **`server/`**: DEPRECATED - old Express server (kept for reference, not used in production)

## Architecture

### Vercel Serverless Functions

All backend logic is implemented as **Vercel Serverless Functions** (TypeScript):

**Configuration** (`vercel.json`):
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30  // 30-second timeout for all API routes
    }
  }
}
```

**Function Pattern**:
- Each `.ts` file in `api/` becomes an endpoint
- Export default async handler: `(req: VercelRequest, res: VercelResponse) => Promise<void>`
- Auto-deployed on Vercel, auto-scaling
- No server management required

**Example Function** (`api/auth/login.ts`):
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // ... authentication logic
}
```

### Database Integration (Neon PostgreSQL)

**Connection Library**: `@vercel/postgres`
- **Auto-configured** by Vercel (no connection strings in code)
- **Connection pooling** built-in
- **Tagged template queries** for SQL injection protection

**Usage Pattern** (`lib/db.ts`):
```typescript
import { sql } from '@vercel/postgres';

const result = await sql`
  SELECT * FROM users WHERE email = ${email} LIMIT 1
`;
```

**Database Schema** (`database/schema.sql`):
- **users**: Email verification, password reset, subscription management
- **scans**: Document scan history with JSONB extracted data
- **subscriptions**: Stripe integration (ready for webhooks)
- **usage_logs**: Analytics and audit trail

**Key Features**:
- UUID primary keys (`uuid_generate_v4()`)
- JSONB columns for flexible data
- Automatic `updated_at` triggers
- Comprehensive indexing

### Routing & Authentication System

The application uses **React Router v7** with protected routes:

**Public Routes**:
- `/` - Landing page
- `/login` - Login page
- `/signup` - Registration page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Protected Routes**:
- `/dashboard` - Redirects to `/dashboard/scan`
- `/dashboard/scan` - Main document scanning interface

**Authentication Flow**:
```
1. User Registration:
   POST /api/auth/register → Create user in DB → Send verification email (Resend API)
   ↓
2. Email Verification:
   GET /api/auth/verify?token=xxx → Update email_verified = TRUE
   ↓
3. User Login:
   POST /api/auth/login → Verify credentials → Generate JWT tokens
   ↓
4. Frontend Storage:
   sessionStorage: alloggify_user, alloggify_token (auto-logout on browser close)
   ↓
5. Protected Routes:
   ProtectedRoute checks sessionStorage → Redirect to /login if unauthenticated
```

**Auth Implementation**:
- **Storage**: sessionStorage (`alloggify_user`, `alloggify_token`) - auto-clear on browser close
- **State Management**: React Context API (AuthContext)
- **Backend**: Real Vercel Serverless API with Neon PostgreSQL
- **JWT**: 7-day access token, 30-day refresh token
- **Password Security**: bcrypt hashing (10 salt rounds)
- **Email Verification**: Required before login (24-hour token expiry)

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

### SOAP API Integration (Alloggiati Web)

The `/api/alloggiati.ts` serverless function provides SOAP API integration with the Alloggiati Web portal using **WSKEY authentication**.

**Unified Endpoint**: `POST /api/alloggiati`
- **Action-based routing**: Single endpoint with `action` parameter
- **Actions**: `auth`, `test`, `send`, `ricevuta`, `tabelle`
- **Purpose**: Proxies requests to Alloggiati Web SOAP API (avoids CORS issues)

**WSKEY Role & Authentication Flow**:

The **WSKEY (Web Service Key)** is a secret credential that enables programmatic access to Alloggiati Web API.

1. **What is WSKEY?**
   - Secret API key generated from Alloggiati Web portal (Profilo → Chiave Web Service)
   - Base64-encoded string (e.g., `AFWxClHwW6PKdenzGh0nsQMiFqttTvH2...==`)
   - Permanent until regenerated by user
   - Required for `GenerateToken` SOAP operation

2. **Authentication Flow**:
   ```
   Frontend sends: POST /api/alloggiati { action: 'auth', utente, password, wskey }
   ↓
   api/alloggiati.ts receives request
   ↓
   lib/soap.ts builds SOAP envelope:
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

**SOAP Integration** (`lib/soap.ts`):
- **API Endpoint**: `https://alloggiatiweb.poliziadistato.it/service/service.asmx`
- **Protocol**: SOAP 1.2 (XML over HTTPS)
- **Operations**: GenerateToken, TestSchedula, InviaSchedula, DownloadRicevuta
- **XML Escaping**: `escapeXml()` function prevents injection attacks
- **Helper Functions**:
  - `callSoap(envelope, operation)` - HTTP POST with SOAP envelope
  - `escapeXml(unsafe)` - Escape XML entities (&, <, >, ", ')

**Security**:
- WSKEY transmitted only over HTTPS
- Never logged or committed to git
- Token automatically refreshed on expiry
- XML injection protection via `escapeXml()`

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

## Styling & Design System

**Color Scheme**: The app uses a custom Tailwind configuration with Airbnb-inspired colors defined in `tailwind.config.js`.

**Primary Brand Colors** (Airbnb red palette):
- `primary-50` to `primary-900` - Use for buttons, links, accents
- `primary-500` (#FF385C) - Main brand color
- **Always use**: `primary-*` utilities (e.g., `bg-primary-500`, `text-primary-600`, `hover:bg-primary-700`)
- **Never use**: `indigo-*`, `blue-*` for primary UI elements (legacy colors removed during rebranding)

**Neutral Colors**:
- `dark` (#222222) and `dark-light` (#484848) - Dark text and backgrounds
- `gray-light`, `gray-lighter`, `gray-lightest` - Custom gray shades

**Styling Conventions**:
- All styling uses Tailwind utility classes
- Avoid inline styles or custom CSS where possible
- Responsive design: Use Tailwind breakpoints (`sm:`, `md:`, `lg:`, etc.)

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
- **Storage Keys**:
  - **sessionStorage** (auto-clear on browser close):
    - `alloggify_user`: User object from database (id, email, fullName, subscriptionPlan, etc.)
    - `alloggify_token`: JWT access token (7-day expiry)
  - **localStorage** (persistent):
    - `alloggifyData`: JSON-serialized DocumentData object (for Chrome Extension method)
    - `alloggifyDataTimestamp`: Timestamp of last export
    - `geminiApiKey`: User's Gemini API key (optional, UI-configurable)
    - `alloggifyToken`: SOAP API authentication token (temporary, expires after session)
    - `alloggifyCredentials`: JSON object with { utente, password, wskey } for SOAP API
    - `alloggiatiUtente`, `alloggiatiPassword`, `alloggiatiWskey`: Individual SOAP credentials
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
- **Frontend**: Edit `src/context/AuthContext.tsx` for auth state management
- **Backend**: Modify serverless functions in `api/auth/*.ts`
- **Protected Routes**: Use `<ProtectedRoute>` wrapper in `App.tsx`
- **Database**: User model defined in `database/schema.sql` (users table)
- **Testing Auth**:
  1. Register user via `/signup` → Check email for verification link
  2. Click verification link → Email verified
  3. Login via `/login` → JWT tokens generated

### Adding New Serverless API Endpoints
1. Create `.ts` file in `api/` directory (e.g., `api/example.ts`)
2. Export default async handler with `VercelRequest` and `VercelResponse` types
3. Import helper functions from `lib/` (db, auth, soap)
4. Handle errors with try/catch and appropriate status codes
5. Test locally with `npm run dev` → API available at `http://localhost:3000/api/example`

**Example**:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res);
  if (!user) return; // Auth failed, response already sent

  // Your logic here
  return res.status(200).json({ message: 'Success' });
}
```

### Database Operations
- **Connection**: Use `import { sql } from '@vercel/postgres'` in serverless functions
- **Helpers**: `lib/db.ts` provides common queries (getUserByEmail, createUser, etc.)
- **Migrations**: Run `node scripts/init-db.js` to initialize schema
- **Query Pattern**: Tagged template literals for SQL injection protection
  ```typescript
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  ```

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `App.tsx` (public or protected)
3. Update navigation links in `LandingPage.tsx` or dashboard header
4. Use existing UI components from `src/components/ui/`

### Modifying Document Processing
- **OCR Logic**: `src/services/geminiService.ts` - contains Gemini prompt and response parsing
- **Backend OCR**: `api/ocr.ts` - serverless function for Gemini API calls
- **Form Fields**: `components/MainForm.tsx` (root-level) - three fieldsets structure
- **Data Model**: `types.ts` (root-level) - DocumentData and ExtractedInfo interfaces
- **Validation**: Client-side in MainForm + server-side via SOAP test endpoint

### Working with SOAP API
- **Serverless Function**: `api/alloggiati.ts` - unified endpoint with action-based routing
- **SOAP XML Building**: `lib/soap.ts` - helper functions for XML construction
- **Testing SOAP Calls**: Use Postman/Insomnia or test via frontend panel
- **Error Handling**: SOAP errors parsed in serverless function and returned as JSON

### Chrome Extension Development
- **Content Script**: `chrome-extension/content.js` - runs on Alloggiati Web portal
- **Testing**: Load unpacked extension, make changes, click "Reload" in chrome://extensions
- **Debugging**: Open DevTools on portal page, check Console for errors
- **Data Format**: Extension expects `alloggifyData` in localStorage with specific DocumentData structure

## Common Pitfalls & Important Notes

### Environment Variables
- `.env.local` is gitignored - **NEVER commit this file**
- After changing `.env.local`, restart the Vite dev server (variables are injected at build time)
- WSKEY and API keys are sensitive - treat them like passwords
- Variables prefixed with `VITE_` are exposed to client-side code

### Component Import Paths
- Use `@/` alias for cleaner imports (configured in vite.config.ts)
- Be aware of dual component structure: `src/components/` (new) vs `components/` (root, legacy)
- When importing, check both locations if component not found

### Serverless Functions and CORS
- Vercel automatically handles CORS for serverless functions
- API calls from frontend to `/api/*` are same-origin (no CORS issues)
- SOAP API proxy (`api/alloggiati.ts`) handles external SOAP calls server-side
- Never call Alloggiati Web API directly from frontend (CORS + security)

### Data Format Conversions
- Dates are stored internally as `YYYY-MM-DD` but portal requires `DD/MM/YYYY`
- Sex values: internal `"Maschio"/"Femmina"` vs portal `"M"/"F"`
- These conversions happen automatically in `chrome-extension/content.js`

### Testing the Application
- **No automated test suite** - manual testing required
- Test authentication flow: registration → email verification → login
- Test OCR with real document images (ID cards, passports, licenses)
- Test SOAP API with valid Alloggiati Web credentials
- Check email delivery in Resend dashboard
- Monitor serverless function logs in Vercel dashboard

### Deployment to Vercel
1. **Initial Setup**:
   - Connect GitHub repo to Vercel
   - Add Vercel Postgres storage (auto-configures database env vars)
   - Add Resend API key to environment variables
   - Add JWT_SECRET (generate secure random string)
   - Add GEMINI_API_KEY

2. **Database Initialization**:
   - Copy database connection strings from Vercel Dashboard
   - Run `node scripts/init-db.js` locally to create tables
   - OR run SQL directly in Vercel Postgres Query tab

3. **Post-Deploy**:
   - Test registration/login flow
   - Verify email delivery works
   - Check OCR functionality
   - Monitor function logs for errors

### SaaS Readiness Checklist

**✅ IMPLEMENTED**:
- User authentication (JWT + email verification)
- Password reset flow
- Neon PostgreSQL database with user management
- Subscription plan field in database
- Scan count tracking and limits
- Usage analytics logging
- Serverless architecture (auto-scaling)
- Email service (Resend API)

**🔶 PARTIALLY IMPLEMENTED**:
- Stripe integration schema (tables exist, no webhooks yet)
- Scan history tracking (database ready, OCR endpoint not protected)

**❌ TODO FOR FULL SAAS**:
- Stripe payment integration (checkout, webhooks, subscription management)
- Protected OCR endpoint with usage limit enforcement
- User dashboard API endpoints (profile, scan history, billing)
- Stripe webhook handler (`/api/webhooks/stripe`)
- Monthly scan limit reset cron job
- Admin dashboard for user management
- Email templates for marketing/transactional emails
- Rate limiting (consider Vercel KV for Redis-like caching)
- Automated tests (unit, integration, E2E)
