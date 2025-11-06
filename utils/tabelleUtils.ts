/**
 * Utilities for Alloggiati reference tables (comuni, documents, etc.)
 */

interface LuogoRow {
    codice: string;
    descrizione: string;
    provincia: string;
    dataFineVal: string;
}

interface TipoDocumentoRow {
    codice: string;
    descrizione: string;
}

interface TipoAlloggiatoRow {
    codice: string;
    descrizione: string;
}

/**
 * Parse CSV tabella Luoghi (comuni) from SOAP response
 * Format: Codice;Descrizione;Provincia;DataFineVal
 */
export function parseTabellaLuoghi(csv: string): LuogoRow[] {
    const lines = csv.trim().split('\n');
    const luoghi: LuogoRow[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(';');
        if (parts.length >= 3) {
            luoghi.push({
                codice: parts[0],
                descrizione: parts[1],
                provincia: parts[2],
                dataFineVal: parts[3] || ''
            });
        }
    }
    
    return luoghi;
}

/**
 * Parse CSV tabella Tipi_Documento from SOAP response
 * Format: Codice;Descrizione
 */
export function parseTabellaDocumenti(csv: string): TipoDocumentoRow[] {
    const lines = csv.trim().split('\n');
    const documenti: TipoDocumentoRow[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(';');
        if (parts.length >= 2) {
            documenti.push({
                codice: parts[0],
                descrizione: parts[1]
            });
        }
    }
    
    return documenti;
}

/**
 * Parse CSV tabella Tipi_Alloggiato from SOAP response
 * Format: Codice;Descrizione
 */
export function parseTabellaAlloggiati(csv: string): TipoAlloggiatoRow[] {
    const lines = csv.trim().split('\n');
    const alloggiati: TipoAlloggiatoRow[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(';');
        if (parts.length >= 2) {
            alloggiati.push({
                codice: parts[0],
                descrizione: parts[1]
            });
        }
    }
    
    return alloggiati;
}

/**
 * Find comune code by name
 * Returns only active comuni (DataFineVal empty)
 */
export function findComuneByName(luoghi: LuogoRow[], name: string): string {
    const normalizedName = name.trim().toUpperCase();
    
    // Find exact match, only active comuni
    const match = luoghi.find(
        l => l.descrizione.toUpperCase() === normalizedName && !l.dataFineVal
    );
    
    if (match) {
        return match.codice;
    }
    
    // Try partial match if exact not found
    const partial = luoghi.find(
        l => l.descrizione.toUpperCase().includes(normalizedName) && !l.dataFineVal
    );
    
    return partial ? partial.codice : '';
}

/**
 * Find comune code by name and province
 * More precise when there are multiple comuni with same name
 */
export function findComuneByNameAndProvince(
    luoghi: LuogoRow[], 
    name: string, 
    provincia: string
): string {
    const normalizedName = name.trim().toUpperCase();
    const normalizedProv = provincia.trim().toUpperCase();
    
    const match = luoghi.find(
        l => l.descrizione.toUpperCase() === normalizedName &&
             l.provincia.toUpperCase() === normalizedProv &&
             !l.dataFineVal
    );
    
    return match ? match.codice : '';
}

/**
 * Find document type code by description
 */
export function findDocumentoByName(documenti: TipoDocumentoRow[], name: string): string {
    const normalized = name.trim().toUpperCase();
    
    // Try exact match
    let match = documenti.find(d => d.descrizione.toUpperCase() === normalized);
    if (match) return match.codice;
    
    // Try partial match
    match = documenti.find(d => d.descrizione.toUpperCase().includes(normalized));
    return match ? match.codice : '';
}

/**
 * Normalize common document type names to SOAP codes
 */
export function normalizeDocumentType(type: string): string {
    const normalized = type.trim().toUpperCase();
    
    // Common mappings
    const mappings: { [key: string]: string } = {
        'CARTA DI IDENTITA': 'IDENT',
        'CARTA IDENTITA': 'IDENT',
        'CI': 'IDENT',
        'PASSAPORTO': 'PASOR',
        'PATENTE': 'PATEN',
        'PATENTE DI GUIDA': 'PATEN'
    };
    
    return mappings[normalized] || '';
}
