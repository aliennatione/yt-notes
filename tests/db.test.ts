import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveVideo, getVideo, listVideos,
  saveHighlight, getHighlights, deleteHighlight,
  getSetting, setSetting,
} from '../src/lib/db';

describe('db videos', () => {
  it('save + get video (offline-first)', async () => {
    const v: any = {
      videoId: 'vid1', title: 'T', channel: 'C', duration: 100,
      captions: [{ start: 0, end: 1, text: 'ciao' }], createdAt: Date.now(),
    };
    await saveVideo(v);
    const got = await getVideo('vid1');
    expect(got?.videoId).toBe('vid1');
    expect(got?.captions).toHaveLength(1);
  });

  it('get video inesistente -> undefined', async () => {
    expect(await getVideo('missing')).toBeUndefined();
  });

  it('listVideos contiene i salvati', async () => {
    await saveVideo({ videoId: 'vidL', title: 'L', channel: '', duration: 0, captions: [], createdAt: 0 } as any);
    const all = await listVideos();
    expect(all.map((x) => x.videoId)).toContain('vidL');
  });
});

describe('db highlights', () => {
  beforeEach(async () => {
    // pulizia mirata: elimina eventuali highlight del video di test
    for (const h of await getHighlights('vidH')) await deleteHighlight(h.id);
  });

  it('save + getHighlights filtra per videoId', async () => {
    await saveHighlight({ id: 'h1', videoId: 'vidH', text: 't', start: 1, end: 2, note: '', color: '#ffeb3b', createdAt: 0 });
    await saveHighlight({ id: 'hX', videoId: 'other', text: 't', start: 1, end: 2, note: '', color: '#ffeb3b', createdAt: 0 });
    const hs = await getHighlights('vidH');
    expect(hs.map((h) => h.id)).toContain('h1');
    expect(hs.map((h) => h.id)).not.toContain('hX');
    await deleteHighlight('hX');
  });

  it('deleteHighlight rimuove', async () => {
    await saveHighlight({ id: 'hDel', videoId: 'vidH', text: 't', start: 0, end: 1, note: '', color: '#fff', createdAt: 0 });
    await deleteHighlight('hDel');
    expect((await getHighlights('vidH')).map((h) => h.id)).not.toContain('hDel');
  });
});

describe('db settings', () => {
  it('set + get setting', async () => {
    await setSetting('semantic', true);
    expect(await getSetting('semantic')).toBe(true);
  });
  it('get chiave mancante -> undefined', async () => {
    expect(await getSetting('nope-mai')).toBeUndefined();
  });
});
