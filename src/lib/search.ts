import Fuse from 'fuse.js';
import type { Caption } from './captions';

export function exactSearch(caps: Caption[], q: string): Caption[] {
  const low = q.toLowerCase();
  return caps.filter(c => c.text.toLowerCase().includes(low));
}

export function fuzzySearch(caps: Caption[], q: string): Caption[] {
  const fuse = new Fuse(caps, { keys: ['text'], threshold: 0.4 });
  return fuse.search(q).map(r => r.item);
}

// Semantic (opt-in) placeholder: cosine over simple TF vectors (no ML). 
// Real embedding via transformers.js can replace this.
export function tfVector(text: string, vocab: string[]): number[] {
  const toks = text.toLowerCase().split(/\W+/);
  const v = new Array(vocab.length).fill(0);
  for (const t of toks) {
    const i = vocab.indexOf(t);
    if (i >= 0) v[i]++;
  }
  return v;
}
export function cosine(a: number[], b: number[]): number {
  let dot=0,na=0,nb=0;
  for (let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
  return dot/(Math.sqrt(na)*Math.sqrt(nb)||1);
}
export function semanticSearch(caps: Caption[], q: string): Caption[] {
  const vocab = Array.from(new Set(caps.flatMap(c=>c.text.toLowerCase().split(/\W+/)).concat(q.toLowerCase().split(/\W+/))));
  const qv = tfVector(q, vocab);
  return caps.map(c => ({ c, score: cosine(tfVector(c.text, vocab), qv) }))
            .sort((a,b)=>b.score-a.score)
            .filter(x=>x.score>0.1)
            .slice(0,20)
            .map(x=>x.c);
}
