import { openDB, IDBPDatabase } from 'idb';

export interface VideoRecord { videoId: string; title: string; channel: string; duration: number; captions: Caption[]; createdAt: number; }
export interface Caption { start: number; end: number; text: string; }
export interface Highlight { id: string; videoId: string; text: string; start: number; end: number; note: string; color: string; createdAt: number; }

let dbPromise: Promise<IDBPDatabase> | null = null;
export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('yt-notes', 1, {
      upgrade(db) {
        db.createObjectStore('videos', { keyPath: 'videoId' });
        const h = db.createObjectStore('highlights', { keyPath: 'id' });
        h.createIndex('byVideo', 'videoId');
        db.createObjectStore('settings', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}
export async function saveVideo(v: VideoRecord) { const db = await getDB(); await db.put('videos', v); }
export async function getVideo(id: string) { const db = await getDB(); return db.get('videos', id); }
export async function listVideos() { const db = await getDB(); return db.getAll('videos'); }
export async function saveHighlight(h: Highlight) { const db = await getDB(); await db.put('highlights', h); }
export async function getHighlights(videoId: string) { const db = await getDB(); return db.getAllFromIndex('highlights', 'byVideo', videoId); }
export async function deleteHighlight(id: string) { const db = await getDB(); await db.delete('highlights', id); }
export async function getSetting(key: string) { const db = await getDB(); const r = await db.get('settings', key); return r?.value; }
export async function setSetting(key: string, value: any) { const db = await getDB(); await db.put('settings', { key, value }); }
