# YT Notes — Trascrizione & Appunti Interattivi per YouTube

Estensione browser (Chrome + Firefox, Manifest V3) per studiare i video di YouTube:
trascrizione sincronizzata, click-per-seek, appunti legati a intervalli `[inizio, fine]` con loop, ricerca esatta/fuzzy/semantica. Tutto salvato in locale (IndexedDB, offline-first).

## Installazione (utenti, 2 minuti, senza codice)

1. Vai su **[Releases](../../releases)** e scarica l'ultimo `yt-notes-X.Y.Z.zip`.
2. Scompatta lo zip in una cartella (es. `~/yt-notes/`).
3. **Chrome / Edge / Brave:** apri `chrome://extensions` → attiva **Modalità sviluppatore** → **Carica estensione non pacchettizzata** → seleziona la cartella scompattata.
4. **Firefox:** apri `about:debugging#/runtime/this-firefox` → **Carica componente aggiuntivo temporaneo** → seleziona il file `manifest.json` dentro la cartella.
   > Nota: l'installazione temporanea su Firefox decade alla chiusura del browser (limite di Firefox per le estensioni non firmate). Per un'installazione permanente serve la firma da addons.mozilla.org.

Poi apri un video su `youtube.com/watch` e usa il pannello **YT Notes** in alto a destra.

## Uso

- **Trascrizione:** elenco sincronizzato dei segmenti; click su una frase → salto al secondo esatto.
- **Ricerca:** Esatta, Fuzzy (tollera errori di battitura), Semantica (opt-in nelle Opzioni).
- **Appunti:** ★ su un risultato per salvarlo; **Loop** per ripetere l'intervallo; ✕ per eliminare. Persistono anche se il video viene rimosso.
- **Opzioni** (toolbar → dettagli estensione → Opzioni): abilita ricerca semantica, Scegli layout.

## Versione Web (senza installare l'estensione)

La cartella della release contiene anche una demo web: apri `src/web/index.html` nel browser,
incolla l'URL del video e premi Carica.
> Limite noto: nel browser i sottotitoli YouTube sono bloccati dal CORS, quindi la demo mostra solo il player. La trascrizione completa richiede l'estensione.

## Sviluppo

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest (43 test)
npm run build       # output in dist/
```

Carica `dist/` come estensione non pacchettizzata (vedi sopra).

### Creare una release

```bash
npm version patch   # o minor/major → crea tag vX.Y.Z
git push origin main --tags
```

Il workflow `release.yml` compila, testa e pubblica lo zip su GitHub Releases automaticamente.

## Architettura

- `src/background` — service worker MV3 (router messaggi minimo)
- `src/content` — UI pannello (Preact + Shadow DOM)
- `src/lib` — `captions` (track YouTube → json3), `player` (seek/play), `search` (exact/fuzzy TF-coseno), `db` (IndexedDB: videos, highlights, settings)
- `src/popup`, `src/options`, `src/web` — pagine secondarie

## Permessi (perché servono)

- `storage` — salvare note e impostazioni in locale
- `activeTab` / `scripting` — interagire con la pagina YouTube aperta
- host `*://*.youtube.com/*` — solo per leggere player e sottotitoli su YouTube. Nessun dato lascia il tuo browser.

## Note

La ricerca semantica è opt-in per non impattare le performance. L'implementazione attuale usa similarità TF/coseno; può essere sostituita con embedding via transformers.js.
