import { describe, it, expect } from 'vitest';
import { exactSearch, fuzzySearch, semanticSearch, tfVector, cosine } from '../src/lib/search';

const caps = [
  { start: 0, end: 2, text: 'ciao mondo' },
  { start: 2, end: 4, text: 'hello world' },
  { start: 4, end: 6, text: 'addio terra' },
] as any;

describe('exactSearch', () => {
  it('trova match case-insensitive', () => {
    expect(exactSearch(caps, 'mondo')).toHaveLength(1);
    expect(exactSearch(caps, 'MONDO')).toHaveLength(1);
    expect(exactSearch(caps, 'CIAO')).toHaveLength(1);
  });
  it('ritorna [] se nessun match', () => {
    expect(exactSearch(caps, 'xyz')).toEqual([]);
  });
  it('match parziale', () => {
    expect(exactSearch(caps, 'mond').length).toBe(1);
  });
});

describe('fuzzySearch', () => {
  it('trova match esatto', () => {
    expect(fuzzySearch(caps, 'mondo').length).toBeGreaterThan(0);
  });
  it('tollera typo', () => {
    // "mando" invece di "mondo"
    const r = fuzzySearch(caps, 'mando');
    expect(r.length).toBeGreaterThan(0);
  });
  it('ritorna [] per query senza senso', () => {
    expect(fuzzySearch(caps, 'zzzqqq')).toEqual([]);
  });
  it('non crasha con lista vuota', () => {
    expect(fuzzySearch([], 'ciao')).toEqual([]);
  });
});

describe('tfVector / cosine', () => {
  it('tfVector conta occorrenze', () => {
    expect(tfVector('ciao ciao mondo', ['ciao', 'mondo', 'x'])).toEqual([2, 1, 0]);
  });
  it('cosine: identici = 1, ortogonali = 0', () => {
    expect(cosine([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it('cosine: vettore nullo non dà NaN', () => {
    expect(cosine([0, 0], [1, 1])).toBe(0);
  });
});

describe('semanticSearch', () => {
  it('trova il segmento con parole in comune', () => {
    const r = semanticSearch(caps, 'mondo');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].text).toContain('mondo');
  });
  it('ritorna array anche senza overlap', () => {
    expect(Array.isArray(semanticSearch(caps, 'saluto'))).toBe(true);
  });
  it('limita a max 20 risultati', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ start: i, end: i + 1, text: 'parola comune' }));
    expect(semanticSearch(many as any, 'parola').length).toBeLessThanOrEqual(20);
  });
  it('non crasha con lista vuota', () => {
    expect(semanticSearch([], 'ciao')).toEqual([]);
  });
});
