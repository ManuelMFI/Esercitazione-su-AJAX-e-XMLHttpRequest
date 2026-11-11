// URL base per Geocoding (trasforma il nome città in coordinate) e Meteo Forecast
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const spinner = document.getElementById('spinner');
const statusMessage = document.getElementById('statusMessage');
const weatherCard = document.getElementById('weatherCard');

// Tabella codici WMO Open-Meteo per traduzione delle condizioni atmosferiche
const weatherCodes = {
  0: 'Cielo sereno ☀️',
  1: 'Prevalentemente sereno 🌤️',
  2: 'Parzialmente nuvoloso ⛅',
  3: 'Coperto ☁️',
  45: 'Nebbia 🌫️',
  48: 'Nebbia con brina 🌫️',
  51: 'Pioggerellina leggera 🌧️',
  53: 'Pioggerellina moderata 🌧️',
  55: 'Pioggerellina fitta 🌧️',
  61: 'Pioggia debole 🌧️',
  63: 'Pioggia moderata 🌧️',
  65: 'Pioggia forte 🌧️',
  71: 'Neve debole 🌨️',
  73: 'Neve moderata 🌨️',
  75: 'Neve forte 🌨️',
  80: 'Rovesci di pioggia deboli 🌦️',
  81: 'Rovesci di pioggia moderati 🌦️',
  82: 'Rovesci di pioggia violenti ⛈️',
  95: 'Temporale ⛈️'
};

/**
 * Funzione helper riutilizzabile basata esclusivamente su XMLHttpRequest
 */
function inviaRichiestaXHR(url, callbackSuccesso, callbackErrore) {
  mostraLoading(true);
  nascondiMessaggio();

  // 1. Istanziazione XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // 2. Registrazione callback asincrona onload
  xhr.onload = function () {
    mostraLoading(false);

    // Verifico sia readyState === 4 (gestito nativamente da onload) che status === 200
    if (xhr.status === 200) {
      try {
        // Parsing della stringa JSON (responseText)
        const dati = JSON.parse(xhr.responseText);
        callbackSuccesso(dati);
      } catch (err) {
        callbackErrore('Errore nel parsing della risposta del server.');
      }
    } else {
      callbackErrore('Errore HTTP ' + xhr.status + ': impossibile recuperare i dati.');
    }
  };

  // Gestione errore di rete
  xhr.onerror = function () {
    mostraLoading(false);
    callbackErrore('Errore di rete: verificare la connessione.');
  };

  // Gestione timeout
  xhr.ontimeout = function () {
    mostraLoading(false);
    callbackErrore('Timeout scaduto: la richiesta ha impiegato troppo tempo.');
  };

  xhr.timeout = 7000;

  // 3. Apertura connessione asincrona (GET)
  xhr.open('GET', url, true);

  // 4. Invio della richiesta
  xhr.send();
}

/**
 * Step 1: Cerca le coordinate geografiche della città cercata
 */
function cercaCoordinateCitta(nomeCitta) {
  const urlGeocoding = `${GEOCODING_URL}?name=${encodeURIComponent(nomeCitta)}&count=1&language=it&format=json`;

  inviaRichiestaXHR(
    urlGeocoding,
    function (datiGeocoding) {
      if (!datiGeocoding.results || datiGeocoding.results.length === 0) {
        weatherCard.classList.add('hidden');
        mostraMessaggio(`Nessuna città trovata con il nome "${nomeCitta}".`, 'error');
        return;
      }

      const citta = datiGeocoding.results[0];
      caricaMeteoCitta(citta);
    },
    function (errore) {
      weatherCard.classList.add('hidden');
      mostraMessaggio(errore, 'error');
    }
  );
}

/**
 * Step 2: Con le coordinate, effettua una seconda chiamata XHR per i dati meteo reali
 */
function caricaMeteoCitta(infoCitta) {
  const { latitude, longitude, name, country } = infoCitta;
  const urlMeteo = `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  inviaRichiestaXHR(
    urlMeteo,
    function (datiMeteo) {
      const meteoCorrente = datiMeteo.current_weather;
      mostraDatiMeteo(name, country, latitude, longitude, meteoCorrente);
    },
    function (errore) {
      weatherCard.classList.add('hidden');
      mostraMessaggio(errore, 'error');
    }
  );
}

/**
 * Aggiorna il DOM con i dati meteorologici ottenuti
 */
function mostraDatiMeteo(nome, paese, lat, lon, meteo) {
  document.getElementById('cityName').textContent = nome;
  document.getElementById('countryBadge').textContent = paese || 'N/D';
  document.getElementById('temperature').textContent = Math.round(meteo.temperature);
  
  const descCondizione = weatherCodes[meteo.weathercode] || 'Condizione sconosciuta';
  document.getElementById('weatherCondition').textContent = descCondizione;
  document.getElementById('windSpeed').textContent = meteo.windspeed;
  document.getElementById('coordinates').textContent = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  
  const dataOra = new Date(meteo.time).toLocaleString('it-IT');
  document.getElementById('lastUpdated').textContent = dataOra;

  weatherCard.classList.remove('hidden');
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
  statusMessage.className = `status-message ${tipo}`;
  statusMessage.classList.remove('hidden');
}

function nascondiMessaggio() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message hidden';
}

// Event Listeners
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const citta = cityInput.value.trim();
  if (citta) {
    cercaCoordinateCitta(citta);
  }
});

// Caricamento iniziale di default con una città reale (es. Roma)
document.addEventListener('DOMContentLoaded', function () {
  cercaCoordinateCitta('Roma');
});
