import { DocumentData } from '../types';

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
export class AlloggiatiApiService {
    private token: string | null = null;
    private tokenExpiry: Date | null = null;

    /**
     * Generate authentication token using credentials
     */
    async generateToken(credentials: AlloggiatiCredentials): Promise<TokenResponse> {
        try {
            const response = await fetch('/api/alloggiati-auth', {
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

        const xmlSchedina = this.buildSchedinaXml(data);

        try {
            const response = await fetch('/api/alloggiati-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.token,
                    schedina: xmlSchedina
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
     * Send schedina to Alloggiati Web
     */
    async sendSchedina(data: DocumentData): Promise<{ success: boolean; message: string; ricevuta?: string }> {
        if (!this.token || !this.isTokenValid()) {
            throw new Error('Token scaduto o non disponibile. Effettua il login.');
        }

        const xmlSchedina = this.buildSchedinaXml(data);

        try {
            const response = await fetch('/api/alloggiati-send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.token,
                    schedina: xmlSchedina
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
     * Build XML schedina from DocumentData
     */
    private buildSchedinaXml(data: DocumentData): string {
        // Convert internal date format (YYYY-MM-DD) to DD/MM/YYYY
        const formatDate = (dateStr: string) => {
            if (!dateStr || !dateStr.includes('-')) return dateStr;
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        };

        // Convert sex format
        const formatSex = (sex: string) => {
            if (sex === 'Maschio') return 'M';
            if (sex === 'Femmina') return 'F';
            return sex;
        };

        return `<?xml version="1.0" encoding="utf-8"?>
<schedine>
  <schedina>
    <tipo_alloggiato>${this.escapeXml(data.tipo)}</tipo_alloggiato>
    <data_arrivo>${this.escapeXml(formatDate(data.dataArrivo))}</data_arrivo>
    <permanenza>${this.escapeXml(data.permanenza)}</permanenza>
    <cognome>${this.escapeXml(data.cognome)}</cognome>
    <nome>${this.escapeXml(data.nome)}</nome>
    <sesso>${this.escapeXml(formatSex(data.sesso))}</sesso>
    <data_nascita>${this.escapeXml(formatDate(data.dataNascita))}</data_nascita>
    <comune_nascita>${this.escapeXml(data.luogoNascita)}</comune_nascita>
    <cittadinanza>${this.escapeXml(data.cittadinanza)}</cittadinanza>
    <tipo_documento>${this.escapeXml(data.tipoDocumento)}</tipo_documento>
    <numero_documento>${this.escapeXml(data.numeroDocumento)}</numero_documento>
    <luogo_rilascio>${this.escapeXml(data.luogoRilascioDocumento)}</luogo_rilascio>
  </schedina>
</schedine>`;
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
     * Clear stored token
     */
    clearToken(): void {
        this.token = null;
        this.tokenExpiry = null;
    }
}

// Export singleton instance
export const alloggiatiApi = new AlloggiatiApiService();
