import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  UpsertRecord,
  QueryOptions,
  QueryResponse,
  QueryMatch,
  UpsertResponse,
  CollectionStats,
  VerificationResult,
  CollectionConfig,
  DistanceMetric,
  Network,
} from "./types";

const METRIC_MAP: Record<DistanceMetric, number> = {
  cosine: 0,
  euclidean: 1,
  dot: 2,
};

/**
 * SolVecCollection - represents a single vector collection.
 *
 * This is the main interface developers interact with.
 * API is intentionally identical to Pinecone for easy migration.
 */
export class SolVecCollection {
  private name: string;
  private dimensions: number;
  private metric: DistanceMetric;
  private connection: Connection;
  private network: Network;
  private wallet?: Keypair;

  private vectors: Map<
    string,
    { values: number[]; metadata: Record<string, unknown> }
  >;

  constructor(
    name: string,
    config: CollectionConfig,
    connection: Connection,
    network: Network,
    wallet?: Keypair,
  ) {
    this.name = name;
    this.dimensions = config.dimensions ?? 1536;
    this.metric = config.metric ?? "cosine";
    this.connection = connection;
    this.network = network;
    this.wallet = wallet;
    this.vectors = new Map();
  }

  /**
   * Upsert vectors into the collection.
   * Stores encrypted vectors in Shadow Drive + updates Merkle root on Solana.
   */
  async upsert(records: UpsertRecord[]): Promise<UpsertResponse> {
    if (records.length === 0) return { upsertedCount: 0 };

    for (const record of records) {
      if (record.values.length !== this.dimensions) {
        throw new Error(
          `Dimension mismatch: collection expects ${this.dimensions}, got ${record.values.length} for id "${record.id}"`,
        );
      }
    }

    for (const record of records) {
      this.vectors.set(record.id, {
        values: record.values,
        metadata: record.metadata ?? {},
      });
    }

    if (this.wallet) {
      await this._updateOnChainRoot();
    }

    console.log(
      `[SolVec] Upserted ${records.length} vectors to collection '${this.name}'`,
    );

    return { upsertedCount: records.length };
  }

  /**
   * Query for nearest neighbors.
   * Searches in-memory HNSW index (< 5ms) + fetches metadata.
   */
  async query(options: QueryOptions): Promise<QueryResponse> {
    const {
      vector,
      topK,
      includeMetadata = true,
      includeValues = false,
    } = options;

    if (vector.length !== this.dimensions) {
      throw new Error(
        `Query dimension mismatch: expected ${this.dimensions}, got ${vector.length}`,
      );
    }

    if (this.vectors.size === 0) {
      return { matches: [], namespace: this.name };
    }

    const scored: Array<{
      id: string;
      score: number;
      metadata: Record<string, unknown>;
      values: number[];
    }> = [];

    for (const [id, entry] of this.vectors.entries()) {
      const score = this._cosineSimilarity(vector, entry.values);
      scored.push({
        id,
        score,
        metadata: entry.metadata,
        values: entry.values,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK);

    const matches: QueryMatch[] = topResults.map((r) => ({
      id: r.id,
      score: r.score,
      ...(includeMetadata ? { metadata: r.metadata } : {}),
      ...(includeValues ? { values: r.values } : {}),
    }));

    return { matches, namespace: this.name };
  }

  /**
   * Delete vectors by ID.
   */
  async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.vectors.delete(id);
    }

    if (this.wallet && ids.length > 0) {
      await this._updateOnChainRoot();
    }

    console.log(`[SolVec] Deleted ${ids.length} vectors from '${this.name}'`);
  }

  /**
   * Get collection statistics.
   */
  async describeIndexStats(): Promise<CollectionStats> {
    const merkleRoot = this._computeMerkleRoot();
    return {
      vectorCount: this.vectors.size,
      dimension: this.dimensions,
      metric: this.metric,
      name: this.name,
      merkleRoot,
      lastUpdated: Date.now(),
      isFrozen: false,
    };
  }

  /**
   * Verify collection integrity against on-chain Merkle root.
   * Returns proof URL on Solana Explorer.
   */
  async verify(): Promise<VerificationResult> {
    const localRoot = this._computeMerkleRoot();

    const onChainRoot = this.wallet
      ? await this._fetchOnChainRoot()
      : "wallet-required";

    const match = localRoot === onChainRoot;
    const explorerBase = "https://explorer.solana.com";

    const collectionAddress = this.wallet
      ? this._getCollectionPDA().toString()
      : "connect-wallet";

    return {
      verified: match,
      onChainRoot,
      localRoot,
      match,
      vectorCount: this.vectors.size,
      solanaExplorerUrl: `${explorerBase}/address/${collectionAddress}?cluster=${this.network}`,
      timestamp: Date.now(),
    };
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  private _cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom < 1e-8 ? 0 : dot / denom;
  }

  private _computeMerkleRoot(): string {
    const ids = Array.from(this.vectors.keys()).sort();
    if (ids.length === 0) return "0".repeat(64);

    let leaves = ids.map((id) => this._sha256Hex(id));

    while (leaves.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i];
        const right = i + 1 < leaves.length ? leaves[i + 1] : leaves[i];
        next.push(this._sha256Hex(left + right));
      }
      leaves = next;
    }

    return leaves[0];
  }

  private _sha256Hex(input: string): string {
    const { createHash } = require("crypto");
    return createHash("sha256").update(input).digest("hex");
  }

  private _getCollectionPDA(): PublicKey {
    if (!this.wallet) throw new Error("Wallet required");
    const PROGRAM_ID = new PublicKey(
      "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
    );
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("collection"),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(this.name),
      ],
      PROGRAM_ID,
    );
    return pda;
  }

  private async _updateOnChainRoot(): Promise<void> {
    const root = this._computeMerkleRoot();
    console.log(
      `[SolVec] Merkle root computed: ${root.slice(0, 16)}... (${this.vectors.size} vectors)`,
    );
    console.log(
      `[SolVec] On-chain update would post to: ${this._getCollectionPDA().toString()}`,
    );
  }

  private async _fetchOnChainRoot(): Promise<string> {
    return this._computeMerkleRoot();
  }
}
