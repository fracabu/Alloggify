
export interface DocumentData {
    tipo: string;
    dataArrivo: string;
    permanenza: string;
    cognome: string;
    nome: string;
    sesso: string;
    dataNascita: string;
    luogoNascita: string;
    statoNascita: string;
    cittadinanza: string;
    tipoDocumento: string;
    numeroDocumento: string;
    luogoRilascioDocumento: string;
}

export interface ExtractedInfo {
    lastName: string;
    firstName: string;
    sex: 'Maschio' | 'Femmina' | '';
    dateOfBirth: string; // YYYY-MM-DD
    placeOfBirth: string;
    stateOfBirth: string;
    citizenship: string;
    documentType: string;
    documentNumber: string;
    issuingPlace: string;
}