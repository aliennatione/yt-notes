import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getVideoId, getCaptionTracks, fetchCaptions, pickTrack, type Caption } from '../lib/captions';
import { seek, currentTime } from '../lib/player';
import { exactSearch, fuzzySearch, semanticSearch } from '../lib/search';
import { saveVideo, getVideo, saveHighlight, getHighlights, deleteHighlight, type Highlight } from '../lib/db';

function uid() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch { /* fallback */ }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function Panel() {
  const [caps, setCaps] = useState<Caption[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Caption[]>([]);
  const [loopRange, setLoopRange] = useState<{ start: number; end: number } | null>(null);
  const [semantic, setSemantic] = useState(false);
  const [status, setStatus] = useState('Caricamento...');
  const vid = getVideoId();

  useEffect(() => {
    (async () => {
      if (!vid) { setStatus('Nessun video'); return; }
      let v = await getVideo(vid);
      if (!v) {
        const tracks = getCaptionTracks();
        if (!tracks.length) { setStatus('Nessun sottotitolo disponibile'); return; }
        const t = pickTrack(tracks);
        const c = await fetchCaptions(t.baseUrl);
        v = { videoId: vid, title: document.title, channel: '', duration: 0, captions: c, createdAt: Date.now() };
        await saveVideo(v);
      }
      setCaps(v.captions);
      setHighlights(await getHighlights(vid));
      setStatus(`${v.captions.length} segmenti`);
    })();
  }, []);

  // loop controller
  useEffect(() => {
    if (!loopRange) return;
    let raf = 0;
    const tick = () => {
      const t = currentTime();
      if (t < loopRange.start || t > loopRange.end) seek(loopRange.start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopRange]);

  const doSearch = (mode: 'exact' | 'fuzzy' | 'semantic') => {
    if (!q.trim()) { setResults([]); return; }
    if (mode === 'exact') setResults(exactSearch(caps, q));
    else if (mode === 'fuzzy') setResults(fuzzySearch(caps, q));
    else setResults(semanticSearch(caps, q));
  };

  const addHighlight = async (c: Caption) => {
    const h: Highlight = { id: uid(), videoId: vid!, text: c.text, start: c.start, end: c.end, note: '', color: '#ffeb3b', createdAt: Date.now() };
    await saveHighlight(h);
    setHighlights(await getHighlights(vid!));
  };

  return (
    <div style={{ position:'fixed', top:'80px', right:'16px', width:'360px', maxHeight:'80vh', overflow:'auto', background:'#181818', color:'#eee', padding:'12px', borderRadius:'8px', zIndex:9999, fontFamily:'sans-serif', fontSize:'13px' }}>
      <strong>YT Notes</strong> <span style={{opacity:.6}}>{status}</span>
      <div style={{marginTop:'8px', display:'flex', gap:'4px'}}>
        <input value={q} onInput={(e:any)=>setQ(e.target.value)} placeholder="cerca..." style={{flex:1}} />
      </div>
      <div style={{marginTop:'4px', display:'flex', gap:'4px', flexWrap:'wrap'}}>
        <button onClick={()=>doSearch('exact')}>Esatta</button>
        <button onClick={()=>doSearch('fuzzy')}>Fuzzy</button>
        <button onClick={()=>{ const next = !semantic; setSemantic(next); if(next) doSearch('semantic'); }}>{semantic?'Semantica ON':'Semantica OFF'}</button>
        {semantic && <button onClick={()=>doSearch('semantic')}>Semantica</button>}
      </div>
      {results.length>0 && (
        <div style={{marginTop:'8px', borderTop:'1px solid #333', paddingTop:'8px'}}>
          <b>Risultati ({results.length})</b>
          {results.map((c,i)=>(
            <div key={i} style={{padding:'4px 0', cursor:'pointer'}} onClick={()=>seek(c.start)}>
              <span style={{color:'#4fc3f7'}}>[{c.start.toFixed(1)}s]</span> {c.text}
              <button style={{marginLeft:'4px'}} onClick={(e:any)=>{e.stopPropagation();addHighlight(c);}}>★</button>
            </div>
          ))}
        </div>
      )}
      {loopRange && (
        <div style={{marginTop:'8px', color:'#ff9800'}}>
          Loop: {loopRange.start.toFixed(1)}s–{loopRange.end.toFixed(1)}s
          <button style={{marginLeft:'8px'}} onClick={()=>setLoopRange(null)}>Stop</button>
        </div>
      )}
      <div style={{marginTop:'8px', borderTop:'1px solid #333', paddingTop:'8px', maxHeight:'40vh', overflow:'auto'}}>
        <b>Trascrizione</b>
        {caps.map((c,i)=>(
          <div key={i} style={{padding:'2px 0'}} onClick={()=>seek(c.start)}>
            <span style={{color:'#4fc3f7', cursor:'pointer'}}>[{c.start.toFixed(1)}]</span> {c.text}
          </div>
        ))}
      </div>
      {highlights.length>0 && (
        <div style={{marginTop:'8px', borderTop:'1px solid #333', paddingTop:'8px'}}>
          <b>Appunti ({highlights.length})</b>
          {highlights.map(h=>(
            <div key={h.id} style={{padding:'4px 0', background:h.color+'22', borderRadius:'4px', marginBottom:'4px'}}>
              <span style={{cursor:'pointer'}} onClick={()=>seek(h.start)}>[{h.start.toFixed(1)}–{h.end.toFixed(1)}]</span> {h.text}
              <div style={{marginTop:'2px'}}>
                <button onClick={()=>setLoopRange({start:h.start,end:h.end})}>Loop</button>
                <button onClick={async()=>{await deleteHighlight(h.id); setHighlights(await getHighlights(vid!));}} style={{marginLeft:'4px'}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function mount() {
  if (document.getElementById('yt-notes-root')) return;
  const host = document.createElement('div');
  host.id = 'yt-notes-root';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadow.appendChild(container);
  render(<Panel />, container);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
