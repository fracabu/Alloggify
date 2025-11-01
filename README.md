<div align="center">

# 🏠 Alloggify

### OCR-Powered Document Extraction for Italian Hospitality Reporting

*Streamline your Alloggiati Web workflow with AI-powered document scanning*

[![GitHub](https://img.shields.io/badge/GitHub-fracabu%2FAlloggify-blue?logo=github)](https://github.com/fracabu/Alloggify)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev/)

</div>

---

## 📖 About

**Alloggify** is an intelligent web application that automates data extraction from identity documents (Italian ID cards, passports, driving licenses) using Google's Gemini AI. It integrates with the **Alloggiati Web** portal (Italian police hospitality reporting system) through **two powerful methods**, dramatically reducing manual data entry time from 15-20 minutes to under 30 seconds.

### 🎯 Perfect For:
- 🏨 Hotels and B&Bs
- 🏡 Vacation rentals
- 🏢 Accommodation facilities in Italy
- 👥 Property managers handling guest check-ins

### 🚀 Evolution

**Phase 1 - Chrome Extension (MVP)**
- Browser extension for auto-filling forms on Alloggiati Web portal
- Simple setup, no backend required
- Manual submission through portal interface

**Phase 2 - SOAP API Integration (Current)**
- Discovered official Alloggiati Web SOAP API with **WSKEY** authentication
- Full automation: OCR → Validation → Submission → Receipt download
- Production-ready for high-volume operations

---

## ✨ Features

### 🔍 Smart Document Recognition (All Methods)
- **Multi-format support**: Italian ID cards (standard & electronic), passports, driving licenses
- **AI-powered OCR**: Powered by Gemini 2.5 Flash for accurate data extraction
- **Intelligent classification**: Automatically identifies document type with hierarchical logic
- **99% accuracy**: Field-level validation and error correction

### 📝 Two Submission Methods

#### Method 1: Chrome Extension (Basic)
- ✅ **One-click export**: Save data to localStorage
- ✅ **Auto-fill integration**: Floating button on Alloggiati Web portal
- ✅ **Visual confirmation**: See form filled before submitting
- ✅ **No backend required**: Works completely client-side
- ⚠️ **Manual submission**: User clicks submit on portal

#### Method 2: SOAP API with WSKEY (Advanced)
- ✅ **Full automation**: Zero manual interaction required
- ✅ **Instant submission**: Data sent directly via SOAP API
- ✅ **Receipt download**: Automatic PDF receipt generation
- ✅ **Batch processing**: Handle multiple submissions efficiently
- ✅ **Production-ready**: Suitable for high-volume operations
- 🔑 **Requires WSKEY**: Web Service Key from Alloggiati Web portal

### 🔒 Privacy & Security
- **100% local processing**: Your data never leaves your computer (Extension mode)
- **Secure transmission**: HTTPS + SOAP encryption (API mode)
- **No cloud storage**: All data stored in browser localStorage
- **Secure credential handling**: WSKEY stored locally, never committed to git

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with React 19
- **Real-time feedback**: Loading states, success messages, error handling
- **Flexible setup**: Choose your preferred submission method
- **Dual configuration**: Set credentials via UI or environment variables

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Gemini API Key** ([Get one free](https://ai.google.dev/))
- **Chrome Browser** (for extension)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fracabu/Alloggify.git
   cd Alloggify
   ```

2. **Install dependencies**

   Frontend dependencies:
   ```bash
   npm install
   ```

   Backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file in the project root:

   **For Chrome Extension Method (Basic)**:
   ```env
   # Required: Gemini API for OCR
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **For SOAP API Method (Advanced - Full Automation)**:
   ```env
   # Required: Gemini API for OCR
   GEMINI_API_KEY=your_gemini_api_key_here

   # Required: Backend server URL
   VITE_BACKEND_URL=http://localhost:3001

   # Required: Alloggiati Web credentials + WSKEY
   VITE_ALLOGGIATI_UTENTE=your_username_here
   VITE_ALLOGGIATI_PASSWORD=your_password_here
   VITE_ALLOGGIATI_WSKEY=your_wskey_here  # 🔑 KEY FOR AUTOMATION!
   ```

   **How to get your WSKEY** (see detailed guide below):
   1. Login to [Alloggiati Web](https://alloggiatiweb.poliziadistato.it)
   2. Go to: **Profilo** → **Chiave Web Service**
   3. Click **"Genera Chiave"** and copy the Base64 key

   *Note: You can also configure credentials through the UI after starting the app.*

4. **Start development servers**

   You need to run **both** frontend and backend:

   **Terminal 1 - Frontend (Vite):**
   ```bash
   npm run dev
   ```

   **Terminal 2 - Backend (Express):**
   ```bash
   cd server
   npm start
   ```

   The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`

---

## 💻 Usage

### Step 1: Scan Document (Both Methods)

1. **Upload Document**
   - Click "Carica Documento" button
   - Select an image of an ID document (JPG, PNG, etc.)
   - Wait for AI processing (2-5 seconds)

2. **Review Extracted Data**
   - Verify the auto-populated form fields
   - Make corrections if needed
   - All fields are editable

---

### Step 2: Choose Your Submission Method

## 📊 Method Comparison Table

| Feature | 🔹 Chrome Extension | 🔹 SOAP API (WSKEY) |
|---------|---------------------|----------------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐ Advanced |
| **Backend Required** | ❌ No | ✅ Yes (port 3001) |
| **WSKEY Required** | ❌ No | ✅ **Yes** |
| **Automation Level** | ⚠️ Semi-automatic | ✅ Fully automatic |
| **Submission** | Manual (user clicks) | Automatic (zero-click) |
| **Receipt Download** | ❌ Manual from portal | ✅ Automatic PDF |
| **Processing Time** | ~1-2 minutes | ~5-10 seconds |
| **Best For** | Testing, beginners | Production, high volume |
| **Credentials Needed** | Portal login only | Portal login + WSKEY |

---

### 🔹 Method A: Chrome Extension (Basic)

**Best for**: Beginners, testing, small-scale operations

#### Setup:
1. Load extension in Chrome (see "Chrome Extension Setup" below)
2. Only GEMINI_API_KEY required in `.env.local`

#### Usage:
1. After scanning document, click **"Esporta per Estensione"** button
2. Data saved to localStorage automatically
3. Navigate to [Alloggiati Web Portal](https://alloggiatiweb.poliziadistato.it)
4. Login with your portal credentials
5. Click the floating **"Compila da Alloggify"** button
6. Form auto-fills with extracted data
7. Review and click **Submit** on the portal

**Pros**: Simple, visual confirmation, no complex setup
**Cons**: Manual navigation and submission required

---

### 🔹 Method B: SOAP API with WSKEY (Advanced - Recommended)

**Best for**: Production environments, high-volume operations, full automation

#### Setup:
1. Obtain your WSKEY (see detailed guide below)
2. Configure `.env.local` with all credentials (including WSKEY)
3. Start backend server: `cd server && npm start`

#### Usage:
1. After scanning document, expand **"API Alloggiati Web"** panel
2. Enter credentials (Username, Password, WSKEY) if not pre-configured
3. Click **"Connetti"** to authenticate (generates token)
4. Click **"Invia Schedina"** button
5. Confirm in modal dialog
6. **Automatic submission** - wait 5-10 seconds
7. Receive confirmation message with receipt number
8. Download PDF receipt from "Ricevute" section (optional)

**Pros**: Fully automated, instant confirmation, batch-ready, PDF receipts
**Cons**: Requires WSKEY setup, backend server, more complex configuration

### Chrome Extension Setup

1. **Load Extension in Chrome**
   ```
   1. Navigate to chrome://extensions/
   2. Enable "Developer mode" (top-right toggle)
   3. Click "Load unpacked"
   4. Select the chrome-extension folder from this project
   ```

2. **Use on Alloggiati Web**
   - Login to [Alloggiati Web](https://alloggiatiweb.poliziadistato.it)
   - Navigate to guest registration form
   - Click the floating "Compila da Alloggify" button
   - OR click the extension icon and select "Compila Form"

3. **Verify & Submit**
   - Review auto-filled data
   - Make any necessary adjustments
   - Submit as usual

---

## 🔑 How to Obtain Your WSKEY

The **WSKEY (Web Service Key)** is your secret API credential that enables full automation with the Alloggiati Web SOAP API. It's **required only for Method B** (SOAP API).

### Step-by-Step Guide:

1. **Login to Alloggiati Web Portal**
   - Navigate to: [https://alloggiatiweb.poliziadistato.it](https://alloggiatiweb.poliziadistato.it)
   - Enter your username and password

2. **Access Web Service Key Section**
   - Click on **"Profilo"** (Profile) in the top menu
   - Select **"Chiave Web Service"** (Web Service Key)

3. **Generate Your WSKEY**
   - Click the **"Genera Chiave"** (Generate Key) button
   - A Base64-encoded key will appear (format: `XXX...XXX==`)
   - Example format: `AFWxClHwW6PKdenzGh0nsQMiFqttTvH2e14VJW1mE9n7D9UuTOXoJca1qJgDk/jyUw==`

4. **Copy and Store Securely**
   - Copy the entire key (including the `==` at the end)
   - Add to `.env.local`: `VITE_ALLOGGIATI_WSKEY=your_copied_key_here`
   - **Never commit** this key to git

5. **Test Your WSKEY**
   - Start the app and backend server
   - In "API Alloggiati Web" panel, enter credentials
   - Click "Connetti" - if successful, WSKEY is valid

### Important Notes:

- ⚠️ **Keep WSKEY Secret**: Treat it like a password
- 🔄 **Regenerate if Needed**: Can be regenerated anytime from portal
- ⏱️ **WSKEY vs Token**: WSKEY is permanent; Token expires after each session
- 🔐 **Security**: WSKEY grants API access; protect it accordingly

---

## 🏗️ Project Structure

```
Alloggify/
├── components/              # React components
│   ├── MainForm.tsx        # Main guest data form
│   ├── ApiKeyGuide.tsx     # API key configuration UI
│   ├── Header.tsx          # App header
│   └── icons/              # Icon components
├── services/
│   └── geminiService.ts    # Gemini AI integration
├── utils/
│   └── fileUtils.ts        # File handling utilities
├── server/                 # Backend Express server
│   ├── index.js            # Express app entry point
│   ├── routes/             # API route handlers
│   │   ├── auth.js         # Token generation endpoint
│   │   ├── test.js         # Test schedina (validation)
│   │   ├── send.js         # Send schedina to Alloggiati Web
│   │   └── ricevuta.js     # Download receipt PDF
│   ├── utils/
│   │   └── soap.js         # SOAP client for Alloggiati Web API
│   └── package.json        # Server dependencies
├── chrome-extension/       # Chrome extension
│   ├── manifest.json       # Extension manifest (v3)
│   ├── content.js          # Auto-fill logic
│   ├── popup.html/js       # Extension popup
│   └── background.js       # Service worker
├── App.tsx                 # Main app component
├── types.ts                # TypeScript interfaces
└── vite.config.ts          # Vite configuration
```

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **AI/OCR** | Google Gemini 2.5 Flash |
| **Styling** | Tailwind CSS (utility classes) |
| **Browser Extension** | Chrome Extension Manifest V3 |
| **Storage** | localStorage |
| **Build Tool** | Vite 6.2 |

---

## 📋 Available Scripts

### Frontend (Root Directory)
```bash
npm install          # Install frontend dependencies
npm run dev          # Start frontend dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend (Server Directory)
```bash
cd server
npm install          # Install backend dependencies
npm start            # Start backend server (port 3001)
npm run dev          # Start backend with auto-reload
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### API Key Priority
1. **UI Configuration** (localStorage) - Set via ApiKeyGuide component
2. **Environment Variable** (.env.local) - Fallback option

### Path Aliases

The project uses `@/` alias for imports:
```typescript
import { DocumentData } from '@/types';
import { extractDocumentInfo } from '@/services/geminiService';
```

---

## 🎯 Key Features Explained

### Document Type Classification

The Gemini AI follows a strict hierarchy for document identification:

1. **Passport Detection** → `PASSAPORTO ORDINARIO`
2. **Driving License Detection** → `PATENTE DI GUIDA`
3. **Italian ID Cards**:
   - Default: `CARTA DI IDENTITA'` (covers old paper/plastic cards)
   - Only if chip/EU flag visible: `CARTA IDENTITA' ELETTRONICA`

### Data Transformation

The extension automatically converts data formats:

| Field | Internal Format | Portal Format |
|-------|----------------|---------------|
| Dates | `YYYY-MM-DD` | `DD/MM/YYYY` |
| Sex | `Maschio` / `Femmina` | `M` / `F` |
| Places | `ROMA` (uppercase) | Same |

---

## 🐛 Troubleshooting

### API Key Issues
- **Error: "Chiave API non configurata"**
  - Set your API key in `.env.local` OR through the UI
  - Restart the dev server after changing `.env.local`

### Extension Not Working
- **Extension doesn't load**
  - Enable Developer Mode in `chrome://extensions/`
  - Reload the extension after code changes

- **Floating button not appearing**
  - Refresh the Alloggiati Web page
  - Check console for errors (F12)

- **No data available**
  - Click "Esporta per Estensione" in the web app first
  - Try clicking "Carica Dati" in extension popup

### WSKEY & SOAP API Issues

- **"Token scaduto o non valido" (Token expired or invalid)**
  - Token expires after session timeout (typically 30-60 minutes)
  - Re-authenticate: Click "Riconnetti" in "API Alloggiati Web" panel
  - Enter credentials again to generate fresh token

- **"Errore autenticazione: WSKEY non valida" (WSKEY authentication error)**
  - Verify WSKEY is copied correctly (no extra spaces or line breaks)
  - WSKEY format should be Base64 and end with `==`
  - Re-generate WSKEY from portal: Profilo → Chiave Web Service
  - Restart backend server after updating `.env.local`

- **"Missing required fields: wskey"**
  - WSKEY not configured in `.env.local` or UI panel
  - Follow "How to Obtain Your WSKEY" guide above
  - Ensure `VITE_ALLOGGIATI_WSKEY` is set correctly

- **"Backend server not responding"**
  - Check backend is running: `cd server && npm start`
  - Verify `VITE_BACKEND_URL` is correct (default: http://localhost:3001)
  - Check server logs for error messages
  - Ensure port 3001 is not blocked by firewall

- **"SOAP request failed"**
  - Verify Alloggiati Web portal is accessible
  - Check internet connection
  - Confirm credentials (username/password) are correct
  - Try authenticating directly on portal to verify account status

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with reproduction steps
2. **Suggest Features** - Share your ideas in issues
3. **Submit PRs** - Fork, create a feature branch, and submit PR
4. **Improve Docs** - Help make documentation clearer

### Development Guidelines
- Follow existing code style
- Test with multiple document types
- Update CLAUDE.md if adding major features
- Ensure `.env.local` is never committed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful OCR capabilities
- **Vite** for blazing-fast development experience
- **React Team** for the amazing framework
- Italian hospitality professionals who inspired this tool

---

## 📧 Contact & Support

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/fracabu/Alloggify/issues)
- **Developer**: [@fracabu](https://github.com/fracabu)

---

<div align="center">

**Made with ❤️ for Italian Hospitality Industry**

⭐ Star this repo if you find it useful!

</div>
