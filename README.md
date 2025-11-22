<div align="center">

# 🏠 CheckInly

### AI-Powered Hospitality Management SaaS

*Automate your Alloggiati Web workflow with AI-powered document scanning*

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com)

**Live Demo:** [https://alloggify.vercel.app](https://alloggify.vercel.app)

</div>

---

## 📖 About

**CheckInly** is a complete SaaS platform that automates the Italian hospitality reporting process. It extracts data from identity documents using Google's Gemini AI and automatically submits guest information to the **Alloggiati Web** portal (Italian police hospitality reporting system), reducing manual data entry time from 20 minutes to **30 seconds**.

### 🎯 Perfect For:
- 🏨 **Hotels & B&Bs** managing daily check-ins
- 🏡 **Vacation Rentals** (Airbnb, Booking.com hosts)
- 🏢 **Property Managers** handling multiple properties
- 👥 **Hospitality Professionals** in Italy

### 🚀 Key Benefits:
- ⚡ **30 Seconds per Guest** - vs 15-20 minutes manual entry
- 🤖 **99% OCR Accuracy** - Powered by Gemini 2.5 Flash AI
- 📧 **Auto-Submit** - Direct integration with Alloggiati Web SOAP API
- 💳 **Flexible Plans** - Free tier + paid subscriptions (Stripe)
- 🔒 **Secure & Compliant** - GDPR-compliant with EU servers
- 💬 **AI Assistant** - 24/7 help for Italian hospitality regulations

---

## ✨ Features

### 🔍 Smart Document Recognition
- **Multi-format support**: Italian ID cards (standard & electronic), passports, driving licenses, international documents
- **AI-powered OCR**: Gemini 2.5 Flash for accurate data extraction
- **Intelligent classification**: Automatically identifies document type
- **99% accuracy**: Field-level validation and error correction
- **Batch processing**: Upload multiple documents (coming soon)

### 🔐 Authentication & User Management
- **Email/Password Registration** with email verification
- **Google OAuth** for quick sign-up
- **JWT-based authentication** with secure session management
- **Password reset** via email (Aruba SMTP)
- **Multi-user support** with user isolation

### 💳 Subscription Plans (Stripe Integration)
- **Free Plan**: 5 scansioni/mese (permanent)
- **Basic Plan**: 100 scansioni - €19/mese (or €15/mese annual)
- **Pro Plan**: 500 scansioni - €49/mese (or €39/mese annual) - **RECOMMENDED**
- **Enterprise Plan**: Unlimited scans - €199/mese (custom pricing)
- **Stripe Checkout**: Secure payment processing
- **Automatic renewal**: Scan limits reset monthly

### 📤 Direct SOAP API Integration
- **Automatic submission** to Alloggiati Web portal
- **WSKEY authentication** for secure API access
- **Real-time validation** before submission
- **Receipt download** as PDF with automatic archiving
- **Token management** with auto-refresh
- **Error handling** with detailed messages

### 🤖 AI Chat Assistant
- **24/7 Availability** for hospitality questions
- **Expert knowledge** on:
  - Italian hospitality regulations (D.Lgs. 286/1998)
  - Alloggiati Web portal procedures
  - Pricing & revenue management
  - OTA platforms (Airbnb, Booking.com)
- **Markdown support** with emoji rendering
- **Suggested questions** for quick help

### 📊 Dashboard & Analytics
- **Usage tracking**: Monitor monthly scan count
- **Scan history**: View all submitted guests
- **Subscription management**: Upgrade/downgrade plans
- **Receipt archive**: Download past submissions
- **User profile**: Manage account settings

### 🔒 Privacy & Security
- **GDPR Compliant** - EU server hosting (Vercel)
- **Encrypted transmission** - HTTPS + SOAP encryption
- **No data retention** - Documents processed in memory only
- **User isolation** - Multi-tenant architecture
- **Secure credentials** - JWT tokens with expiry

### 📧 Email Notifications
- **Welcome email** on registration (Google OAuth)
- **Verification email** for email/password signup
- **Password reset** emails with secure tokens
- **Aruba SMTP** for reliable delivery (port 587 STARTTLS)

---

## 🚀 Quick Start

### For End Users (Production)

1. **Visit the App**
   - Go to [https://alloggify.vercel.app](https://alloggify.vercel.app)

2. **Create Account**
   - Click "Registrati Gratuitamente"
   - Sign up with email/password OR Google OAuth
   - Verify your email (if using email/password)

3. **Upload Document**
   - Login to dashboard
   - Click "Carica Documento"
   - Select an ID document image (JPG, PNG)
   - Wait 2-5 seconds for AI processing

4. **Submit to Alloggiati Web**
   - Review auto-filled form data
   - Expand "API Alloggiati Web" panel
   - Enter credentials (Username, Password, WSKEY)
   - Click "Connetti" to authenticate
   - Click "Invia Direttamente" to submit
   - Download PDF receipt

5. **Upgrade (Optional)**
   - Click "Upgrade" in navbar when you hit scan limit
   - Choose plan (Basic/Pro/Enterprise)
   - Complete Stripe checkout
   - Scan limits automatically increased

---

### For Developers (Local Development)

#### Prerequisites
- **Node.js** v20+ (specified in package.json engines)
- **Neon PostgreSQL** database (or local Postgres)
- **Aruba SMTP** account (or other SMTP service)
- **Gemini API Key** ([Get free](https://ai.google.dev/))
- **Stripe Account** (for payment testing)

#### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/fracabu/Alloggify.git
   cd Alloggify
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create `.env.local` in project root:

   ```env
   # ==========================================
   # FRONTEND URL
   # ==========================================
   NEXT_PUBLIC_URL=http://localhost:3000

   # ==========================================
   # JWT SECRET (REQUIRED)
   # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # ==========================================
   JWT_SECRET=your_generated_secret_here

   # ==========================================
   # ARUBA SMTP (Email Verification/Reset)
   # ==========================================
   SMTP_HOST=smtps.aruba.it
   SMTP_PORT=587
   SMTP_USER=welcome@checkinly.it
   SMTP_PASSWORD=your_password_here
   SMTP_FROM_NAME=CheckInly

   # ==========================================
   # GEMINI API KEY (OCR + AI Chat)
   # Get free: https://aistudio.google.com/apikey
   # ==========================================
   GEMINI_API_KEY=your_gemini_api_key_here

   # ==========================================
   # VERCEL POSTGRES (Neon Database)
   # Copy from: Vercel Dashboard → Storage → Postgres
   # ==========================================
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   POSTGRES_USER="..."
   POSTGRES_HOST="..."
   POSTGRES_PASSWORD="..."
   POSTGRES_DATABASE="..."

   # ==========================================
   # STRIPE (Payments)
   # ==========================================
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_BASIC=price_xxx
   STRIPE_PRICE_PRO=price_xxx
   STRIPE_PRICE_ENTERPRISE=price_xxx

   # ==========================================
   # BACKEND URL (for local dev)
   # ==========================================
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. **Initialize Database**
   ```bash
   node scripts/init-db.js
   ```

5. **Start Development Server**

   The app uses a **hybrid architecture**:
   - **Vite dev server** (frontend) on port 3000
   - **Express server** (local API) on port 3001

   Start both concurrently:
   ```bash
   npm run dev
   ```

   OR start individually:
   ```bash
   npm run dev:frontend  # Port 3000
   npm run dev:api       # Port 3001
   ```

6. **Access the App**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001/api/*`

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | Modern UI with hooks |
| **Build Tool** | Vite 6.2 | Fast HMR and builds |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | React Context API | Auth state management |
| **Routing** | React Router v7 | Client-side routing |
| **Backend (Local)** | Express 5 | Local development API |
| **Backend (Prod)** | Vercel Serverless | Scalable cloud functions |
| **Database** | Neon PostgreSQL | Serverless SQL database |
| **ORM** | @vercel/postgres | Tagged template queries |
| **Auth** | JWT + bcrypt | Secure authentication |
| **Email** | Nodemailer + Aruba SMTP | Transactional emails |
| **AI/OCR** | Gemini 2.5 Flash | Document extraction |
| **Payments** | Stripe | Subscription billing |
| **Hosting** | Vercel | Edge network deployment |

### Hybrid Backend

The app uses **two parallel backend implementations**:

#### 1. Express Server (Local Development)
- **Location**: `server/index.js`
- **Port**: 3001
- **Purpose**: Local development convenience
- **Features**: Hot reload, console logs, simpler debugging

#### 2. Vercel Serverless Functions (Production)
- **Location**: `api/` directory (TypeScript)
- **Technology**: Vercel Serverless Functions
- **Purpose**: Production scaling
- **Features**: Auto-scaling, zero server management

Both implement **identical endpoints**:
- `/api/auth/*` - User authentication
- `/api/ocr` - Document OCR
- `/api/alloggiati` - SOAP API proxy
- `/api/ai/chat` - AI assistant
- `/api/stripe/*` - Payment processing
- `/api/webhooks/stripe` - Stripe webhooks

### Database Schema

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  full_name VARCHAR,
  company_name VARCHAR,
  email_verified BOOLEAN,
  verification_token VARCHAR,
  verification_token_expires TIMESTAMP,
  google_id VARCHAR UNIQUE,
  subscription_plan VARCHAR DEFAULT 'free',
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  monthly_scan_limit INTEGER DEFAULT 5,
  scan_count INTEGER DEFAULT 0,
  last_scan_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Scans table
scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_type VARCHAR,
  extracted_data JSONB,
  alloggiati_receipt_number VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Subscriptions table
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  plan_name VARCHAR,
  status VARCHAR,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Usage logs table
usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR,
  metadata JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 💻 Usage

### 1. Registration & Login

**Email/Password Method:**
1. Click "Registrati Gratuitamente"
2. Fill in email, password, nome struttura (optional)
3. Check email for verification link
4. Click link → Email verified
5. Login with email/password

**Google OAuth Method:**
1. Click "Continua con Google"
2. Select Google account
3. Auto-creates account (email already verified)
4. Receives welcome email
5. Auto-logged in or redirected to login

### 2. Document Scanning & OCR

1. **Upload Document**
   - Click "Carica Documento" button in sidebar
   - Select image file (JPG, PNG, HEIC, etc.)
   - Supported documents:
     - Carta d'Identità (standard & elettronica)
     - Passaporto Ordinario
     - Patente di Guida
     - International passports

2. **AI Processing**
   - Wait 2-5 seconds for Gemini 2.5 Flash OCR
   - Data automatically fills form fields
   - Scan counter increments (X/Y scansioni usate)

3. **Review Data**
   - Verify extracted information:
     - Tipo Alloggiato, Data Arrivo, Permanenza
     - Cognome, Nome, Sesso, Data di Nascita
     - Luogo/Stato di Nascita, Cittadinanza
     - Tipo Documento, Numero, Luogo Rilascio
   - Edit any incorrect fields

### 3. SOAP API Integration

1. **Expand "API Alloggiati Web" Panel**
   - Click header to show/hide panel

2. **Enter Credentials**
   - **Nome Utente**: Your Alloggiati Web username
   - **Password**: Your Alloggiati Web password
   - **WSKEY**: Your Web Service Key (see guide below)

3. **Authenticate**
   - Click "Connetti" button
   - System generates session token
   - Status shows "✓ Connesso" with time remaining

4. **Test Validation (Optional)**
   - Click "🧪 Test Validazione" button
   - System validates data with Alloggiati Web
   - Returns success/error message

5. **Submit Schedina**
   - Click "📤 Invia Direttamente" button
   - Confirmation modal appears
   - Review data preview
   - Click "Conferma"
   - Wait 5-10 seconds for submission
   - Receive success message with receipt number

6. **Download Receipt**
   - In "Scarica Ricevuta" section
   - Select date (last 30 days)
   - Click "📄 PDF" button
   - PDF downloads automatically

### 4. Subscription Management

**Check Current Plan:**
- View in navbar: "Piano: Free • Scansioni: 3/5"

**Upgrade Plan:**
1. Click "Upgrade" button when limit reached (auto-redirect)
2. OR navigate to `/upgrade` page
3. Choose plan:
   - **Basic**: €19/mese (100 scansioni)
   - **Pro**: €49/mese (500 scansioni) - RECOMMENDED
   - **Enterprise**: €199/mese (Unlimited)
4. Click "Passa a [Piano]"
5. Redirected to Stripe Checkout
6. Complete payment
7. Stripe webhook updates database
8. Scan limit automatically increased
9. Redirected back to dashboard

**Monthly Reset:**
- Scan counters reset automatically on subscription renewal
- Webhook handler: `/api/webhooks/stripe`
- Event: `invoice.payment_succeeded`

---

## 🔑 How to Obtain Your WSKEY

The **WSKEY (Web Service Key)** enables automatic API submission to Alloggiati Web.

### Step-by-Step Guide:

1. **Login to Portal**
   - Go to [Alloggiati Web](https://alloggiatiweb.poliziadistato.it)
   - Enter username and password

2. **Navigate to WSKEY Section**
   - Click **"Profilo"** (top menu)
   - Select **"Chiave Web Service"**

3. **Generate Key**
   - Click **"Genera Chiave"** button
   - Copy the Base64 key (format: `XXX...XXX==`)
   - Example: `AFWxClHwW6PKdenzGh0nsQMiFqttTvH2...==`

4. **Use in CheckInly**
   - Enter WSKEY in "API Alloggiati Web" panel
   - Click "Connetti"
   - If successful, WSKEY is valid

### Important Notes:
- ⚠️ **Keep WSKEY Secret** - Treat like a password
- 🔄 **Regenerate Anytime** - From portal if needed
- ⏱️ **WSKEY vs Token**:
  - WSKEY: Permanent credential
  - Token: Session token (expires after 30-60 min)

---

## 🤖 AI Chat Assistant

CheckInly includes a **24/7 AI assistant** powered by Gemini 2.5 Flash to help with:

### Topics Covered:
- 📋 **Hospitality Management**: Check-in procedures, guest data
- 📜 **Italian Regulations**: D.Lgs. 286/1998, police reporting requirements
- 🏨 **Alloggiati Web Portal**: Navigation, troubleshooting, procedures
- 💰 **Revenue Management**: Pricing strategies, dynamic pricing
- 🌐 **OTA Platforms**: Airbnb, Booking.com, integration tips
- ❓ **General Questions**: Best practices, industry standards

### Usage:
1. Click floating chat icon (💬) in bottom-right corner
2. Type your question or select suggested question
3. AI responds with detailed, context-aware answer
4. Supports markdown formatting with emoji
5. Chat history preserved during session

### Example Questions:
- "Quali documenti sono validi per l'Alloggiati Web?"
- "Come gestisco un ospite straniero senza documento italiano?"
- "Cosa fare se il portale Alloggiati Web non risponde?"
- "Come calcolo il prezzo per un weekend lungo?"

---

## 📋 Available Scripts

### Frontend (Root Directory)
```bash
npm install          # Install all dependencies
npm run dev          # Start both frontend + backend (concurrently)
npm run dev:frontend # Start only Vite dev server (port 3000)
npm run dev:api      # Start only Express server (port 3001)
npm run build        # Build for production (Vercel)
npm run preview      # Preview production build locally
```

### Database Scripts
```bash
node scripts/init-db.js              # Initialize database schema
node scripts/delete-test-users.js    # Clean up test users
```

### Email Testing
```bash
node scripts/test-email.cjs          # Test Aruba SMTP configuration
```

---

## 🚀 Deployment (Vercel)

### Initial Setup

1. **Connect GitHub Repository**
   - Login to [Vercel](https://vercel.com)
   - Import GitHub repository
   - Vercel auto-detects Vite configuration

2. **Add Neon PostgreSQL**
   - Vercel Dashboard → Storage → Add → Postgres
   - Automatically creates Neon database
   - Auto-injects `POSTGRES_*` environment variables

3. **Configure Environment Variables**
   - Settings → Environment Variables
   - Add all variables from `.env.local` example
   - **Required variables:**
     - `JWT_SECRET` (generate with `crypto.randomBytes(32).toString('hex')`)
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`
     - `GEMINI_API_KEY`
     - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`
     - `NEXT_PUBLIC_URL` (e.g., `https://checkinly.vercel.app`)

4. **Initialize Database**
   - Copy `POSTGRES_URL` from Vercel environment variables
   - Run locally: `node scripts/init-db.js`
   - OR run SQL directly in Vercel Postgres Query tab

5. **Configure Stripe Webhook**
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
   - Events to listen:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

6. **Deploy**
   - Push to `main` branch on GitHub
   - Vercel auto-deploys
   - Check deployment logs for errors

### Post-Deployment

1. **Test Registration Flow**
   - Visit production URL
   - Register new user
   - Check email delivery

2. **Test OCR**
   - Upload document
   - Verify data extraction
   - Check scan counter

3. **Test SOAP API**
   - Enter Alloggiati Web credentials
   - Submit test schedina
   - Verify receipt download

4. **Test Stripe (Test Mode)**
   - Attempt upgrade
   - Use test card: `4242 4242 4242 4242`
   - Verify webhook triggers
   - Check database updates

---

## 🛠️ Troubleshooting

### Authentication Issues

**"Devi verificare la tua email prima di accedere"**
- Check email inbox/spam for verification link
- Resend verification email (feature TODO)
- Ensure `SMTP_PORT=587` in Vercel environment

**Google OAuth doesn't send welcome email**
- Check Vercel logs for `/api/auth/google/callback`
- Look for "Welcome email sent" or error message
- Verify `SMTP_*` environment variables

### Email Delivery Issues

**Emails not arriving (Aruba SMTP)**
- Verify `SMTP_PORT=587` (NOT 465)
- Check `SMTP_USER` and `SMTP_PASSWORD` are correct
- Confirm email account exists and SMTP is enabled
- Check Aruba firewall/IP whitelisting

**How to test email:**
```bash
node scripts/test-email.cjs
```

### Database Errors

**"Missing database credentials"**
- Ensure all `POSTGRES_*` variables are set in Vercel
- For local dev, copy from Vercel → Settings → Environment Variables

**"Table does not exist"**
- Run: `node scripts/init-db.js`
- OR copy SQL from `database/schema.sql` and run in Neon console

### Stripe Integration Issues

**"No more than 12 Serverless Functions"** (Vercel Hobby plan)
- Current count: 12 functions (exactly at limit)
- Remove `api/test-email.ts` if added
- Upgrade to Pro plan for unlimited functions

**Webhook not triggering**
- Verify webhook URL in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` matches
- Test with Stripe CLI: `stripe trigger checkout.session.completed`
- Check Vercel logs for errors

### SOAP API Issues

**"Token scaduto o non valido"**
- Token expired (30-60 min timeout)
- Re-authenticate: Click "Riconnetti"
- Enter credentials again

**"WSKEY non valida"**
- Verify WSKEY is copied correctly (no spaces)
- WSKEY format: Base64 ending with `==`
- Regenerate from portal: Profilo → Chiave Web Service

**"Backend server not responding" (Local Dev)**
- Ensure Express server is running: `npm run dev:api`
- Check port 3001 is not blocked
- Verify `VITE_BACKEND_URL=http://localhost:3001`

---

<!--
## 🗄️ LEGACY: Chrome Extension (Deprecated)

**Note**: The Chrome Extension method is NO LONGER supported in the current SaaS version.
The extension code remains in the `chrome-extension/` directory for reference but is not
actively maintained or offered to users.

### Why Deprecated:
- SaaS approach provides better user experience
- SOAP API is more reliable than client-side localStorage
- Centralized authentication and usage tracking
- Subscription management requires server-side logic
- Chrome Extension button is hidden in UI (MainForm.tsx lines 182-190)

### Legacy Documentation:
If you need to use the Chrome Extension for local development:
1. Load extension in Chrome: chrome://extensions/ → Developer Mode → Load unpacked
2. Select `chrome-extension/` folder
3. Navigate to Alloggiati Web portal
4. Extension injects floating "Compila da Alloggify" button
5. Data fills form from localStorage

This method is NO LONGER recommended for production use.
-->

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Report Bugs** - Open [GitHub issue](https://github.com/fracabu/Alloggify/issues)
2. **Suggest Features** - Share ideas in issues
3. **Submit Pull Requests**:
   - Fork repository
   - Create feature branch: `git checkout -b feature/amazing-feature`
   - Commit changes: `git commit -m 'Add amazing feature'`
   - Push branch: `git push origin feature/amazing-feature`
   - Open Pull Request

### Development Guidelines
- Follow existing code style (TypeScript + ESLint)
- Test with multiple document types
- Update `CLAUDE.md` if adding major features
- Never commit `.env.local` or API keys
- Document new environment variables

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powerful OCR capabilities
- **Vercel** - Serverless hosting platform
- **Neon** - Serverless PostgreSQL database
- **Stripe** - Payment processing
- **React Team** - Amazing framework
- **Vite Team** - Blazing-fast build tool
- Italian hospitality professionals - Inspiration for this tool

---

## 📧 Contact & Support

- **Live App**: [https://alloggify.vercel.app](https://alloggify.vercel.app)
- **GitHub Issues**: [Report bugs](https://github.com/fracabu/Alloggify/issues)
- **Developer**: [@fracabu](https://github.com/fracabu)

---

<div align="center">

**Made with ❤️ for the Italian Hospitality Industry**

⭐ **Star this repo if you find it useful!**

[Get Started](https://alloggify.vercel.app) • [Documentation](CLAUDE.md) • [Report Bug](https://github.com/fracabu/Alloggify/issues)

</div>
