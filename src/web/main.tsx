import { h, render } from 'preact';

function App() {
  const load = () => {
    const raw = (document.getElementById('url') as HTMLInputElement).value.trim();
    let id: string | null = null;
    try { id = new URL(raw).searchParams.get('v'); } catch { id = null; }
    if (!id) {
      document.getElementById('transcript')!.textContent = 'URL non valido: incolla un link tipo https://www.youtube.com/watch?v=...';
      return;
    }
    const div = document.getElementById('player')!;
    div.innerHTML = `<iframe width="640" height="360" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>`;
    document.getElementById('transcript')!.textContent = 'Trascrizione: apri l\'estensione per i sottotitoli (limitazioni CORS nella versione web).';
  };
  (document.getElementById('load') as HTMLButtonElement).onclick = load;
  return null;
}
render(<App />, document.body);
