const API_URL = 'https://jsonplaceholder.typicode.com/users';

const btnSearch = document.getElementById('btnSearch');
const btnReset = document.getElementById('btnReset');
const searchInput = document.getElementById('searchInput');
const userGrid = document.getElementById('userGrid');
const spinner = document.getElementById('spinner');
const statusMessage = document.getElementById('statusMessage');

let listaUtenti = [];

function inviaRichiestaXHR(url, callbackSuccesso, callbackErrore) {
  mostraLoading(true);
  nascondiMessaggio();

  // 1. Creazione oggetto XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // 2. Definizione callback asincrona con onload
  xhr.onload = function () {
    mostraLoading(false);

    // Controllo combinato di readyState (incluso in onload) e status HTTP
    if (xhr.status === 200) {
      try {
        // Parsing di responseText (JSON string -> Oggetto JS)
        const dati = JSON.parse(xhr.responseText);
        callbackSuccesso(dati);
      } catch (e) {
        callbackErrore('Errore nel parsing della risposta JSON dal server.');
      }
    } else {
      callbackErrore('Errore HTTP ' + xhr.status + ': ' + xhr.statusText);
    }
  };

  // Gestione errore di rete
  xhr.onerror = function () {
    mostraLoading(false);
    callbackErrore('Errore di rete: impossibile raggiungere il server.');
  };

  // Gestione timeout
  xhr.ontimeout = function () {
    mostraLoading(false);
    callbackErrore('Richiesta annullata: timeout scaduto.');
  };

  xhr.timeout = 6000;

  // 3. Apertura della connessione (metodo, URL, async)
  xhr.open('GET', url, true);

  // 4. Invio della richiesta HTTP
  xhr.send();
}

function caricaTuttiGliUtenti() {
  inviaRichiestaXHR(
    API_URL,
    function (dati) {
      listaUtenti = dati;
      renderizzaUtenti(listaUtenti);
    },
    function (messaggioErrore) {
      mostraMessaggio(messaggioErrore, 'error');
    }
  );
}

function filtraPerNome() {
  const query = searchInput.value.trim();

  if (!query) {
    renderizzaUtenti(listaUtenti);
    return;
  }

  // Chiamata dinamica con query string per l'endpoint API
  const urlParametrizzata = API_URL + '?name_like=' + encodeURIComponent(query);

  inviaRichiestaXHR(
    urlParametrizzata,
    function (datiFiltrati) {
      renderizzaUtenti(datiFiltrati);
    },
    function (messaggioErrore) {
      mostraMessaggio(messaggioErrore, 'error');
    }
  );
}

function renderizzaUtenti(utenti) {
  userGrid.innerHTML = '';

  if (!utenti || utenti.length === 0) {
    mostraMessaggio('Nessun utente trovato corrispondente ai criteri inseriti.', 'info');
    return;
  }

  nascondiMessaggio();

  utenti.forEach(utente => {
    const li = document.createElement('li');
    li.className = 'user-card';
    li.innerHTML = `
      <h3>${escapeHTML(utente.name)}</h3>
      <p><strong>Username:</strong> @${escapeHTML(utente.username)}</p>
      <p><strong>Email:</strong> ${escapeHTML(utente.email)}</p>
      <p><strong>Città:</strong> ${escapeHTML(utente.address?.city || 'N/D')}</p>
      <p><strong>Società:</strong> ${escapeHTML(utente.company?.name || 'N/D')}</p>
    `;
    userGrid.appendChild(li);
  });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function mostraLoading(attivo) {
  if (attivo) {
    spinner.classList.remove('hidden');
  } else {
    spinner.classList.add('hidden');
  }
}

function mostraMessaggio(testo, tipo) {
  statusMessage.textContent = testo;
  statusMessage.className = 'status-message ' + tipo;
  statusMessage.classList.remove('hidden');
}

function nascondiMessaggio() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message hidden';
}

// Event Listeners
btnSearch.addEventListener('click', filtraPerNome);

btnReset.addEventListener('click', function () {
  searchInput.value = '';
  caricaTuttiGliUtenti();
});

searchInput.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    filtraPerNome();
  }
});

document.addEventListener('DOMContentLoaded', caricaTuttiGliUtenti);