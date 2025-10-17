// Content script che gira su localhost per leggere localStorage e trasferirlo a chrome.storage
console.log('🌉 Alloggify Bridge - Content script caricato');

let extensionContextValid = true;

// Funzione per sincronizzare i dati da localStorage a chrome.storage
function syncDataToExtension() {
  // Non tentare se il contesto è invalidato
  if (!extensionContextValid) {
    return;
  }

  const data = localStorage.getItem('alloggifyData');
  const timestamp = localStorage.getItem('alloggifyDataTimestamp');

  if (data) {
    try {
      const parsedData = JSON.parse(data);
      console.log('📤 Invio dati a chrome.storage:', parsedData);

      // Invia al background script per salvare in chrome.storage
      chrome.runtime.sendMessage({
        action: 'saveGuestData',
        data: parsedData
      }, (response) => {
        if (chrome.runtime.lastError) {
          // Estensione ricaricata o disabilitata
          console.log('⚠️ Estensione non disponibile (probabilmente ricaricata). Ricarica questa pagina per riattivare il bridge.');
          extensionContextValid = false;
          return;
        }

        if (response && response.success) {
          console.log('✅ Dati sincronizzati con successo');

          // Mostra notifica di conferma
          showSyncNotification();
        }
      });
    } catch (e) {
      if (e.message && e.message.includes('Extension context invalidated')) {
        console.log('⚠️ Contesto estensione invalidato. Ricarica questa pagina.');
        extensionContextValid = false;
      } else {
        console.error('❌ Errore parsing dati:', e);
      }
    }
  } else {
    console.log('ℹ️ Nessun dato trovato in localStorage');
  }
}

// Mostra notifica di sincronizzazione
function showSyncNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 10000;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
  `;
  notification.textContent = '✅ Dati sincronizzati con l\'estensione!';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Sincronizza immediatamente al caricamento
syncDataToExtension();

// Ascolta evento custom quando l'utente esporta dall'app
window.addEventListener('alloggifyDataExported', (e) => {
  console.log('📤 Evento export rilevato, sincronizzazione immediata...');
  syncDataToExtension();
});

// Ascolta eventi di storage per sincronizzare solo quando i dati cambiano (da altre tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'alloggifyData') {
    console.log('🔄 localStorage cambiato da altra tab, sincronizzazione...');
    syncDataToExtension();
  }
});

console.log('✅ Alloggify Bridge attivo - sincronizzazione solo quando esporti i dati');
