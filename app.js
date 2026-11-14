const URL_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
const URL_METEO = 'https://api.open-meteo.com/v1/forecast';

const inputCitta = document.getElementById('inputCitta');
const btnCerca = document.getElementById('btnCerca');
const loading = document.getElementById('loading');
const boxErrore = document.getElementById('errore');
const schedaMeteo = document.getElementById('schedaMeteo');

// Funzione riutilizzabile come da dispensa (Sez. 3.5)
function richiediJSON(url, onSuccesso, onErrore) {
  loading.classList.remove('nascosto');
  boxErrore.classList.add('nascosto');

  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    loading.classList.add('nascosto');
    if (xhr.status === 200) {
      const dati = JSON.parse(xhr.responseText);
      onSuccesso(dati);
    } else {
      onErrore('Errore HTTP: ' + xhr.status);
    }
  };

  xhr.onerror = function () {
    loading.classList.add('nascosto');
    onErrore('Errore di rete: impossibile contattare il server');
  };

  xhr.ontimeout = function () {
    loading.classList.add('nascosto');
    onErrore('Timeout della richiesta');
  };

  xhr.timeout = 5000;
  xhr.open('GET', url, true);
  xhr.send();
}

function interpretaCodiceMeteo(codice) {
  if (codice === 0) return 'Cielo sereno';
  if (codice >= 1 && codice <= 3) return 'Parzialmente nuvoloso';
  if (codice === 45 || codice === 48) return 'Nebbia';
  if (codice >= 51 && codice <= 67) return 'Pioggia';
  if (codice >= 71 && codice <= 77) return 'Neve';
  if (codice >= 80 && codice <= 82) return 'Rovesci';
  if (codice >= 95) return 'Temporale';
  return 'Variabile';
}

function cercaMeteo(citta) {
  // 1. Prima chiamata GET con query string per ottenere le coordinate della città
  const urlGeo = URL_GEOCODING + '?name=' + encodeURIComponent(citta) + '&count=1&language=it';

  richiediJSON(
    urlGeo,
    function (rispostaGeo) {
      if (!rispostaGeo.results || rispostaGeo.results.length === 0) {
        schedaMeteo.classList.add('nascosto');
        mostraErrore('Città non trovata.');
        return;
      }

      const luogo = rispostaGeo.results[0];
      const urlForecast = URL_METEO + '?latitude=' + luogo.latitude + '&longitude=' + luogo.longitude + '&current_weather=true';

      // 2. Seconda chiamata GET con latitudine e longitudine per i dati meteo reali
      richiediJSON(
        urlForecast,
        function (rispostaMeteo) {
          aggiornaDOM(luogo, rispostaMeteo.current_weather);
        },
        function (err) {
          schedaMeteo.classList.add('nascosto');
          mostraErrore(err);
        }
      );
    },
    function (err) {
      schedaMeteo.classList.add('nascosto');
      mostraErrore(err);
    }
  );
}

function aggiornaDOM(luogo, meteo) {
  document.getElementById('nomeCitta').textContent = luogo.name;
  document.getElementById('paese').textContent = luogo.country || '';
  document.getElementById('temp').textContent = meteo.temperature;
  document.getElementById('condizioni').textContent = interpretaCodiceMeteo(meteo.weathercode);
  document.getElementById('vento').textContent = meteo.windspeed;
  document.getElementById('coordinate').textContent = luogo.latitude + ', ' + luogo.longitude;
  document.getElementById('orario').textContent = meteo.time.replace('T', ' ');

  schedaMeteo.classList.remove('nascosto');
}

function mostraErrore(messaggio) {
  boxErrore.textContent = messaggio;
  boxErrore.classList.remove('nascosto');
}

btnCerca.addEventListener('click', function () {
  const citta = inputCitta.value.trim();
  if (citta !== '') {
    cercaMeteo(citta);
  }
});

inputCitta.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    const citta = inputCitta.value.trim();
    if (citta !== '') {
      cercaMeteo(citta);
    }
  }
});

// Caricamento iniziale
cercaMeteo('Milano');
