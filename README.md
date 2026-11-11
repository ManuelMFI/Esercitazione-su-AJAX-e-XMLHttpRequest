# Mini Dashboard Utenti (XHR)

Applicazione web dinamica sviluppata con HTML5, CSS3 puro e JavaScript Vanilla per consumare un'API REST pubblica tramite **XMLHttpRequest (XHR)**.

## 🚀 Funzionalità
- Caricamento asincrono della lista utenti via chiamata HTTP `GET`
- Ricerca e filtraggio degli utenti per nome tramite parametro query string (`?name_like=...`)
- Gestione completa del ciclo di vita della richiesta AJAX (`onload`, `onerror`, `ontimeout`)
- UI reattiva con indicatore di caricamento e messaggi di errore visuali
- Protezione di base contro vulnerabilità XSS (HTML escape dei dati ricevuti)

## 🛠️ Tecnologie Utilizzate
- **HTML5**: Struttura semantica
- **CSS3**: Layout responsive con Flexbox e Grid (senza framework esterni)
- **JavaScript ES6**: Gestione AJAX mediante l'API nativa `XMLHttpRequest`
- **JSONPlaceholder API**: Endpoint server simulato per l'invio e la ricezione dati

## ⚙️ Come Eseguire il Progetto in Locale
1. Clonare il repository:
   ```bash
   git clone [https://github.com/TUO-USERNAME/progetto-xhr.git](https://github.com/TUO-USERNAME/progetto-xhr.git)
