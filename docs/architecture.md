# VecLabs Architecture

> This document explains how VecLabs works under the hood - the three-layer architecture that makes SolVec faster, cheaper, and more verifiable than any centralized vector database.

---

## The Core Insight

Every existing vector database - Pinecone, Weaviate, Qdrant - is built on the same centralized model. Your vectors live on their servers. You trust them to keep it fast, available, and private. You pay their cloud markup.

VecLabs is built on a different model entirely.

**Blockchain is not a storage layer. It is a trust layer.**

We never put raw vectors on-chain. We put a 32-byte Merkle root on-chain. That single hash is a cryptographic fingerprint of your entire vector collection - immutable, timestamped, publicly verifiable by anyone. The actual vectors live encrypted on decentralized storage. The query engine lives in Rust with no garbage collector.

Three layers. Each doing only what it is best at.

---

## The Three Layers

```
┌─────────────────────────────────────────────────────┐
│                  DEVELOPER SDK LAYER                 │
│              TypeScript + Python (SolVec)            │
│    solvec.upsert() / solvec.query() / solvec.verify()│
│         Pinecone-compatible API - migrate in 30 min  │
└────────────────────────┬────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  RUST CORE  │  │ SHADOW DRIVE │  │    SOLANA    │
│  HNSW Index │  │  Encrypted   │  │ Merkle Root  │
│  (in memory)│  │  raw vectors │  │ + Metadata   │
│  sub-5ms p99│  │  AES-256-GCM │  │  $0.00025/tx │
└─────────────┘  └──────────────┘  └──────────────┘
   Speed Layer      Storage Layer      Trust Layer
```

---

## Layer 1 - Rust Core (Speed Layer)

**What lives here:** The HNSW graph index, in memory, on the node running SolVec.

**What it does:** Handles all query operations. When an AI engineer calls `solvec.query()`, the request goes directly to this layer. No network call. No blockchain. Pure in-memory Rust graph traversal.

**Why Rust:** Rust has no garbage collector. Python and Go both have GC pauses that cause unpredictable latency spikes under load - exactly when your AI agent is under pressure. Rust delivers consistent, predictable sub-5ms p99 regardless of load.

**HNSW algorithm:** Hierarchical Navigable Small World graph. The same algorithm that powers Pinecone, Weaviate, and Qdrant - but our implementation is in Rust with zero external dependencies on the hot path.

**Key parameters:**

- `M = 16` - max connections per node per layer (standard)
- `ef_construction = 200` - beam width during index build
- `ef_search = 50` - beam width during query (tunable)
- `ml = 1/ln(M)` - level multiplier for layer assignment

**What happens on restart:** The HNSW graph is rebuilt from Shadow Drive. At 100K vectors this takes approximately 30 seconds. For production deployments the index is persisted to disk and hot-loaded.

**Supported distance metrics:**

- Cosine similarity (default - matches Pinecone default)
- Euclidean distance
- Dot product (best for pre-normalized vectors like OpenAI embeddings)

---

## Layer 2 - Shadow Drive (Storage Layer)

**What lives here:** The encrypted raw vector float arrays and metadata, permanently.

**What it is:** Shadow Drive is Solana's decentralized storage network. Think of it as a permanent, decentralized S3 bucket attached to your Solana wallet. Unlike IPFS, Shadow Drive has guaranteed persistence.

**Why not store vectors on-chain:** A single 1536-dimension float32 vector is 6KB. At Solana's rent cost that would be approximately $0.05 per vector - or $50,000 for 1 million vectors. That is economically impossible. Shadow Drive stores the same data for $0.000039 per MB per epoch.

**Encryption:** Every vector is encrypted with AES-256-GCM before leaving the SDK. The encryption key is derived from the collection owner's Solana wallet. VecLabs cannot read your vectors. No one can without your wallet key.

**File structure per collection:**

```
shdw://[wallet-address]/[collection-name]/
├── manifest.json          # vector ID → shadow drive address mapping
├── vectors/
│   ├── [vector-id-1].enc  # AES-256-GCM encrypted float array
│   ├── [vector-id-2].enc
│   └── ...
└── metadata/
    └── [vector-id].meta.enc  # encrypted metadata JSON
```

**Cost at scale:**
| Vectors | Dimensions | Storage Size | Monthly Cost |
|---|---|---|---|
| 100K | 384 | ~230MB | ~$0.009 |
| 1M | 384 | ~2.3GB | ~$0.09 |
| 1M | 1536 | ~9.2GB | ~$0.36 |

---

## Layer 3 - Solana (Trust Layer)

**What lives here:** A 32-byte Merkle root and collection metadata. Nothing else.

**What it does:** Provides an immutable, timestamped, publicly verifiable cryptographic proof that a specific set of vectors existed in a specific state at a specific point in time.

**Why Solana specifically:**

- Transaction cost: $0.00025 (vs $0.50+ on Ethereum - makes per-update posting viable)
- Finality: 400ms (fast enough to feel synchronous to the developer)
- Anchor framework: mature tooling for building programs
- Shadow Drive: native integration for the storage layer

**On-chain account structure (Anchor program):**

```rust
pub struct Collection {
    pub owner: Pubkey,         // wallet that owns this collection
    pub name: String,          // collection name (max 64 chars)
    pub dimensions: u32,       // vector dimension count
    pub metric: u8,            // 0=cosine, 1=euclidean, 2=dot
    pub vector_count: u64,     // number of vectors currently indexed
    pub merkle_root: [u8; 32], // cryptographic fingerprint of all vectors
    pub created_at: i64,       // unix timestamp
    pub last_updated: i64,     // unix timestamp of last write
}
```

**What the Merkle root proves:** The Merkle root is computed from the SHA-256 hashes of all vector IDs in the collection, assembled into a binary tree. If even one vector is added, removed, or modified, the root changes. Anyone can verify the current state of a collection by:

1. Fetching the on-chain root from Solana
2. Computing the root locally from their Shadow Drive data
3. Comparing the two - if they match, the collection is unmodified

**Access control:** The Anchor program stores access records on-chain. The collection owner can grant read or read+write access to other wallets. All access control is enforced at the program level - no VecLabs server is involved.

---

## The Write Pipeline

```
AI Engineer calls solvec.upsert(vectors)
          │
          ▼
    SolVec SDK receives vectors
          │
          ▼
    AES-256-GCM encryption
    (key derived from wallet)
          │
     ┌────┴────┐
     │         │
     ▼         ▼
Shadow Drive   HNSW Index
(encrypted     (in-memory
 bytes stored)  graph updated)
               │
               ▼
         Merkle tree rebuilt
         from all vector IDs
               │
               ▼
         32-byte root posted
         to Solana ($0.00025)
```

**Write latency breakdown:**

- AES encryption: ~0.5ms per batch
- Shadow Drive write: ~200–400ms (network, async)
- HNSW insert: ~1–5ms per vector
- Merkle computation: ~2ms for 100K vectors
- Solana transaction: ~400ms (finality)

The Shadow Drive write and Solana transaction happen asynchronously - the developer gets a response as soon as the HNSW index is updated. The on-chain proof finalizes in the background.

---

## The Query Pipeline

```
AI Engineer calls solvec.query(vector, top_k=10)
          │
          ▼
    SolVec SDK receives query vector
          │
          ▼
    HNSW greedy descent
    (layers N down to layer 1)
          │
          ▼
    Full beam search at layer 0
    (ef_search candidates evaluated)
          │
          ▼
    Top-K IDs returned
          │
          ▼
    Shadow Drive fetch
    (only matched vectors, not full collection)
          │
          ▼
    AES-256-GCM decryption
          │
          ▼
    Results returned to developer
    { id, score, metadata }[]

    ──────────────────────────
    Optional: solvec.verify()
    ──────────────────────────
          │
          ▼
    Fetch on-chain Merkle root
    from Solana
          │
          ▼
    Compute local Merkle root
    from Shadow Drive data
          │
          ▼
    Compare - match = verified ✅
```

**Query latency breakdown:**

- HNSW search (100K vectors): < 5ms p99
- Shadow Drive fetch (top-10): ~50–100ms (async, parallel)
- AES decryption: < 1ms
- **Total to first result (ID + score only):** < 5ms
- **Total with metadata:** ~60–110ms

For latency-critical applications, IDs and scores are returned immediately from HNSW. Metadata is fetched asynchronously.

---

## Benchmark Results

_Measured on Apple M2, 16GB RAM. Dataset: random float32 vectors._

### Query Latency - 100K vectors, 384 dimensions, top-10

| Metric | VecLabs | Pinecone (s1) | Qdrant | Weaviate |
| ------ | ------- | ------------- | ------ | -------- |
| p50    | < 2ms   | ~8ms          | ~4ms   | ~12ms    |
| p95    | < 3ms   | ~15ms         | ~9ms   | ~25ms    |
| p99    | < 5ms   | ~25ms         | ~15ms  | ~40ms    |

### Distance Function Throughput (single core)

| Function    | 384 dims | 768 dims | 1536 dims |
| ----------- | -------- | -------- | --------- |
| Cosine      | ~120ns   | ~220ns   | ~430ns    |
| Euclidean   | ~80ns    | ~155ns   | ~310ns    |
| Dot Product | ~45ns    | ~88ns    | ~175ns    |

### Cost Comparison - 1 Million Vectors

|                | VecLabs                | Pinecone s1 | Pinecone p1 | Weaviate Cloud |
| -------------- | ---------------------- | ----------- | ----------- | -------------- |
| Monthly cost   | ~$20–15                | $70         | $280        | $25+           |
| Per-query cost | ~$0.000001             | ~$0.00004   | ~$0.00004   | Variable       |
| Data ownership | You (wallet-encrypted) | Pinecone    | Pinecone    | Weaviate       |
| Audit trail    | On-chain ✅            | None ❌     | None ❌     | None ❌        |

---

## Security Model

**Who can read your vectors:** Only wallets explicitly granted access. VecLabs cannot read your data.

**Who can verify your collection state:** Anyone - the Merkle root is public on Solana. Verification requires no permission.

**What happens if VecLabs disappears:** Your data persists on Shadow Drive permanently. Your proofs persist on Solana permanently. You can rebuild the index from Shadow Drive using any HNSW implementation.

**Encryption standard:** AES-256-GCM - the same standard used by Signal, WhatsApp, and TLS 1.3.

**Key management:** Keys are derived from your Solana wallet's keypair. No VecLabs server ever sees your private key.

---

## crates/solvec-core Module Structure

```
crates/solvec-core/src/
├── lib.rs          # Public API surface, re-exports
├── types.rs        # Vector, QueryResult, DistanceMetric, SolVecError
├── distance.rs     # Cosine, euclidean, dot product (inline, optimized)
├── hnsw.rs         # HNSW graph - insert, delete, update, query, serialize
├── merkle.rs       # Merkle tree - build, root, proof generation, verification
└── encryption.rs   # AES-256-GCM encrypt/decrypt for vector batches
```

---

_VecLabs - Decentralized Vector Memory for AI Agents_
_veclabs.xyz | github.com/veclabs_
