import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
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
} from './types';
import { HNSWManager } from './hnsw';
import { AnchorClient } from './anchor-client';
import { computeMerkleRootFromIds } from './merkle';

export class SolVecCollection {
  private name: string;
  private dimensions: number;
  private metric: DistanceMetric;
  private network: Network;
  private hnsw: HNSWManager;
  private anchorClient: AnchorClient;
  private wallet?: Keypair;
  private initialized = false;
  private lastTxSignature?: string;
  private lastExplorerUrl?: string;

  constructor(
    name: string,
    config: CollectionConfig,
    connection: Connection,
    network: Network,
    wallet?: Keypair
  ) {
    this.name = name;
    this.dimensions = config.dimensions ?? 1536;
    this.metric = config.metric ?? 'cosine';
    this.network = network;
    this.wallet = wallet;
    this.hnsw = new HNSWManager(this.metric);
    this.anchorClient = new AnchorClient(network, wallet);
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await this.hnsw.initialize();
    this._loadFromDisk();
    this.initialized = true;
  }

  private _deriveKey(): Buffer {
    const passphrase = process.env.VECLABS_PERSIST_KEY ?? 'dev-default-key-veclabs-phase4';
    return crypto.createHash('sha256').update(passphrase).digest();
  }

  private _getDbPath(): string {
    return path.join(process.cwd(), '.veclabs', `${this.name}.db`);
  }

  private _persist(): void {
    const payload = JSON.stringify({
      version: 1,
      name: this.name,
      dimensions: this.dimensions,
      metric: this.metric,
      vectors: this.hnsw.getAllEntries(),
    });

    const key = this._deriveKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const dbPath = this._getDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, Buffer.concat([iv, authTag, encrypted]));
  }

  private _loadFromDisk(): void {
    const dbPath = this._getDbPath();
    if (!fs.existsSync(dbPath)) return;

    try {
      const key = this._deriveKey();
      const file = fs.readFileSync(dbPath);
      const iv = file.slice(0, 12);
      const authTag = file.slice(12, 28);
      const ciphertext = file.slice(28);

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

      const data = JSON.parse(decrypted.toString('utf8')) as {
        vectors: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>;
      };
      for (const entry of data.vectors) {
        this.hnsw.insert(entry.id, entry.values, entry.metadata ?? {});
      }

      console.log(`[SolVec] Loaded ${data.vectors.length} vectors from disk for '${this.name}'`);
    } catch (e) {
      console.warn('[SolVec] Failed to load from disk:', e);
    }
  }

  async upsert(records: UpsertRecord[]): Promise<UpsertResponse> {
    await this.ensureInitialized();
    if (records.length === 0) return { upsertedCount: 0 };

    for (const record of records) {
      if (record.values.length !== this.dimensions) {
        throw new Error(
          `Dimension mismatch for id "${record.id}": ` +
            `expected ${this.dimensions}, got ${record.values.length}`
        );
      }
      this.hnsw.insert(record.id, record.values, record.metadata ?? {});
    }

    this._persist();

    if (this.wallet) {
      await this._postOnChainRoot();
    }

    console.log(
      `[SolVec] Upserted ${records.length} vectors to collection '${this.name}'`
    );

    return { upsertedCount: records.length };
  }

  async query(options: QueryOptions): Promise<QueryResponse> {
    await this.ensureInitialized();

    const { vector, topK, includeMetadata = true, includeValues = false } = options;

    if (vector.length !== this.dimensions) {
      throw new Error(
        `Query dimension mismatch: expected ${this.dimensions}, got ${vector.length}`
      );
    }

    if (this.hnsw.isEmpty()) {
      return { matches: [], namespace: this.name };
    }

    const results = this.hnsw.query(vector, topK);

    const matches: QueryMatch[] = results.map((r) => ({
      id: r.id,
      score: r.score,
      ...(includeMetadata ? { metadata: r.metadata } : {}),
      ...(includeValues ? { values: this.hnsw.getValues(r.id) ?? [] } : {}),
    }));

    return { matches, namespace: this.name };
  }

  async delete(ids: string[]): Promise<void> {
    await this.ensureInitialized();

    for (const id of ids) {
      this.hnsw.delete(id);
    }

    this._persist();

    if (this.wallet && ids.length > 0) {
      await this._postOnChainRoot();
    }

    console.log(`[SolVec] Deleted ${ids.length} vectors from '${this.name}'`);
  }

  async describeIndexStats(): Promise<CollectionStats> {
    await this.ensureInitialized();
    const ids = this.hnsw.getAllIds();
    const merkleRoot = computeMerkleRootFromIds(ids);

    return {
      vectorCount: this.hnsw.size(),
      dimension: this.dimensions,
      metric: this.metric,
      name: this.name,
      merkleRoot,
      lastUpdated: Date.now(),
      isFrozen: false,
    };
  }

  async verify(): Promise<VerificationResult> {
    await this.ensureInitialized();

    const ids = this.hnsw.getAllIds();
    const localRoot = computeMerkleRootFromIds(ids);

    const cluster = this.network === 'devnet' ? '?cluster=devnet' : '';
    const collectionAddress = this.wallet
      ? this.anchorClient
          .getCollectionPDA(this.wallet.publicKey, this.name)
          .toString()
      : '8iLpyegDt8Vx2Q56kdvDJYpmnkTD2VDZvHXXead75Fm7';

    if (this.wallet) {
      try {
        const onChainData = await this.anchorClient.fetchOnChainRoot(
          this.wallet.publicKey,
          this.name
        );

        const match = localRoot === onChainData.root;

        return {
          verified: match,
          onChainRoot: onChainData.root,
          localRoot,
          match,
          vectorCount: this.hnsw.size(),
          solanaExplorerUrl: `https://explorer.solana.com/address/${collectionAddress}${cluster}`,
          timestamp: Date.now(),
        };
      } catch (e) {
        console.warn('[SolVec] Could not fetch on-chain root:', e);
      }
    }

    return {
      verified: false,
      onChainRoot: 'wallet-required',
      localRoot,
      match: false,
      vectorCount: this.hnsw.size(),
      solanaExplorerUrl: `https://explorer.solana.com/address/${collectionAddress}${cluster}`,
      timestamp: Date.now(),
    };
  }

  getLastTxUrl(): string | undefined {
    return this.lastExplorerUrl;
  }

  private async _postOnChainRoot(): Promise<void> {
    if (!this.wallet) return;

    const ids = this.hnsw.getAllIds();
    const merkleRoot = computeMerkleRootFromIds(ids);
    const vectorCount = this.hnsw.size();

    try {
      const result = await this.anchorClient.updateMerkleRoot(
        this.name,
        merkleRoot,
        vectorCount
      );
      this.lastTxSignature = result.signature;
      this.lastExplorerUrl = result.explorerUrl;
    } catch (e: any) {
      if (
        e?.message?.includes('not found on-chain') ||
        e?.message?.includes('AccountNotInitialized')
      ) {
        console.log('[SolVec] Creating collection on-chain first...');
        await this.anchorClient.createCollection(
          this.name,
          this.dimensions,
          0
        );
        const result = await this.anchorClient.updateMerkleRoot(
          this.name,
          merkleRoot,
          vectorCount
        );
        this.lastTxSignature = result.signature;
        this.lastExplorerUrl = result.explorerUrl;
      } else {
        console.warn('[SolVec] On-chain root update failed:', e);
      }
    }
  }
}
