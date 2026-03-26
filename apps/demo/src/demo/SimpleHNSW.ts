import type { SimpleStore } from '../agent/AgentLoop';

/**
 * Lightweight in-browser HNSW-like store (brute-force cosine for demo).
 * No WASM dependency — pure JS for maximum portability.
 */
export class SimpleHNSW implements SimpleStore {
  private vectors: Map<string, { values: number[]; metadata: Record<string, unknown> }> = new Map();

  insert(id: string, vector: number[], metadata: Record<string, unknown>): void {
    this.vectors.set(id, { values: vector, metadata });
  }

  query(vector: number[], topK: number): Array<{ id: string; score: number; metadata: Record<string, unknown> }> {
    const scored: Array<{ id: string; score: number; metadata: Record<string, unknown> }> = [];
    for (const [id, entry] of this.vectors.entries()) {
      const score = this._cosine(vector, entry.values);
      scored.push({ id, score, metadata: entry.metadata });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  delete(id: string): void {
    this.vectors.delete(id);
  }

  getVector(id: string): number[] | undefined {
    return this.vectors.get(id)?.values;
  }

  setVector(id: string, values: number[]): void {
    const entry = this.vectors.get(id);
    if (entry) entry.values = values;
  }

  getAllIds(): string[] {
    return Array.from(this.vectors.keys());
  }

  size(): number {
    return this.vectors.size;
  }

  getAllEntries(): Array<{ id: string; values: number[]; metadata: Record<string, unknown> }> {
    return Array.from(this.vectors.entries()).map(([id, e]) => ({ id, values: e.values, metadata: e.metadata }));
  }

  private _cosine(a: number[], b: number[]): number {
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      nA += a[i] * a[i];
      nB += b[i] * b[i];
    }
    const d = Math.sqrt(nA) * Math.sqrt(nB);
    return d < 1e-8 ? 0 : dot / d;
  }
}
