import { DocumentData } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface AlloggiatiCredentials {
    utente: string;
    password: string;
    wskey: string;
}

interface TokenResponse {
    token: string;
    scadenza: string;
}

/**
 * Alloggiati Web API Service - Using Vercel Serverless Functions
 * Handles authentication and data submission to the Italian police hospitality portal
 */
interface TabellaLuoghi {
    codice: string;
    descrizione: string;
    provincia?: string;
}

interface TabellaDocumento {
    codice: string;
    descrizione: string;
}

export class AlloggiatiApiService {
    private token: string | null = null;
    private tokenExpiry: Date | null = null;
    private tabellaLuoghi: Map<string, TabellaLuoghi> | null = null;
    private tabellaDocumenti: Map<string, TabellaDocumento> | null = null;

    constructor() {
        // Load token from localStorage on initialization
        this.loadFromLocalStorage();
        this.loadTabelleLuoghi();
        this.loadTabellaDocumenti();
    }

    /**
     * Load token and credentials from localStorage
     */
    private loadFromLocalStorage() {
        try {
            const storedToken = localStorage.getItem('alloggiatiToken');
            const storedExpiry = localStorage.getItem('alloggiatiTokenExpiry');

            if (storedToken && storedExpiry) {
                this.token = storedToken;
                this.tokenExpiry = new Date(storedExpiry);

                // Check if token is still valid
                if (this.isTokenValid()) {
                    console.log('✅ Token caricato da localStorage, valido fino a:', this.tokenExpiry);
                } else {
                    console.log('⚠️ Token in localStorage è scaduto');
                    this.clearToken();
                }
            }
        } catch (error) {
            console.error('Errore caricamento token da localStorage:', error);
        }
    }

    /**
     * Save token to localStorage
     */
    private saveToLocalStorage() {
        try {
            if (this.token && this.tokenExpiry) {
                localStorage.setItem('alloggiatiToken', this.token);
                localStorage.setItem('alloggiatiTokenExpiry', this.tokenExpiry.toISOString());
            }
        } catch (error) {
            console.error('Errore salvataggio token in localStorage:', error);
        }
    }

    /**
     * Generate authentication token using credentials
     */
    async generateToken(credentials: AlloggiatiCredentials): Promise<TokenResponse> {
        try {
            const response = await fetch(API_ENDPOINTS.auth, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.token || !data.scadenza) {
                throw new Error('Invalid response from authentication API');
            }

            // Store token and expiry
            this.token = data.token;
            this.tokenExpiry = new Date(data.scadenza);

            // Save token to localStorage for persistence (only token, not credentials)
            this.saveToLocalStorage();

            console.log('✅ Token generato con successo, scadenza:', this.tokenExpiry);

            return { token: data.token, scadenza: data.scadenza };
        } catch (error) {
            console.error('❌ Errore generazione token:', error);
            throw new Error(
                error instanceof Error
                    ? `Errore autenticazione: ${error.message}`
                    : 'Errore sconosciuto durante autenticazione'
            );
        }
    }

    /**
     * Test token validity (simplified - just check expiry)
     */
    async testAuthentication(): Promise<boolean> {
        return this.isTokenValid();
    }

    /**
     * Test schedina before sending (preliminary check)
     */
    async testSchedina(data: DocumentData): Promise<{ success: boolean; message: string }> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const utente = localStorage.getItem('alloggiatiUtente');
        if (!utente) {
            throw new Error('Username non trovato. Effettua il login.');
        }

        const csvSchedina = this.buildSchedinaCSV(data);

        try {
            const response = await fetch(API_ENDPOINTS.test, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    utente,
                    token: this.token,
                    schedine: [csvSchedina] // Array of strings!
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, message: result.message || 'Errore durante il test' };
            }

            return result;
        } catch (error) {
            console.error('❌ Errore test schedina:', error);
            throw new Error(
                error instanceof Error
                    ? `Errore test: ${error.message}`
                    : 'Errore sconosciuto durante il test'
            );
        }
    }

    /**
     * Download ricevuta PDF for a specific date
     * Date must be within last 30 days (excluding today)
     */
    async downloadRicevuta(date: string): Promise<{ success: boolean; message: string; pdf?: string }> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const utente = localStorage.getItem('alloggiatiUtente');
        if (!utente) {
            throw new Error('Username non trovato. Effettua il login.');
        }

        try {
            // Format date as ISO DateTime (YYYY-MM-DDTHH:MM:SS)
            const formattedDate = `${date}T00:00:00`;

            const response = await fetch(API_ENDPOINTS.ricevuta, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    utente,
                    token: this.token,
                    data: formattedDate
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, message: result.message || 'Errore download ricevuta' };
            }

            console.log('📥 Ricevuta scaricata con successo');

            return {
                success: result.success,
                message: result.message,
                pdf: result.pdf
            };
        } catch (error) {
            console.error('❌ Errore download ricevuta:', error);
            throw new Error(
                error instanceof Error
                    ? `Errore download: ${error.message}`
                    : 'Errore sconosciuto durante download'
            );
        }
    }

    /**
     * Send schedina to Alloggiati Web
     */
    async sendSchedina(data: DocumentData): Promise<{ success: boolean; message: string; ricevuta?: string }> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const utente = localStorage.getItem('alloggiatiUtente');
        if (!utente) {
            throw new Error('Username non trovato. Effettua il login.');
        }

        const csvSchedina = this.buildSchedinaCSV(data);

        try {
            const response = await fetch(API_ENDPOINTS.send, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    utente,
                    token: this.token,
                    schedine: [csvSchedina] // Array of strings!
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, message: result.message || 'Errore durante invio' };
            }

            console.log('📤 Risposta invio schedina:', result);

            return {
                success: result.success,
                message: result.message,
                ricevuta: result.ricevuta
            };
        } catch (error) {
            console.error('❌ Errore invio schedina:', error);
            throw new Error(
                error instanceof Error
                    ? `Errore invio: ${error.message}`
                    : 'Errore sconosciuto durante invio'
            );
        }
    }

    /**
     * Build CSV schedina in fixed-width format (TRACCIATO RECORD - 168 chars)
     * According to MANUALEWS.pdf - TABELLA 1
     */
    private buildSchedinaCSV(data: DocumentData): string {
        // Convert internal date format (YYYY-MM-DD) to DD/MM/YYYY  
        const formatDate = (dateStr: string) => {
            if (!dateStr || !dateStr.includes('-')) return dateStr;
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        };

        // Convert sex to numeric code: 1=M, 2=F
        const formatSex = (sex: string): string => {
            if (sex === 'Maschio' || sex === 'M') return '1';
            if (sex === 'Femmina' || sex === 'F') return '2';
            return '1';
        };

        // Convert tipo_alloggiato to numeric code
        const formatTipoAlloggiato = (tipo: string): string => {
            const mapping: { [key: string]: string } = {
                'Ospite Singolo': '16',
                'Capo Famiglia': '17',
                'Capo Gruppo': '18',
                'Familiare': '19',
                'Membro Gruppo': '20'
            };
            return mapping[tipo] || '16';
        };

        // Pad or truncate string to exact length
        const pad = (str: string, length: number): string => {
            return (str || '').substring(0, length).padEnd(length, ' ');
        };

        // Extract provincia sigla from comune name
        const getProvincia = (luogo: string): string => {
            const match = luogo.match(/\(([A-Z]{2})\)$/);
            return match ? match[1] : '';
        };

        // Build fixed-width CSV record (168 characters)
        let record = '';
        
        // Tipo Alloggiato (0-1): 2 chars
        record += pad(formatTipoAlloggiato(data.tipo), 2);
        
        // Data Arrivo (2-11): 10 chars - DD/MM/YYYY
        record += pad(formatDate(data.dataArrivo), 10);
        
        // Permanenza (12-13): 2 chars (pad left with 0 for numbers)
        record += data.permanenza.toString().padStart(2, '0');
        
        // Cognome (14-63): 50 chars
        record += pad(data.cognome.toUpperCase(), 50);
        
        // Nome (64-93): 30 chars
        record += pad(data.nome.toUpperCase(), 30);
        
        // Sesso (94): 1 char - 1=M, 2=F
        record += formatSex(data.sesso);
        
        // Data Nascita (95-104): 10 chars - DD/MM/YYYY
        record += pad(formatDate(data.dataNascita), 10);
        
        // Comune Nascita (105-113): 9 chars - Codice Comune
        const comuneCode = this.getComuneCode(data.luogoNascita);
        record += pad(comuneCode, 9);
        
        // Provincia Nascita (114-115): 2 chars - Sigla Provincia (only if Stato Nascita = ITALIA)
        const provinciaNascita = data.statoNascita === 'ITALIA' ? getProvincia(data.luogoNascita) : '';
        record += pad(provinciaNascita, 2);
        
        // Stato Nascita (116-124): 9 chars - Codice Stato (CRITICAL: use statoNascita field!)
        const codiceStatoNascita = this.getStatoCode(data.statoNascita);
        record += pad(codiceStatoNascita, 9);
        
        // Cittadinanza (125-133): 9 chars - Codice Stato
        const codiceCittadinanza = this.getStatoCode(data.cittadinanza);
        record += pad(codiceCittadinanza, 9);
        
        // Tipo Documento (134-138): 5 chars - Codice Tabella Documenti
        record += pad(this.getDocumentoCode(data.tipoDocumento), 5);
        
        // Numero Documento (139-158): 20 chars
        record += pad(data.numeroDocumento.toUpperCase(), 20);
        
        // Luogo Rilascio (159-167): 9 chars - Codice Comune o Codice Stato
        // Try as comune first (for Italian cities), fallback to stato (for countries)
        console.log('[CSV] Luogo Rilascio input:', data.luogoRilascioDocumento);
        let codiceLuogoRilascio = this.getComuneCode(data.luogoRilascioDocumento);
        console.log('[CSV] Codice Comune trovato:', codiceLuogoRilascio);
        
        if (!codiceLuogoRilascio) {
            // Not a comune, try as stato (country)
            codiceLuogoRilascio = this.getStatoCode(data.luogoRilascioDocumento);
            console.log('[CSV] Codice Stato trovato:', codiceLuogoRilascio);
        }
        
        if (!codiceLuogoRilascio) {
            console.error('❌ ERRORE: Luogo Rilascio non trovato! Verifica che la Tabella Luoghi sia scaricata.');
            codiceLuogoRilascio = '100000100'; // Fallback ITALIA
        }
        
        record += pad(codiceLuogoRilascio, 9);

        // Security: Removed console.log with personal data (CSV record contains sensitive information)
        console.log('[CSV] Generated record length:', record.length, 'chars');

        return record; // Total: 168 characters
    }

    /**
     * Check if current token is still valid
     */
    private isTokenValid(): boolean {
        if (!this.token || !this.tokenExpiry) {
            return false;
        }
        return new Date() < this.tokenExpiry;
    }

    /**
     * Get current token (if valid)
     */
    getToken(): string | null {
        return this.isTokenValid() ? this.token : null;
    }

    /**
     * Get token expiry date
     */
    getTokenExpiry(): Date | null {
        return this.tokenExpiry;
    }

    /**
     * Clear stored token from memory and localStorage
     */
    clearToken(): void {
        this.token = null;
        this.tokenExpiry = null;

        // Clear from localStorage
        localStorage.removeItem('alloggiatiToken');
        localStorage.removeItem('alloggiatiTokenExpiry');

        console.log('🗑️ Token rimosso da memoria e localStorage');
    }

    /**
     * Load Tabella Luoghi from localStorage
     */
    private loadTabelleLuoghi(): void {
        try {
            const stored = localStorage.getItem('tabellaLuoghi');
            if (stored) {
                const data = JSON.parse(stored);
                this.tabellaLuoghi = new Map(Object.entries(data));
                
                // Count comuni and stati separately
                let comuni = 0;
                let stati = 0;
                this.tabellaLuoghi.forEach((value) => {
                    if (value.provincia === 'ES') {
                        stati++;
                    } else {
                        comuni++;
                    }
                });
                
                console.log(`✅ Tabella Luoghi caricata: ${comuni} comuni + ${stati} stati (${this.tabellaLuoghi.size} totale)`);
            }
        } catch (error) {
            console.error('Errore caricamento Tabella Luoghi:', error);
        }
    }

    /**
     * Load Tabella Documenti from localStorage
     */
    private loadTabellaDocumenti(): void {
        try {
            const stored = localStorage.getItem('tabellaDocumenti');
            if (stored) {
                const data = JSON.parse(stored);
                this.tabellaDocumenti = new Map(Object.entries(data));
                console.log('✅ Tabella Documenti caricata da localStorage:', this.tabellaDocumenti.size, 'voci');
            }
        } catch (error) {
            console.error('Errore caricamento Tabella Documenti:', error);
        }
    }

    /**
     * Download and cache Tabella Luoghi (comuni italiani)
     */
    async downloadTabelleLuoghi(): Promise<void> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const utente = localStorage.getItem('alloggiatiUtente');
        if (!utente) {
            throw new Error('Username non trovato. Effettua il login.');
        }

        try {
            const response = await fetch(API_ENDPOINTS.tabelle, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    utente,
                    token: this.token,
                    tipo: 0 // TipoTabella.Luoghi
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error('Errore download tabella luoghi');
            }

            // Parse CSV data (format: Codice;Descrizione;Provincia;DataFineVal)
            const lines = result.data.split('\n');
            const map: { [key: string]: TabellaLuoghi } = {};

            // Skip header line
            lines.slice(1).forEach((line: string) => {
                const parts = line.split(';');
                if (parts.length >= 3) {
                    const codice = parts[0].trim();
                    const descrizione = parts[1].trim().toUpperCase();
                    const provincia = parts[2].trim();
                    const dataFineVal = parts.length > 3 ? parts[3].trim() : '';

                    // Only include active comuni (no DataFineVal)
                    if (!dataFineVal) {
                        map[descrizione] = { codice, descrizione, provincia };
                    }
                }
            });

            // Save to localStorage
            localStorage.setItem('tabellaLuoghi', JSON.stringify(map));
            this.tabellaLuoghi = new Map(Object.entries(map));

            console.log('✅ Tabella Luoghi scaricata:', this.tabellaLuoghi.size, 'comuni');
        } catch (error) {
            console.error('❌ Errore download Tabella Luoghi:', error);
            throw error;
        }
    }

    /**
     * Download and cache Tabella Documenti (tipi documento)
     */
    async downloadTabellaDocumenti(): Promise<void> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const utente = localStorage.getItem('alloggiatiUtente');
        if (!utente) {
            throw new Error('Username non trovato. Effettua il login.');
        }

        try {
            const response = await fetch(API_ENDPOINTS.tabelle, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    utente,
                    token: this.token,
                    tipo: 1 // TipoTabella.Tipi_Documento
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error('Errore download tabella documenti');
            }

            // Parse CSV data (format: Codice;Descrizione)
            const lines = result.data.split('\n');
            const map: { [key: string]: TabellaDocumento } = {};

            // Skip header line
            lines.slice(1).forEach((line: string) => {
                const parts = line.split(';');
                if (parts.length >= 2) {
                    const codice = parts[0].trim();
                    const descrizione = parts[1].trim().toUpperCase();

                    map[descrizione] = { codice, descrizione };
                }
            });

            // Save to localStorage
            localStorage.setItem('tabellaDocumenti', JSON.stringify(map));
            this.tabellaDocumenti = new Map(Object.entries(map));

            console.log('✅ Tabella Documenti scaricata:', this.tabellaDocumenti.size, 'tipi');
        } catch (error) {
            console.error('❌ Errore download Tabella Documenti:', error);
            throw error;
        }
    }

    /**
     * Get comune code from name
     * Handles format: "ROMA (RM)" or "ROMA"
     */
    getComuneCode(comuneName: string): string {
        if (!this.tabellaLuoghi) {
            console.warn('⚠️ Tabella Luoghi non disponibile');
            return '';
        }

        // Extract comune name without province code
        // "ROMA (RM)" → "ROMA"
        let cleanName = comuneName.trim().toUpperCase();
        const provinceMatch = cleanName.match(/^(.+?)\s*\([A-Z]{2}\)$/);
        if (provinceMatch) {
            cleanName = provinceMatch[1].trim();
        }

        const comune = this.tabellaLuoghi.get(cleanName);
        if (!comune) {
            console.warn(`⚠️ Comune non trovato in tabella: "${cleanName}"`);
            return '';
        }
        
        return comune.codice;
    }

    /**
     * Get document type code from description
     * Handles variations like "CARTA DI IDENTITA'" or "Carta Identità"
     */
    getDocumentoCode(docName: string): string {
        if (!this.tabellaDocumenti) {
            console.warn('⚠️ Tabella Documenti non disponibile');
            return 'IDENT'; // Default fallback
        }

        // Normalize input
        let cleanName = docName.trim().toUpperCase();
        
        // Try exact match first
        let documento = this.tabellaDocumenti.get(cleanName);
        if (documento) {
            return documento.codice;
        }

        // Try common variations
        const mappings: { [key: string]: string } = {
            'CARTA DI IDENTITA': 'CARTA DI IDENTITA\'',
            'CARTA IDENTITA': 'CARTA DI IDENTITA\'',
            'CARTA IDENTITA ELETTRONICA': 'CARTA IDENTITA\' ELETTRONICA',
            'CI': 'CARTA DI IDENTITA\'',
            'CIE': 'CARTA IDENTITA\' ELETTRONICA',
            'PASSAPORTO': 'PASSAPORTO ORDINARIO',
            'PATENTE': 'PATENTE DI GUIDA'
        };

        const normalized = mappings[cleanName];
        if (normalized) {
            documento = this.tabellaDocumenti.get(normalized);
            if (documento) {
                return documento.codice;
            }
        }

        console.warn(`⚠️ Tipo documento non trovato: "${cleanName}"`);
        return 'IDENT'; // Default to CARTA DI IDENTITA'
    }

    /**
     * Get stato (country) code from name
     * Uses Tabella Luoghi which includes Stati (countries)
     * ITALIA = 100000100
     * States in the table have Provincia = 'ES' (Estero)
     */
    getStatoCode(statoName: string): string {
        const cleanName = statoName.trim().toUpperCase();

        // ITALIA is a special case with fixed code
        if (cleanName === 'ITALIA' || cleanName === 'ITALY') {
            return '100000100';
        }

        // Try to find in Tabella Luoghi (if loaded)
        if (this.tabellaLuoghi) {
            const stato = this.tabellaLuoghi.get(cleanName);
            if (stato) {
                console.log(`✅ Stato trovato: ${cleanName} → ${stato.codice}`);
                return stato.codice;
            }
        } else {
            console.warn('⚠️ Tabella Luoghi non ancora caricata, usa il login per scaricarla');
        }

        console.warn(`⚠️ Stato non trovato nella tabella: "${cleanName}". Scarica la Tabella Luoghi dal menu API.`);
        // Return empty string to trigger validation error (better than wrong code)
        return '';
    }

    /**
     * Escape XML special characters
     */
    private escapeXml(unsafe: string): string {
        if (!unsafe) return '';
        return unsafe.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

// Export singleton instance
export const alloggiatiApi = new AlloggiatiApiService();
