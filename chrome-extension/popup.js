// Popup script - Interfaccia utente dell'estensione
console.log('🎨 Popup script inizializzato');

let currentGuestData = null;

// Elementi DOM
const statusEl = document.getElementById('status');
const dataPreviewEl = document.getElementById('dataPreview');
const fillFormBtn = document.getElementById('fillFormBtn');
const loadDataBtn = document.getElementById('loadDataBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

// Inizializzazione al caricamento
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Popup aperto');
  await loadGuestData();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  fillFormBtn.addEventListener('click', handleFillForm);
  loadDataBtn.addEventListener('click', handleLoadFromScanDocId);
  clearDataBtn.addEventListener('click', handleClearData);
}

// Carica i dati salvati
async function loadGuestData() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getGuestData' });

    if (response.success && response.data) {
      currentGuestData = response.data;
      displayGuestData(response.data);
      return;
    }

    // Fallback: prova a leggere da localStorage dell'app Alloggify
    // Questo funziona solo se l'app è stata aperta di recente
    const localData = localStorage.getItem('alloggifyData');
    const localTimestamp = localStorage.getItem('alloggifyDataTimestamp');

    if (localData) {
      const data = JSON.parse(localData);
      const timestamp = parseInt(localTimestamp || '0');
      const age = Date.now() - timestamp;

      // Usa i dati solo se sono recenti (meno di 1 ora)
      if (age < 60 * 60 * 1000) {
        // Salva nello storage dell'estensione
        await chrome.runtime.sendMessage({ action: 'saveGuestData', data: data });
        currentGuestData = data;
        displayGuestData(data);
        return;
      }
    }

    displayNoData();

  } catch (error) {
    console.error('❌ Errore nel caricamento dati:', error);
    displayNoData();
  }
}

// Mostra i dati dell'ospite
function displayGuestData(data) {
  statusEl.className = 'status has-data';
  statusEl.innerHTML = '<strong>✅ Dati pronti per la compilazione</strong>Controlla i dati sotto e clicca "Compila Form".';

  let html = '';
  const fieldLabels = {
    tipo: '📋 Tipo Alloggiato',
    cognome: '👤 Cognome',
    nome: '👤 Nome',
    sesso: '⚧️ Sesso',
    dataNascita: '📅 Data di Nascita',
    luogoNascita: '🏛️ Luogo di Nascita',
    cittadinanza: '🌍 Cittadinanza',
    tipoDocumento: '📄 Tipo Documento',
    numeroDocumento: '🔢 Numero Documento',
    luogoRilascioDocumento: '🏛️ Luogo Rilascio',
    dataArrivo: '📅 Data Arrivo',
    permanenza: '🌙 Permanenza (giorni)'
  };

  for (const [key, label] of Object.entries(fieldLabels)) {
    if (data[key]) {
      html += `<div><span>${label}:</span> ${data[key]}</div>`;
    }
  }

  dataPreviewEl.innerHTML = html;
  dataPreviewEl.style.display = 'block';
  fillFormBtn.disabled = false;
  clearDataBtn.style.display = 'block';
}

// Mostra messaggio "nessun dato"
function displayNoData() {
  statusEl.className = 'status no-data';
  statusEl.innerHTML = '<strong>⚠️ Nessun dato disponibile</strong>Carica un documento in Alloggify per iniziare.';
  dataPreviewEl.style.display = 'none';
  fillFormBtn.disabled = true;
  clearDataBtn.style.display = 'none';
  currentGuestData = null;
}

// Handler: Compila il form
async function handleFillForm() {
  console.log('🔄 Richiesta compilazione form...');

  fillFormBtn.innerHTML = '<div class="spinner"></div><span>Compilazione...</span>';
  fillFormBtn.disabled = true;

  try {
    // Ottieni il tab corrente
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('alloggiatiweb.poliziadistato.it')) {
      alert('⚠️ Apri prima la pagina di Alloggiati Web!\n\nVai su: https://alloggiatiweb.poliziadistato.it');
      return;
    }

    // Invia messaggio al content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });

    if (response.success) {
      fillFormBtn.innerHTML = '<span>✅</span><span>Compilato!</span>';
      setTimeout(() => {
        fillFormBtn.innerHTML = '<span>✨</span><span>Compila Form</span>';
        fillFormBtn.disabled = false;
      }, 2000);
    }

  } catch (error) {
    console.error('❌ Errore:', error);
    alert('❌ Errore durante la compilazione.\n\nAssicurati di essere sulla pagina corretta di Alloggiati Web.');
    fillFormBtn.innerHTML = '<span>✨</span><span>Compila Form</span>';
    fillFormBtn.disabled = false;
  }
}

// Handler: Ricarica dati da Alloggify
async function handleLoadFromScanDocId() {
  console.log('🔄 Tentativo di ricaricamento da Alloggify localStorage...');

  loadDataBtn.innerHTML = '<div class="spinner"></div><span>Caricamento...</span>';
  loadDataBtn.disabled = true;

  try {
    // Rilegge i dati da localStorage
    await loadGuestData();

    if (currentGuestData) {
      alert('✅ Dati ricaricati con successo!');
      return;
    }

    // Se non ci sono dati, prova a fare una chiamata API (opzionale)
    const response = await fetch('http://localhost:3000/api/guest-data', {
      method: 'GET',
      mode: 'cors'
    });

    if (response.ok) {
      const data = await response.json();

      // Salva i dati
      await chrome.runtime.sendMessage({
        action: 'saveGuestData',
        data: data
      });

      currentGuestData = data;
      displayGuestData(data);

      alert('✅ Dati caricati con successo da Alloggify!');
    } else {
      throw new Error('API non disponibile');
    }

  } catch (error) {
    console.error('❌ Errore caricamento:', error);

    // Fallback: chiedi all'utente di copiare i dati manualmente
    alert(
      '⚠️ Impossibile caricare automaticamente i dati.\n\n' +
      'SOLUZIONE:\n' +
      '1. In Alloggify (localhost:3000), carica un documento\n' +
      '2. Clicca "Esporta per Estensione"\n' +
      '3. I dati verranno salvati automaticamente\n' +
      '4. Riapri questo popup'
    );
  } finally {
    loadDataBtn.innerHTML = '<span>🔄</span><span>Ricarica Dati da Alloggify</span>';
    loadDataBtn.disabled = false;
  }
}

// Handler: Cancella i dati
async function handleClearData() {
  if (!confirm('Sei sicuro di voler cancellare i dati dell\'ospite corrente?')) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({ action: 'clearGuestData' });
    displayNoData();
    console.log('✅ Dati cancellati');
  } catch (error) {
    console.error('❌ Errore cancellazione:', error);
  }
}
