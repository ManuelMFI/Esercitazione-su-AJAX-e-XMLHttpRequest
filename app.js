function cercaMeteo(citta) {
  // Chiedo fino a 10 risultati nella query string per evitare omonimi esteri
  const urlGeo = URL_GEOCODING + '?name=' + encodeURIComponent(citta) + '&count=10&language=it';

  richiediJSON(
    urlGeo,
    function (rispostaGeo) {
      if (!rispostaGeo.results || rispostaGeo.results.length === 0) {
        schedaMeteo.classList.add('nascosto');
        mostraErrore('Città non trovata.');
        return;
      }

      // Prendo il primo risultato di default, ma se ce n'è uno in Italia ('IT') scelgo quello
      let luogo = rispostaGeo.results[0];
      for (let i = 0; i < rispostaGeo.results.length; i++) {
        if (rispostaGeo.results[i].country_code === 'IT') {
          luogo = rispostaGeo.results[i];
          break;
        }
      }

      const urlForecast = URL_METEO + '?latitude=' + luogo.latitude + '&longitude=' + luogo.longitude + '&current_weather=true';

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
