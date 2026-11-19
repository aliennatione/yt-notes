import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

function loadManifest() {
  const p = join(DIST, 'manifest.json');
  if (!existsSync(p)) throw new Error('dist/manifest.json mancante: esegui npm run build');
  return JSON.parse(readFileSync(p, 'utf8'));
}

describe('manifest + dist (smoke test estensione)', () => {
  it('manifest_version 3 e campi obbligatori', () => {
    const m = loadManifest();
    expect(m.manifest_version).toBe(3);
    expect(m.name).toBeTruthy();
    expect(m.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(m.background?.service_worker).toBeTruthy();
  });

  it('tutti i file referenziati esistono in dist/', () => {
    const m = loadManifest();
    const files: string[] = [
      m.background.service_worker,
      m.action?.default_popup,
      m.options_page,
      ...(m.content_scripts?.flatMap((cs: any) => [...(cs.js || []), ...(cs.css || [])]) || []),
    ].filter(Boolean);
    for (const f of files) {
      expect(existsSync(join(DIST, f)), `mancante in dist/: ${f}`).toBe(true);
    }
  });

  it('icone presenti', () => {
    const m = loadManifest();
    for (const p of Object.values(m.icons || {}) as string[]) {
      expect(existsSync(join(DIST, p as string)), `icona mancante: ${p}`).toBe(true);
    }
  });

  it('bundle principali non vuoti', () => {
    for (const f of ['background.js', 'content.js']) {
      const p = join(DIST, f);
      expect(existsSync(p)).toBe(true);
      expect(readFileSync(p, 'utf8').length).toBeGreaterThan(100);
    }
  });
});
