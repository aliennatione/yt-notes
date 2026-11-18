import { h, render } from 'preact';

function App() {
  const load = () => {
    const url = (document.getElementById('url') as HTMLInputElement).value;
    const id = new URL(url).searchParams.get('v');
    if (!id) return;
    const div = document.getElementById('player')!;
    div.innerHTML = `<iframe width="640" height="360" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>`;
    document.getElementById('transcript')!.textContent = 'Trascrizione: apri l\'estensione per i sottotitoli (limitazioni CORS nella versione web).';
  };
  (document.getElementById('load') as HTMLButtonElement).onclick = load;
  return null;
}
render(<App />, document.body);
