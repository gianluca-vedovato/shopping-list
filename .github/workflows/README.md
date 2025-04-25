# Keep-Alive GitHub Action

Questo GitHub Action è configurato per mantenere attivo il tuo bot Telegram inviando una richiesta HTTP al tuo servizio ogni 5 minuti. Questo impedisce al servizio di hosting (come Render) di mettere il bot in modalità sleep dopo periodi di inattività.

## Configurazione

Per configurare correttamente questo GitHub Action, devi seguire questi passaggi:

1. Assicurati che il tuo repository sia su GitHub
2. Vai alla pagina del tuo repository su GitHub
3. Clicca su "Settings" (in alto a destra)
4. Nel menu a sinistra, clicca su "Secrets and variables" e poi "Actions"
5. Clicca su "New repository secret"
6. Aggiungi un nuovo segreto con:
   - Nome: `BOT_URL`
   - Valore: l'URL completo del tuo bot (es. `https://tuo-bot-telegram.onrender.com`)
7. Clicca su "Add secret"

Una volta configurato il segreto, l'Action inizierà a eseguire automaticamente ogni 5 minuti, inviando una richiesta HTTP al tuo bot per mantenerlo attivo.

## Esecuzione manuale

Puoi anche eseguire manualmente l'Action:
1. Vai alla scheda "Actions" del tuo repository
2. Seleziona il workflow "Keep Bot Alive" dalla lista
3. Clicca su "Run workflow"

## Monitoraggio

Puoi verificare che l'Action stia funzionando correttamente:
1. Vai alla scheda "Actions" del tuo repository
2. Clicca sul workflow "Keep Bot Alive"
3. Controlla i log delle esecuzioni recenti per assicurarti che stiano avendo successo
