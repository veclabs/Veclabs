export type Network = "mainnet-beta" | "devnet" | "localnet";

export type DistanceMetric = "cosine" | "euclidean" | "dot";

export interface SolVecConfig {
  network: Network;
  walletPath?: string;
  rpcUrl?: string;
  shadowDrive?: boolean;
}

export interface UpsertRecord {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface QueryOptions {
  vector: number[];
  topK: number;
  filter?: Record<string, unknown>;
  includeMetadata?: boolean;
  includeValues?: boolean;
}

export interface QueryMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
  values?: number[];
}

export interface QueryResponse {
  matches: QueryMatch[];
  namespace: string;
}

export interface EncryptionConfig {
  enabled: boolean;
  passphrase?: string;
  salt?: Buffer;
}

export interface SolanaConfig {
  enabled: boolean;
  network: 'devnet' | 'mainnet-beta' | 'localnet';
  programId: string;
  keypair?: string;
  asyncPost: boolean;
  collectionPda?: string;
}

export interface ShadowDriveConfig {
  enabled: boolean;
  keypair?: string;
  storageAccount?: string;
  snapshotInterval: number;
  deltaOnly: boolean;
}

export interface UpsertResponse {
  upsertedCount: number;
  merkleRoot: string;
}

export interface DeleteResponse {
  deletedCount: number;
  merkleRoot: string;
}

export interface FetchResponse {
  vectors: Record<string, QueryMatch>;
}

export interface CollectionStats {
  vectorCount: number;
  dimension: number;
  metric: DistanceMetric;
  name: string;
  merkleRoot: string;
  lastUpdated: number;
  isFrozen: boolean;
}

export interface VerificationResult {
  verified: boolean;
  onChainRoot: string;
  localRoot: string;
  match: boolean;
  vectorCount: number;
  solanaExplorerUrl: string;
  timestamp: number;
}

export interface CollectionConfig {
  dimensions?: number;
  metric?: DistanceMetric;
}
