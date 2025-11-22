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
- Express backend server for SOAP proxy (still used for local development)

**Phase 3 - SaaS Platform (CURRENT)**
Now deployed as a production SaaS platform with:
- **Hybrid Backend Architecture**: Express server for local dev + Vercel Serverless for production
- **Neon PostgreSQL**: Serverless database via `@vercel/postgres`
- **JWT Authentication**: Email verification, password reset, session management
- **Transactional Email**: Resend API integration
- **Subscription System**: Database schema ready for Stripe integration
- **Multi-tenant Architecture**: User isolation with scan usage limits

**See `SAAS_PLAN.md` for complete roadmap and `SAAS_STATUS.md` for current implementation status (85% complete).**

### SaaS Implementation Status

**Current Completion: ~85%** 🟡

**✅ Fully Implemented**:
- JWT Authentication (login, registration, email verification, password reset)
- Neon PostgreSQL database (4 tables: users, scans, subscriptions, usage_logs)
- Stripe Integration (checkout, webhooks, subscription management) - **COMPLETED & TESTED**
- OCR endpoint with Gemini 2.5 Flash (protected with JWT, scan limit enforcement)
- SOAP API proxy for Alloggiati Web
- Landing page with pricing tiers
- News section with article list and detail pages
- Aruba SMTP email service for transactional emails (via Nodemailer)

**🟡 Partially Implemented**:
- User Dashboard API endpoints (profile, scan history, subscription management) - **NOT STARTED**
- Cron job for monthly scan limit reset - **NOT STARTED**
- `/api/alloggiati` endpoint JWT protection - **NEEDS IMPLEMENTATION**

**🔴 Known Critical Issues**:
1. **Scan Counter Bug**: Currently increments on OCR scan instead of on successful schedina submission
   - Should count only when `POST /api/alloggiati` (action: 'send') succeeds
   - Fix requires: Add JWT auth to `/api/alloggiati`, move increment from OCR to Send handler

2. **Missing `/api/alloggiati` JWT Protection**: Endpoint accepts requests without authentication
   - Should require `requireAuth()` middleware
   - Needed to track user submissions and increment scan_count correctly

**Priority Next Steps**:
1. Protect `/api/alloggiati` with JWT authentication
2. Fix scan counting logic (OCR → Send)
3. Implement user dashboard API endpoints
4. Add monthly reset cron job

### Current Architecture (Hybrid)

1. **React Web App**: Vite + React 19 + React Router application with:
   - Landing page with pricing, testimonials, FAQ
   - Authentication system (login/signup with email verification)
   - Protected dashboard for document scanning
   - Responsive UI with Tailwind CSS

2. **Backend API** (dual implementation):
   - **Local Development**: Express server (`server/index.js`) on port 3001
   - **Production (Vercel)**: Serverless Functions in `api/` directory
   - Both implement the same endpoints:
     - Authentication endpoints (`/api/auth/*`)
     - OCR endpoint (`/api/ocr`)
     - SOAP API proxy (`/api/alloggiati`)
     - AI chat assistant (`/api/ai/chat`)
     - Stripe integration (`/api/stripe/*`)

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

# Development server (runs BOTH frontend + backend concurrently)
npm run dev
# This starts:
#   - Frontend (Vite): http://localhost:3000
#   - Backend (Express): http://localhost:3001
#   - API routes proxied: /api/* → http://localhost:3001/api/*

# Individual development servers (manual control)
npm run dev:frontend     # Vite dev server only (port 3000)
npm run dev:api          # Express backend only (port 3001)

# Build for production (Vercel deployment)
npm run build

# Preview production build locally
npm run preview

# Database management
node scripts/init-db.js              # Initialize database schema
node scripts/delete-test-users.js    # Clean up test users
```

### Local Development Setup

The app uses a **hybrid architecture** for development:

1. **Express Server** (`server/index.js`): Handles API requests during local development
   - Runs on port 3001
   - SOAP API integration (auth, test, send, ricevuta)
   - OCR endpoint
   - AI chat endpoint
   - User authentication endpoints

2. **Vite Dev Server**: Serves frontend React application
   - Runs on port 3000
   - Proxies `/api/*` requests to Express server (port 3001)
   - Hot module reloading for React components

**Setup Steps**:
1. Configure `.env.local` with all required environment variables
2. Run `npm run dev` (starts both servers via concurrently)
3. Frontend: `http://localhost:3000`
4. Backend API: `http://localhost:3001/api/*` (accessed via frontend proxy)

**Note**: For production deployment on Vercel, the Express server is **not used**. Instead, Vercel Serverless Functions in `api/` directory are deployed. The `server/` directory is only for local development convenience.

## External Services & Resources

This project relies on several external services. Access these dashboards to manage and troubleshoot:

### 📊 Database - Neon PostgreSQL
- **Dashboard**: https://console.neon.tech/
- **Purpose**: Serverless PostgreSQL database
- **Tables**: `users`, `scans`, `subscriptions`, `usage_logs`
- **Access**: Login with Neon account (integrated with Vercel)
- **Query Interface**: Use Neon's SQL Editor or Vercel's Data tab
- **Connection**: Auto-configured via Vercel environment variables

### 📧 Email - Aruba SMTP
- **Dashboard**: https://admin.aruba.it
- **Purpose**: Transactional emails (verification, password reset)
- **Current Setup**: SMTP via Nodemailer (smtps.aruba.it:465)
- **Credentials**: Configured in `SMTP_USER` and `SMTP_PASSWORD` environment variables
- **From Email**: Configure `SMTP_USER` with your Aruba email (e.g., `noreply@tuodominio.it`)
- **Troubleshooting**: Check Aruba webmail for bounce messages

### 🤖 AI/OCR - Google Gemini
- **Dashboard**: https://aistudio.google.com/apikey
- **Purpose**: Document OCR extraction and AI chat assistant
- **Model**: Gemini 2.5 Flash (free tier)
- **Limits**: 1,500 requests/day (free)
- **API Key**: Configured in `GEMINI_API_KEY` environment variable

### 💳 Payments - Stripe
- **Dashboard**: https://dashboard.stripe.com/
- **Purpose**: Subscription payments (Basic/Pro/Enterprise)
- **Test Mode**: Use test keys (`sk_test_*`, `pk_test_*`) for development
- **Webhooks**: Configure at https://dashboard.stripe.com/webhooks
- **Products**: Create subscription products and get Price IDs

### 🚀 Hosting - Vercel
- **Dashboard**: https://vercel.com/dashboard
- **Purpose**: Serverless functions, frontend hosting, CI/CD
- **Production URL**: https://alloggify.vercel.app
- **Logs**: Monitor serverless function execution and errors
- **Environment Variables**: Settings → Environment Variables
- **Deployments**: Automatic on git push to main branch

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
# ARUBA SMTP (for email verification/reset)
# Configure at: https://admin.aruba.it
# ==========================================
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_USER=noreply@tuodominio.it
SMTP_PASSWORD=TuaPasswordEmailAruba
SMTP_FROM_NAME=CheckInly

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
├── api/                         # Vercel Serverless Functions (TypeScript) - PRODUCTION ONLY
│   ├── auth/
│   │   ├── login.ts             # POST /api/auth/login - JWT authentication
│   │   ├── register.ts          # POST /api/auth/register - User registration + email
│   │   ├── verify.ts            # GET /api/auth/verify - Email verification
│   │   ├── forgot.ts            # POST /api/auth/forgot - Password reset request
│   │   └── reset.ts             # POST /api/auth/reset - Password reset confirmation
│   ├── ai/
│   │   └── chat.ts              # POST /api/ai/chat - Gemini AI assistant
│   ├── stripe/
│   │   └── create-checkout-session.ts  # POST /api/stripe/create-checkout-session
│   ├── webhooks/
│   │   └── stripe.ts            # POST /api/webhooks/stripe - Stripe webhook handler
│   ├── ocr.ts                   # POST /api/ocr - Document OCR extraction
│   └── alloggiati.ts            # POST /api/alloggiati - SOAP API proxy (unified)
├── server/                      # Express Server (LOCAL DEVELOPMENT ONLY)
│   ├── index.js                 # Express app entry point
│   ├── routes/
│   │   ├── auth.js              # SOAP auth (token generation)
│   │   ├── test.js              # Test schedina validation
│   │   ├── send.js              # Send schedina to Alloggiati Web
│   │   ├── ricevuta.js          # Download receipt PDF
│   │   ├── tabelle.js           # Download lookup tables
│   │   ├── chat.js              # AI chat endpoint
│   │   ├── user-auth.js         # User authentication (login/register/verify)
│   │   ├── ocr.js               # OCR endpoint
│   │   └── stripe-*.js          # Stripe endpoints
│   ├── utils/
│   │   └── soap.js              # SOAP client utilities
│   └── package.json             # Server dependencies
├── lib/                         # Shared backend utilities (used by api/)
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
├── App.tsx                      # React Router setup + route definitions
├── types.ts                     # TypeScript interfaces (DocumentData, User, etc.)
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel deployment config
└── .env.local                   # Environment variables
```

**Key Directories**:
- **`api/`**: Vercel Serverless Functions (TypeScript) - deployed to production on Vercel
- **`server/`**: Express server (JavaScript) - used ONLY for local development (port 3001)
- **`lib/`**: Shared utilities for serverless functions (DB, auth, SOAP)
- **`database/`**: SQL schema and migration scripts
- **`src/`**: React frontend application (Vite + React 19)
- **`components/`**: Root-level legacy components (pre-SaaS architecture)
- **`chrome-extension/`**: Browser extension for auto-fill functionality

## Architecture

### Hybrid Backend Architecture

The project uses **two parallel backend implementations**:

#### 1. Express Server (Local Development)

**Location**: `server/index.js`
**Port**: 3001
**Technology**: Node.js + Express 5
**Purpose**: Local development convenience

**Key Features**:
- All API routes in `server/routes/*.js`
- CORS configured for localhost:3000 (Vite)
- SOAP utilities in `server/utils/soap.js`
- Hot reload with nodemon (optional)

**Starting the server**:
```bash
npm run dev:api          # Start Express server on port 3001
# OR
npm run dev              # Start both Express + Vite concurrently
```

**Example Route** (`server/routes/auth.js`):
```javascript
const express = require('express');
const router = express.Router();

router.post('/api/auth/login', async (req, res) => {
  // ... authentication logic
});

module.exports = router;
```

#### 2. Vercel Serverless Functions (Production)

**Location**: `api/` directory (TypeScript)
**Deployment**: Vercel auto-deployment
**Technology**: Vercel Serverless Functions
**Purpose**: Production scaling

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

**Why Both?**
- **Local Dev**: Express provides simpler debugging, console logs, and faster iteration
- **Production**: Serverless provides auto-scaling, zero server management, and cost efficiency
- **Both implement identical endpoints** - switching from local to production is seamless

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

**News Routes** (Public):
- `/news` - News article list page with card grid
- `/news/:slug` - Individual news article detail page with alternating image/text layout

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

## News Section

**Architecture**: Content-driven news system with markdown-like rendering

**Data Structure** (`src/data/news.ts`):
- `NewsArticle` interface with metadata (title, slug, date, category, author, readTime)
- `content` field supports markdown-style syntax (headers, bold, lists, images, links)
- Images referenced via `/news/img*.png` in `public/news/` directory

**Pages**:
- **NewsListPage** (`src/pages/NewsListPage.tsx`): Grid layout with article cards, scroll animations
- **NewsDetailPage** (`src/pages/NewsDetailPage.tsx`): Full article view with alternating image/text layout

**Rendering**: Custom markdown parser in NewsDetailPage:
- Supports: Headers (# ## ###), bold (**text**), italic (*text*), lists, links [text](url), images
- **Image Layout**: Alternates left/right positioning (first section: text left + image right, second: image left + text right, etc.)
- Two-column grid on desktop (`md:grid-cols-2`), stacked on mobile

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

## Stripe Payment Integration

**Status**: ✅ **FULLY IMPLEMENTED & TESTED**

**Architecture**:
- **Checkout**: `api/stripe/create-checkout-session.ts` (Serverless) + `server/routes/stripe-checkout.js` (Local dev)
- **Webhooks**: `api/webhooks/stripe.ts` - Handles subscription lifecycle events
- **Pricing**: `lib/pricing.ts` - Centralized pricing configuration

**Pricing Plans**:
```typescript
free: { scanLimit: 5, price: €0/month }
basic: { scanLimit: 100, price: €19/month }
pro: { scanLimit: 500, price: €49/month }
enterprise: { scanLimit: 999999, price: €199/month }
```

**Webhook Events Handled**:
1. `checkout.session.completed` → Upgrade user plan, update database
2. `invoice.payment_succeeded` → Renew subscription, reset scan_count to 0
3. `customer.subscription.deleted` → Downgrade to free plan
4. `customer.subscription.updated` → Update subscription status

**Flow**:
```
User clicks "Upgrade" → POST /api/stripe/create-checkout-session
  → Stripe Checkout page → Payment → Webhook event
  → Database updated (subscription_plan, monthly_scan_limit, stripe_customer_id)
  → User redirected to dashboard with success message
```

**Database Integration**:
- Updates `users` table: `subscription_plan`, `stripe_customer_id`, `stripe_subscription_id`
- Creates/updates `subscriptions` table with period info
- Automatically resets `scan_count` on successful payment

**Environment Variables Required**:
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe Dashboard)
- `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE` - Price IDs from Stripe products

**⚠️ TODO**: Replace placeholder Price IDs (`price_xxx`) with real Stripe Price IDs from dashboard

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

## Rebranding (Alloggify → CheckInly)

**Status**: In progress - code still contains both names

**User-Facing Elements** (use CheckInly):
- Landing page copy, headers, footers
- Email templates (Resend)
- Meta tags, page titles
- News articles and blog content
- Marketing materials

**Technical/Internal Elements** (keep Alloggify for now):
- Git repository name
- localStorage keys (`alloggify_user`, `alloggify_token`, `alloggifyData`)
- Database names
- Environment variable prefixes (`VITE_ALLOGGIATI_*`)
- Function names, file names
- API endpoint paths

**Rationale**: Backward compatibility - changing technical identifiers requires migration scripts and could break existing deployments.

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

### Adding New API Endpoints

You need to implement endpoints in **both places** for consistency:

#### For Local Development (Express):

1. Create route file in `server/routes/` (e.g., `server/routes/example.js`)
2. Implement Express router with middleware
3. Register route in `server/index.js`
4. Test with `npm run dev:api` → API at `http://localhost:3001/api/example`

**Example** (`server/routes/example.js`):
```javascript
const express = require('express');
const router = express.Router();

router.post('/api/example', async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### For Production (Vercel Serverless):

1. Create `.ts` file in `api/` directory (e.g., `api/example.ts`)
2. Export default async handler with `VercelRequest` and `VercelResponse` types
3. Import helper functions from `lib/` (db, auth, soap)
4. Handle errors with try/catch and appropriate status codes

**Example** (`api/example.ts`):
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res);
  if (!user) return; // Auth failed, response already sent

  // Your logic here (should match Express implementation)
  return res.status(200).json({ message: 'Success' });
}
```

**Important**: Keep both implementations in sync! When adding features, update both `server/routes/` and `api/` directories.

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
- **Local Development**: Express routes in `server/routes/` (auth.js, test.js, send.js, ricevuta.js, tabelle.js)
- **Production**: Serverless function `api/alloggiati.ts` - unified endpoint with action-based routing
- **SOAP Utilities**:
  - `lib/soap.ts` - TypeScript utilities for serverless functions
  - `server/utils/soap.js` - JavaScript utilities for Express server
- **Testing SOAP Calls**: Use Postman/Insomnia or test via frontend "API Alloggiati Web" panel
- **Error Handling**: SOAP errors parsed and returned as JSON in both implementations

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

### Backend and CORS
- **Express Server**: CORS configured in `server/index.js` for localhost:3000 and Vercel domains
- **Vercel Serverless**: Automatically handles CORS
- API calls from frontend to `/api/*` are proxied (no CORS issues)
- SOAP API proxy handles external SOAP calls server-side (both Express and serverless)
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
