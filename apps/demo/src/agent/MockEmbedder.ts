/**
 * Word-overlap mock embeddings (64-D, L2-normalized).
 * Same text always yields the same vector; vocabulary grows with words seen.
 */

export class MockEmbedder {
  private vocab: Map<string, number> = new Map();
  private dim = 64;

  private seedWords = [
    'dark',
    'mode',
    'light',
    'ui',
    'interface',
    'prefer',
    'like',
    'user',
    'agent',
    'memory',
    'remember',
    'recall',
    'store',
    'rag',
    'pipeline',
    'build',
    'building',
    'startup',
    'app',
    'solana',
    'crypto',
    'defi',
    'yield',
    'farming',
    'stake',
    'hnsw',
    'algorithm',
    'vector',
    'embedding',
    'search',
    'minimal',
    'clean',
    'simple',
    'design',
    'theme',
    'color',
    'agent',
    'generated',
    'dim',
    'dimension',
    'fast',
    'slow',
    'data',
    'model',
    'train',
    'inference',
    'latency',
    'ms',
  ];

  constructor() {
    this.seedWords.forEach((w, i) => this.vocab.set(w, i % this.dim));
  }

  embed(text: string): number[] {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    words.forEach((w) => {
      if (!this.vocab.has(w)) {
        this.vocab.set(w, this.vocab.size % this.dim);
      }
    });

    const vec = new Array(this.dim).fill(0);
    const freq = new Map<string, number>();
    words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));

    freq.forEach((count, word) => {
      const idx = this.vocab.get(word)!;
      vec[idx] += count / words.length;
    });

    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return mag === 0 ? vec : vec.map((v) => v / mag);
  }
}

const sharedEmbedder = new MockEmbedder();

export function mockEmbed(text: string): number[] {
  return sharedEmbedder.embed(text);
}
