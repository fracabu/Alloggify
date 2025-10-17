# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alloggify is an OCR-powered web application that extracts information from identity documents (Italian ID cards, passports, driving licenses) and prepares data for the Alloggiati Web portal (Italian police hospitality reporting system). The project consists of:

1. **React Web App**: Vite-based React application for document scanning and data extraction
2. **Chrome Extension**: Browser extension to auto-fill the Alloggiati Web portal form

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server (starts on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

**CRITICAL**: Before running the app, set your Gemini API key in `.env.local`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

**API Key Resolution Order** (in `geminiService.ts`):
1. First checks `localStorage.getItem('geminiApiKey')` (user can set via UI)
2. Falls back to `process.env.API_KEY` (from `.env.local`, injected at build time via Vite config)

The app includes an `ApiKeyGuide` component that allows users to set their API key through the UI, which stores it in localStorage.

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
   - User exports to localStorage → picked up by Chrome extension

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
- **Custom Events**: `alloggifyDataExported` event is dispatched on window when data is exported (for extension bridge)
