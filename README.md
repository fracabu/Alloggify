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

**Alloggify** is an intelligent web application that automates data extraction from identity documents (Italian ID cards, passports, driving licenses) using Google's Gemini AI. It seamlessly integrates with the **Alloggiati Web** portal (Italian police hospitality reporting system) through a Chrome extension, dramatically reducing manual data entry time.

### 🎯 Perfect For:
- 🏨 Hotels and B&Bs
- 🏡 Vacation rentals
- 🏢 Accommodation facilities in Italy
- 👥 Property managers handling guest check-ins

---

## ✨ Features

### 🔍 Smart Document Recognition
- **Multi-format support**: Italian ID cards (standard & electronic), passports, driving licenses
- **AI-powered OCR**: Powered by Gemini 2.5 Flash for accurate data extraction
- **Intelligent classification**: Automatically identifies document type with hierarchical logic

### 📝 Automated Form Filling
- **One-click export**: Save extracted data for Chrome extension
- **Auto-fill integration**: Instantly populate Alloggiati Web portal forms
- **Smart field mapping**: Automatic date format conversion and field matching

### 🔒 Privacy & Security
- **100% local processing**: Your data never leaves your computer
- **No cloud storage**: All data stored in browser localStorage
- **Secure API handling**: API keys stored locally, never committed to git

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with React 19
- **Real-time feedback**: Loading states, success messages, error handling
- **Flexible API setup**: Configure Gemini API key via UI or environment variable

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
   ```bash
   npm install
   ```

3. **Configure API Key**

   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

   *Alternatively, you can set the API key through the UI after starting the app.*

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

---

## 💻 Usage

### Web Application

1. **Upload Document**
   - Click "Carica Documento" button
   - Select an image of an ID document (JPG, PNG, etc.)
   - Wait for AI processing (2-5 seconds)

2. **Review Extracted Data**
   - Verify the auto-populated form fields
   - Make corrections if needed
   - All fields are editable

3. **Export for Extension**
   - Click "Esporta per Estensione" button
   - Data is saved to localStorage
   - Confirmation message appears

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

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Dependencies
npm install          # Install all dependencies
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
