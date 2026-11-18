# YT Notes — Trascrizione & Appunti Interattivi per YouTube

Estensione browser cross-browser (Chrome + Firefox, Manifest V3) per studiare, trascrivere e prendere appunti interattivi dai video di YouTube in tempo reale.

## Funzionalità
- Pannello laterale su youtube.com/watch con trascrizione sincronizzata.
- Click su una frase → seek al secondo esatto.
- Evidenziazione/appunto collegato all'intervallo temporale `[inizio, fine]` con loop continuo.
- Ricerca esatta, fuzzy e semantica (opt-in).
- Salvataggio locale offline-first (IndexedDB): note consultabili anche se il video viene rimosso.

## Versione Web
Apri dist/src/web/index.html (o servila con server statico) e inserisci l URL del video.

## Sviluppo
```bash
npm install
npm run typecheck
npm run build
```
Output in `dist/`. Caricare come estensione non pacchettizzata (Chrome: chrome://extensions → Modalità sviluppatore → Carica estensione non pacchettizzata → seleziona `dist/`).

## Architettura
- `src/background` service worker
- `src/content` UI (Preact, Shadow DOM)
- `src/lib` captions, player, search, db

## Note
La ricerca semantica è opt-in (impostazioni) per non impattare performance. L'implementazione attuale usa similarità TF/coseno; può essere sostituita con embedding via transformers.js.
