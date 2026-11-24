# Banco Orologi – come attivarlo

Indirizzo dell'app: **https://relo022.github.io/password-app/orologi/**

La ricerca sui siti e l'elenco "I miei orologi" funzionano già.
Per la valutazione da foto e la stima di mercato servono due cose gratuite: una chiave Gemini e un piccolo server Cloudflare che la tiene nascosta.

## 1. Chiave Gemini (gratis)
1. Vai su https://aistudio.google.com e accedi con un account Google.
2. Menu **Get API key** → **Create API key** → copia la chiave.
3. Non attivare la fatturazione: resta sul piano gratuito.
   Nota: col piano gratuito Google può usare le richieste (anche le foto) per migliorare i suoi modelli.

## 2. Server Cloudflare (gratis)
1. Crea un account su https://dash.cloudflare.com (piano Free).
2. **Workers & Pages** → **Create** → **Create Worker** → nome `banco-orologi` → **Deploy**.
3. **Edit code**: cancella tutto, incolla il contenuto di `server/worker.js`, poi **Deploy**.
4. **Settings → Variables and Secrets** → aggiungi:
   - `GEMINI_API_KEY` = la chiave del punto 1 (tipo **Secret**)
   - `APP_CODE` = una parola a tua scelta, es. `rolex-papa-2026` (tipo **Secret**)
5. Copia l'indirizzo del worker (es. `https://banco-orologi.tuonome.workers.dev`).

## 3. Collegare l'app
Scrivi a Claude l'indirizzo del worker e la parola di `APP_CODE`: verranno inseriti in `config.js`.
In alternativa, sul telefono: **I miei orologi → Impostazioni valutazione** e incolla lì i due valori.

## 4. Sul telefono di papà (Android)
1. Mandagli il link su WhatsApp e aprilo con **Chrome**.
2. Tocca il tasto **Metti l'app sulla schermata Home** in alto (oppure menu ⋮ → **Aggiungi a schermata Home / Installa app**).
3. Da quel momento si apre dall'icona del quadrante blu, come un'app normale. Nessun account necessario.

Gli orologi salvati restano solo su quel telefono: ogni tanto usa **Scarica copia** in fondo a "I miei orologi".
