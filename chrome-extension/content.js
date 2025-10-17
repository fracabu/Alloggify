// Content script - Interagisce direttamente con la pagina Alloggiati Web
console.log('🎯 Alloggiati Web Auto-Fill - Content script caricato');

// Aggiungi un pulsante floating nella pagina per facilitare l'auto-fill
function addFloatingButton() {
  // Controlla se il pulsante esiste già
  if (document.getElementById('alloggiati-autofill-btn')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'alloggiati-autofill-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
    </svg>
    <span>Compila da Alloggify</span>
  `;
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 15px 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });

  button.addEventListener('click', autoFillForm);

  document.body.appendChild(button);
  console.log('✅ Pulsante floating aggiunto alla pagina');
}

// Funzione principale di auto-fill
async function autoFillForm() {
  console.log('🔄 Inizio auto-fill del form...');

  try {
    // Recupera i dati salvati
    const response = await chrome.runtime.sendMessage({ action: 'getGuestData' });

    if (!response.success || !response.data) {
      showNotification('⚠️ Nessun dato disponibile', 'Carica prima un documento in Alloggify e clicca "Esporta per Estensione"', 'warning');
      return;
    }

    const data = response.data;
    console.log('📋 Dati ricevuti per auto-fill:', data);

    // DEBUG: Stampa tutti i campi disponibili nella pagina
    console.log('🔍 DEBUG - Campi disponibili nella pagina:');
    document.querySelectorAll('input.form-control, select.form-control').forEach(el => {
      console.log('  ID:', el.id, '| Placeholder/Title:', el.placeholder || el.title || '(nessuno)');
    });

    // Mappa i campi usando ID conosciuti e ricerca per placeholder
    let filledCount = 0;

    // Tipo Alloggiato
    if (data.tipo) {
      filledCount += fillByIdOrPlaceholder('Tipo', data.tipo, 'select');
    }

    // Data Arrivo (è un select con valori 1, 2, etc. - cerca per testo della data)
    if (data.dataArrivo) {
      const dateFormatted = formatDateForPortal(data.dataArrivo);
      filledCount += fillSelect('#dataA', dateFormatted);
    }

    // Permanenza
    if (data.permanenza) {
      filledCount += fillField('#NGioPerm', data.permanenza);
    }

    // Cognome
    if (data.cognome) {
      filledCount += fillField('#Cognome', data.cognome);
    }

    // Nome
    if (data.nome) {
      filledCount += fillField('#Nome', data.nome);
    }

    // Sesso
    if (data.sesso) {
      // Converti "Maschio"/"Femmina" in "M"/"F" se necessario
      let sessoValue = data.sesso;
      if (data.sesso.toLowerCase() === 'maschio') {
        sessoValue = 'M';
      } else if (data.sesso.toLowerCase() === 'femmina') {
        sessoValue = 'F';
      }
      filledCount += fillByIdOrPlaceholder('Sesso', sessoValue, 'select');
    }

    // Data di nascita
    if (data.dataNascita) {
      const dateFormatted = formatDateForPortal(data.dataNascita);
      filledCount += fillField('#datan', dateFormatted);
    }

    // Luogo di nascita
    if (data.luogoNascita) {
      filledCount += fillField('#nascluo', data.luogoNascita);
    }

    // Cittadinanza
    if (data.cittadinanza) {
      filledCount += fillField('#citt', data.cittadinanza);
    }

    // Tipo documento
    if (data.tipoDocumento) {
      filledCount += fillField('#docT', data.tipoDocumento);
    }

    // Numero documento
    if (data.numeroDocumento) {
      filledCount += fillField('#docN', data.numeroDocumento);
    }

    // Luogo di rilascio documento
    if (data.luogoRilascioDocumento) {
      filledCount += fillField('#docLR', data.luogoRilascioDocumento);
    }

    console.log(`✅ Auto-fill completato: ${filledCount} campi compilati`);
    showNotification(
      '✅ Compilazione completata!',
      `${filledCount} campi compilati. Verifica i dati prima di salvare.`,
      'success'
    );

  } catch (error) {
    console.error('❌ Errore durante auto-fill:', error);
    showNotification('❌ Errore', 'Impossibile compilare il form: ' + error.message, 'error');
  }
}

// Helper: trova campo per ID o placeholder e compila
function fillByIdOrPlaceholder(placeholder, value, type = 'input') {
  // Prova prima per placeholder/title
  let selector = type === 'select'
    ? `select[placeholder="${placeholder}"], select[title="${placeholder}"]`
    : `input[placeholder="${placeholder}"], input[title="${placeholder}"]`;

  let field = document.querySelector(selector);

  if (field) {
    if (type === 'select') {
      return fillSelect(`#${field.id}`, value);
    } else {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✓ Campo compilato: ${placeholder} (${field.id}) = ${value}`);
      return 1;
    }
  }
  console.log(`⚠ Campo non trovato: ${placeholder}`);
  return 0;
}

// Helper: compila un campo input/textarea
function fillField(selector, value) {
  const field = document.querySelector(selector);
  if (field) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✓ Campo compilato: ${selector} = ${value}`);
    return 1;
  }
  console.log(`⚠ Campo non trovato: ${selector}`);
  return 0;
}

// Helper: compila un campo select
function fillSelect(selector, value) {
  const select = document.querySelector(selector);
  if (!select) return 0;

  // Cerca l'opzione per valore o per testo
  const valueUpper = value.toUpperCase();
  const options = Array.from(select.options);

  const matchingOption = options.find(opt =>
    opt.value.toUpperCase() === valueUpper ||
    opt.text.toUpperCase().includes(valueUpper) ||
    valueUpper.includes(opt.text.toUpperCase())
  );

  if (matchingOption) {
    select.value = matchingOption.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✓ Select compilato: ${selector} = ${matchingOption.text}`);
    return 1;
  }

  return 0;
}

// Helper: formatta data per il portale (richiede DD/MM/YYYY)
function formatDateForPortal(dateStr) {
  // Input può essere: DD/MM/YYYY, YYYY-MM-DD, o altri formati
  if (!dateStr) return '';

  // Se è in formato YYYY-MM-DD, converti in DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Se è già DD/MM/YYYY, restituiscilo così
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  return dateStr;
}

// Helper: mostra notifica nella pagina
function showNotification(title, message, type = 'info') {
  // Rimuovi notifiche precedenti
  const existing = document.getElementById('alloggiati-autofill-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'alloggiati-autofill-notification';

  const colors = {
    success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
    info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
  };

  const color = colors[type] || colors.info;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    background: ${color.bg};
    color: ${color.text};
    border: 2px solid ${color.border};
    border-radius: 12px;
    padding: 20px 25px;
    max-width: 400px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;

  notification.innerHTML = `
    <style>
      @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
    <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${title}</div>
    <div style="font-size: 14px;">${message}</div>
  `;

  document.body.appendChild(notification);

  // Rimuovi dopo 5 secondi
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Listener per messaggi dal popup o background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Content script ricevuto messaggio:', request);

  if (request.action === 'fillForm') {
    autoFillForm();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'checkPage') {
    sendResponse({
      success: true,
      isAlloggiatiPage: window.location.hostname.includes('alloggiatiweb.poliziadistato.it')
    });
    return true;
  }
});

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addFloatingButton);
} else {
  addFloatingButton();
}

console.log('✅ Content script inizializzato e pronto');
