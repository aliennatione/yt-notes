export interface Caption { start: number; end: number; text: string; }

export function getVideoId(): string | null {
  try {
    const u = new URL(location.href);
    return u.searchParams.get('v');
  } catch { return null; }
}

export function getCaptionTracks(): any[] {
  try {
    const pr = (window as any).ytInitialPlayerResponse;
    return pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  } catch { return []; }
}

export async function fetchCaptions(trackUrl: string): Promise<Caption[]> {
  let url = trackUrl;
  if (!url.includes('fmt=')) url += (url.includes('?') ? '&' : '?') + 'fmt=json3';
  const res = await fetch(url);
  const data = await res.json();
  const caps: Caption[] = [];
  for (const ev of data.events || []) {
    if (!ev.segs) continue;
    const start = (ev.tStartMs || 0) / 1000;
    const dur = (ev.dDurationMs || 0) / 1000;
    const text = ev.segs.map((s: any) => s.utf8 || '').join('').replace(/\n/g, ' ').trim();
    if (text) caps.push({ start, end: start + dur, text });
  }
  return caps;
}

export function pickTrack(tracks: any[], lang = 'it'): any {
  return tracks.find(t => (t.languageCode || '').startsWith(lang)) || tracks[0];
}
