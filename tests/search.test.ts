import { describe, it, expect } from 'vitest';
import { exactSearch, semanticSearch } from '../src/lib/search';
const caps = [
  { start: 0, end: 2, text: 'ciao mondo' },
  { start: 2, end: 4, text: 'hello world' },
  { start: 4, end: 6, text: 'addio terra' },
];
describe('search', () => {
  it('exact', () => {
    expect(exactSearch(caps as any, 'mondo').length).toBe(1);
  });
  it('semantic', () => {
    const r = semanticSearch(caps as any, 'saluto');
    expect(Array.isArray(r)).toBe(true);
  });
});
