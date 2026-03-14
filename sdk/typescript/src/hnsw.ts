import { loadWasm, getWasm } from './wasm';
import type { WasmIndexType } from './wasm';
import { DistanceMetric } from './types';

const METRIC_TO_INT: Record<DistanceMetric, number> = {
  cosine: 0,
  euclidean: 1,
  dot: 2,
};

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

/**
 * HNSWManager — manages the HNSW index per collection
 * Uses Rust WASM engine when available, JS fallback when not
 */
export class HNSWManager {
  private wasmIndex: WasmIndexType | null = null;
  private jsVectors: Map<string, { values: number[]; metadata: Record<string, unknown> }> = new Map();
  private metric: DistanceMetric;
  private initialized = false;

  constructor(metric: DistanceMetric = 'cosine') {
    this.metric = metric;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const wasm = await loadWasm();

    if (wasm) {
      try {
        this.wasmIndex = new wasm.WasmHNSWIndex(16, 200, METRIC_TO_INT[this.metric]);
        console.log('[SolVec] Using Rust HNSW engine');
      } catch (e) {
        console.warn('[SolVec] WASM index creation failed, using JS fallback');
        this.wasmIndex = null;
      }
    }

    this.initialized = true;
  }

  insert(id: string, values: number[], metadata: Record<string, unknown> = {}): void {
    // Always keep JS map in sync for fast metadata lookups and fallback
    this.jsVectors.set(id, { values, metadata });

    // Insert into WASM index if available
    if (this.wasmIndex) {
      try {
        const metaJson = JSON.stringify(metadata);
        this.wasmIndex.insert(id, new Float32Array(values), metaJson);
      } catch (e) {
        console.warn('[SolVec] WASM insert failed for id:', id, e);
      }
    }
  }

  query(queryVector: number[], topK: number): SearchResult[] {
    if (this.wasmIndex) {
      try {
        const resultsJson = this.wasmIndex.query(new Float32Array(queryVector), topK);
        const results = JSON.parse(resultsJson) as SearchResult[];
        return results;
      } catch (e) {
        console.warn('[SolVec] WASM query failed, using JS fallback:', e);
      }
    }

    // JS fallback — brute force cosine similarity
    return this._jsFallbackQuery(queryVector, topK);
  }

  delete(id: string): void {
    this.jsVectors.delete(id);
    if (this.wasmIndex) {
      try {
        this.wasmIndex.delete(id);
      } catch (e) {
        // Ignore — already deleted from JS map
      }
    }
  }

  has(id: string): boolean {
    return this.jsVectors.has(id);
  }

  size(): number {
    return this.jsVectors.size;
  }

  isEmpty(): boolean {
    return this.jsVectors.size === 0;
  }

  getAllIds(): string[] {
    return Array.from(this.jsVectors.keys());
  }

  getValues(id: string): number[] | undefined {
    return this.jsVectors.get(id)?.values;
  }

  getAllEntries(): Array<{ id: string; values: number[]; metadata: Record<string, unknown> }> {
    return Array.from(this.jsVectors.entries()).map(([id, entry]) => ({
      id,
      values: entry.values,
      metadata: entry.metadata,
    }));
  }

  toJson(): string {
    if (this.wasmIndex) {
      try {
        return this.wasmIndex.toJson();
      } catch (e) {
        // Fall through to JS serialization
      }
    }
    return JSON.stringify({
      vectors: Object.fromEntries(this.jsVectors),
      metric: this.metric,
    });
  }

  isUsingWasm(): boolean {
    return this.wasmIndex !== null;
  }

  private _jsFallbackQuery(queryVector: number[], topK: number): SearchResult[] {
    const scored: SearchResult[] = [];

    for (const [id, entry] of this.jsVectors.entries()) {
      const score = this._cosineSimilarity(queryVector, entry.values);
      scored.push({ id, score, metadata: entry.metadata });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private _cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom < 1e-8 ? 0 : dot / denom;
  }
}
