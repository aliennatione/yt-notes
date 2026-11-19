import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getVideoId, getCaptionTracks, fetchCaptions, pickTrack } from '../src/lib/captions';

describe('getVideoId', () => {
  const realLocation = globalThis.location;
  afterEach(() => {
    vi.unstubAllGlobals();
    // restore if needed
    if (realLocation) {
      try { (globalThis as any).location = realLocation; } catch { /* noop */ }
    }
  });
  it('estrae v da URL watch standard', () => {
    vi.stubGlobal('location', new URL('https://www.youtube.com/watch?v=abc123&t=10s'));
    expect(getVideoId()).toBe('abc123');
  });
  it('ritorna null se manca il parametro v', () => {
    vi.stubGlobal('location', new URL('https://www.youtube.com/feed/subscriptions'));
    expect(getVideoId()).toBeNull();
  });
});

describe('getCaptionTracks', () => {
  afterEach(() => { delete (window as any).ytInitialPlayerResponse; });
  it('ritorna [] se ytInitialPlayerResponse manca', () => {
    expect(getCaptionTracks()).toEqual([]);
  });
  it('estrae captionTracks quando presenti', () => {
    const tracks = [{ languageCode: 'it', baseUrl: 'https://example.com/a' }];
    (window as any).ytInitialPlayerResponse = {
      captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
    };
    expect(getCaptionTracks()).toEqual(tracks);
  });
  it('ritorna [] se la struttura è malformata', () => {
    (window as any).ytInitialPlayerResponse = { captions: null };
    expect(getCaptionTracks()).toEqual([]);
  });
});

describe('pickTrack', () => {
  const tracks = [
    { languageCode: 'en', baseUrl: 'en-url' },
    { languageCode: 'it', baseUrl: 'it-url' },
    { languageCode: 'it-ASR', baseUrl: 'it-asr-url' },
  ];
  it('preferisce la lingua richiesta', () => {
    expect(pickTrack(tracks, 'it').baseUrl).toBe('it-url');
  });
  it('fa fallback al primo track se la lingua manca', () => {
    expect(pickTrack(tracks, 'de').baseUrl).toBe('en-url');
  });
  it('ritorna undefined con lista vuota', () => {
    expect(pickTrack([], 'it')).toBeUndefined();
  });
});

describe('fetchCaptions', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  const json3 = {
    events: [
      { tStartMs: 0, dDurationMs: 2000, segs: [{ utf8: 'ciao ' }, { utf8: 'mondo' }] },
      { tStartMs: 2000, dDurationMs: 1500, segs: [{ utf8: 'seconda\nriga' }] },
      { tStartMs: 4000, dDurationMs: 1000 }, // senza segs -> saltato
      { tStartMs: 5000, dDurationMs: 1000, segs: [{ utf8: '   ' }] }, // vuoto -> saltato
    ],
  };

  it('parsa eventi json3 in Caption[]', async () => {
    (fetch as any).mockResolvedValue({ json: async () => json3 });
    const caps = await fetchCaptions('https://example.com/api?x=1');
    expect(caps).toHaveLength(2);
    expect(caps[0]).toEqual({ start: 0, end: 2, text: 'ciao mondo' });
    expect(caps[1]).toEqual({ start: 2, end: 3.5, text: 'seconda riga' });
  });

  it('aggiunge fmt=json3 solo se manca', async () => {
    (fetch as any).mockResolvedValue({ json: async () => ({ events: [] }) });
    await fetchCaptions('https://example.com/api?x=1');
    expect(fetch).toHaveBeenCalledWith('https://example.com/api?x=1&fmt=json3');
    await fetchCaptions('https://example.com/api?fmt=srv3&x=1');
    expect(fetch).toHaveBeenCalledWith('https://example.com/api?fmt=srv3&x=1');
  });

  it('gestisce baseUrl senza query string', async () => {
    (fetch as any).mockResolvedValue({ json: async () => ({ events: [] }) });
    await fetchCaptions('https://example.com/api');
    const calledUrl = (fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain('fmt=json3');
  });
});
