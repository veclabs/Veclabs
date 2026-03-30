import type { SolVecCollection } from './collection';
import { computeMerkleRootFromIds } from './merkle';

export interface MemoryRecord {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
  writtenAt: number;
  merkleRootAtWrite: string;
  hnswLayer: number;
  neighborCount: number;
}

export interface InspectorCollectionStats {
  totalMemories: number;
  dimensions: number;
  currentMerkleRoot: string;
  onChainRoot: string;
  rootsMatch: boolean;
  lastWriteAt: number;
  lastChainSyncAt: number;
  hnswLayerCount: number;
  memoryUsageBytes: number;
  encrypted: boolean;
}

export interface InspectorQuery {
  metadataFilter?: Record<string, unknown>;
  writtenAfter?: number;
  writtenBefore?: number;
  hnswLayer?: number;
  limit?: number;
  offset?: number;
}

export interface InspectionResult {
  stats: InspectorCollectionStats;
  memories: MemoryRecord[];
  totalMatching: number;
}

export interface MerkleHistoryEntry {
  root: string;
  timestamp: number;
  memoryCountAtTime: number;
  trigger: 'write' | 'delete' | 'bulk_write';
}

interface InternalHNSW {
  getAllIds(): string[];
  getAllEntries(): Array<{
    id: string;
    values: number[];
    metadata: Record<string, unknown>;
  }>;
  size(): number;
  query(
    queryVector: number[],
    topK: number,
  ): Array<{ id: string; score: number; metadata: Record<string, unknown> }>;
  getValues(id: string): number[] | undefined;
}

interface HostedInspectorConfig {
  hosted: boolean;
  fetchFn: (path: string, opts?: RequestInit) => Promise<any>;
  collectionName: string;
}

export class MemoryInspector {
  private _collection: SolVecCollection;
  private _writtenAt: Map<string, number> = new Map();
  private _merkleRootAtWrite: Map<string, string> = new Map();
  private _merkleHistory: MerkleHistoryEntry[] = [];
  private _hostedConfig?: HostedInspectorConfig;

  constructor(collection: SolVecCollection, hostedConfig?: HostedInspectorConfig) {
    this._collection = collection;
    this._hostedConfig = hostedConfig;
  }

  private _hnsw(): InternalHNSW {
    return (this._collection as unknown as { hnsw: InternalHNSW }).hnsw;
  }

  private _dimensions(): number {
    return (this._collection as unknown as { dimensions: number }).dimensions;
  }

  recordWrite(id: string): void {
    const now = Date.now();
    this._writtenAt.set(id, now);

    const ids = this._hnsw().getAllIds();
    const root = computeMerkleRootFromIds(ids);
    this._merkleRootAtWrite.set(id, root);
    this._merkleHistory.push({
      root,
      timestamp: now,
      memoryCountAtTime: ids.length,
      trigger: 'write',
    });
  }

  recordDelete(id: string): void {
    this._writtenAt.delete(id);
    this._merkleRootAtWrite.delete(id);

    const ids = this._hnsw().getAllIds();
    const root = computeMerkleRootFromIds(ids);
    this._merkleHistory.push({
      root,
      timestamp: Date.now(),
      memoryCountAtTime: ids.length,
      trigger: 'delete',
    });
  }

  recordBulkWrite(ids: string[]): void {
    const now = Date.now();
    const allIds = this._hnsw().getAllIds();
    const root = computeMerkleRootFromIds(allIds);

    for (const id of ids) {
      this._writtenAt.set(id, now);
      this._merkleRootAtWrite.set(id, root);
    }
    this._merkleHistory.push({
      root,
      timestamp: now,
      memoryCountAtTime: allIds.length,
      trigger: 'bulk_write',
    });
  }

  async stats(): Promise<InspectorCollectionStats> {
    if (this._hostedConfig?.hosted) {
      const data = await this._hostedConfig.fetchFn(
        `/api/v1/collections/${this._hostedConfig.collectionName}/inspect`
      );
      const s = data?.stats ?? {};
      return {
        totalMemories: s.total_memories ?? 0,
        dimensions: s.dimensions ?? 0,
        currentMerkleRoot: s.current_merkle_root ?? '',
        onChainRoot: s.on_chain_root ?? '',
        rootsMatch: s.roots_match ?? false,
        lastWriteAt: s.last_write_at ?? 0,
        lastChainSyncAt: s.last_chain_sync_at ?? 0,
        hnswLayerCount: s.hnsw_layer_count ?? 1,
        memoryUsageBytes: s.memory_usage_bytes ?? 0,
        encrypted: s.encrypted ?? false,
      };
    }
    const hnsw = this._hnsw();
    const ids = hnsw.getAllIds();
    const total = hnsw.size();
    const dims = this._dimensions();
    const root = computeMerkleRootFromIds(ids);

    let onChainRoot = '';
    let rootsMatch = false;
    try {
      const verification = await this._collection.verify();
      onChainRoot = verification.onChainRoot;
      rootsMatch = verification.match;
    } catch {
      // wallet not configured
    }

    return {
      totalMemories: total,
      dimensions: dims,
      currentMerkleRoot: root,
      onChainRoot,
      rootsMatch,
      lastWriteAt: Math.max(0, ...Array.from(this._writtenAt.values())),
      lastChainSyncAt: 0,
      hnswLayerCount: 0,
      memoryUsageBytes: total * dims * 4,
      encrypted: false,
    };
  }

  async inspect(query?: InspectorQuery): Promise<InspectionResult> {
    if (this._hostedConfig?.hosted) {
      const limit = query?.limit ?? 50;
      const offset = query?.offset ?? 0;
      const data = await this._hostedConfig.fetchFn(
        `/api/v1/collections/${this._hostedConfig.collectionName}/inspect?limit=${limit}&offset=${offset}`
      );
      return {
        stats: await this.stats(),
        memories: [],
        totalMatching: data?.total_matching ?? 0,
      };
    }
    const s = await this.stats();
    const entries = this._hnsw().getAllEntries();
    const limit = Math.min(query?.limit ?? 50, 500);
    const offset = query?.offset ?? 0;

    let records: MemoryRecord[] = entries.map((e) => ({
      id: e.id,
      vector: e.values,
      metadata: e.metadata,
      writtenAt: this._writtenAt.get(e.id) ?? 0,
      merkleRootAtWrite: this._merkleRootAtWrite.get(e.id) ?? '',
      hnswLayer: 0,
      neighborCount: 0,
    }));

    if (query?.writtenAfter != null) {
      records = records.filter((r) => r.writtenAt >= query!.writtenAfter!);
    }
    if (query?.writtenBefore != null) {
      records = records.filter((r) => r.writtenAt <= query!.writtenBefore!);
    }
    if (query?.hnswLayer != null) {
      records = records.filter((r) => r.hnswLayer === query!.hnswLayer!);
    }
    if (query?.metadataFilter) {
      const filter = query.metadataFilter;
      records = records.filter((r) =>
        Object.entries(filter).every(
          ([k, v]) => r.metadata[k] === v,
        ),
      );
    }

    records.sort((a, b) => b.writtenAt - a.writtenAt);
    const totalMatching = records.length;
    const memories = records.slice(offset, offset + limit);

    return { stats: s, memories, totalMatching };
  }

  async get(id: string): Promise<MemoryRecord | null> {
    if (this._hostedConfig?.hosted) {
      console.warn('[SolVec] inspector.get() is not yet available in hosted mode');
      return null;
    }
    const vals = this._hnsw().getValues(id);
    if (!vals) return null;

    const entries = this._hnsw().getAllEntries();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return null;

    return {
      id,
      vector: entry.values,
      metadata: entry.metadata,
      writtenAt: this._writtenAt.get(id) ?? 0,
      merkleRootAtWrite: this._merkleRootAtWrite.get(id) ?? '',
      hnswLayer: 0,
      neighborCount: 0,
    };
  }

  async searchWithRecords(
    queryVector: number[],
    topK: number,
  ): Promise<Array<{ score: number; memory: MemoryRecord }>> {
    if (this._hostedConfig?.hosted) {
      throw new Error(
        'searchWithRecords() is not yet available in hosted mode. Use collection.query() instead.'
      );
    }
    const results = this._hnsw().query(queryVector, topK);
    return results.map((r) => ({
      score: r.score,
      memory: {
        id: r.id,
        vector: this._hnsw().getValues(r.id) ?? [],
        metadata: r.metadata,
        writtenAt: this._writtenAt.get(r.id) ?? 0,
        merkleRootAtWrite: this._merkleRootAtWrite.get(r.id) ?? '',
        hnswLayer: 0,
        neighborCount: 0,
      },
    }));
  }

  async merkleHistory(): Promise<MerkleHistoryEntry[]> {
    if (this._hostedConfig?.hosted) return [];
    return [...this._merkleHistory];
  }

  async verify(): Promise<{
    match: boolean;
    localRoot: string;
    onChainRoot: string;
  }> {
    if (this._hostedConfig?.hosted) {
      return this._hostedConfig.fetchFn(
        `/api/v1/collections/${this._hostedConfig.collectionName}/verify`
      );
    }
    const s = await this.stats();
    return {
      match: s.rootsMatch,
      localRoot: s.currentMerkleRoot,
      onChainRoot: s.onChainRoot,
    };
  }
}
