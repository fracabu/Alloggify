// Background service worker per comunicazione tra componenti
console.log('🚀 Alloggiati Web Auto-Fill - Background service worker attivo');

// Listener per messaggi da content script e popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Messaggio ricevuto in background:', request);

  if (request.action === 'saveGuestData') {
    // Salva i dati dell'ospite nello storage
    chrome.storage.local.set({ guestData: request.data }, () => {
      console.log('✅ Dati ospite salvati:', request.data);
      sendResponse({ success: true });
    });
    return true; // Indica risposta asincrona
  }

  if (request.action === 'getGuestData') {
    // Recupera i dati dell'ospite dallo storage
    chrome.storage.local.get(['guestData'], (result) => {
      console.log('📤 Invio dati ospite:', result.guestData);
      sendResponse({ success: true, data: result.guestData });
    });
    return true;
  }

  if (request.action === 'clearGuestData') {
    // Cancella i dati
    chrome.storage.local.remove(['guestData'], () => {
      console.log('🗑️ Dati ospite cancellati');
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'pong' });
    return true;
  }
});

// Listener per installazione/aggiornamento estensione
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎉 Estensione Alloggiati Web Auto-Fill installata!');
  } else if (details.reason === 'update') {
    console.log('🔄 Estensione aggiornata alla versione', chrome.runtime.getManifest().version);
  }
});
