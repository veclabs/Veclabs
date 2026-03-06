# @veclabs/solvec

TypeScript SDK for VecLabs — decentralized vector memory for AI agents.

Rust HNSW search engine. Solana on-chain Merkle proofs. Pinecone-compatible API.

[![npm version](https://img.shields.io/npm/v/@veclabs/solvec.svg)](https://www.npmjs.com/package/@veclabs/solvec)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/veclabs/veclabs/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-9%20passing-brightgreen.svg)](https://github.com/veclabs/veclabs)

```bash
npm install @veclabs/solvec
```

---

## What this is

A vector database SDK that stores your embeddings on decentralized storage, posts a cryptographic Merkle root to Solana after every write, and queries them through a Rust HNSW engine at sub-5ms p99.

If you are currently using Pinecone, the API is intentionally identical. Migration is three line changes.

---

## Quick start

```typescript
import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ network: 'devnet' });
const collection = sv.collection('agent-memory', { dimensions: 768 });

// Store vectors
await collection.upsert([
  {
    id: 'mem_001',
    values: [...],  // your embedding — any dimension
    metadata: { text: 'User is Alex, building a fintech startup' }
  }
]);

// Search by similarity
const results = await collection.query({
  vector: [...],
  topK: 5
});

console.log(results.matches);
// [{ id: 'mem_001', score: 0.97, metadata: { text: '...' } }, ...]

// Verify collection integrity against on-chain Merkle root
const proof = await collection.verify();
console.log(proof.solanaExplorerUrl);
```

---

## Migrating from Pinecone

```typescript
// Before
import { Pinecone } from '@pinecone-database/pinecone';
const pc = new Pinecone({ apiKey: 'YOUR_KEY' });
const index = pc.index('my-index');

// After — change 3 lines
import { SolVec } from '@veclabs/solvec';
const sv = new SolVec({ network: 'mainnet-beta' });
const index = sv.collection('my-index');

// Everything below is identical
await index.upsert([{ id: 'vec_001', values: [...], metadata: {} }]);
const results = await index.query({ vector: [...], topK: 10 });

// New — Pinecone has no equivalent
const proof = await index.verify();
```

---

## API Reference

### `new SolVec(config)`

Creates a new SolVec client.

```typescript
const sv = new SolVec({
  network: 'devnet',          // 'mainnet-beta' | 'devnet' | 'localnet'
  walletPath: '~/.config/solana/id.json',  // optional — required for on-chain writes
  rpcUrl: 'https://...',      // optional — custom RPC endpoint
});
```

### `sv.collection(name, config?)`

Returns a `SolVecCollection` instance. Equivalent to Pinecone's `index()`.

```typescript
const collection = sv.collection('my-collection', {
  dimensions: 768,       // default: 1536
  metric: 'cosine',      // 'cosine' | 'euclidean' | 'dot' — default: 'cosine'
});
```

---

### `collection.upsert(records)`

Insert or update vectors. If a record with the same `id` already exists, it is overwritten.

```typescript
await collection.upsert([
  {
    id: 'vec_001',              // required — unique string identifier
    values: [0.1, 0.2, ...],   // required — float array, length must match dimensions
    metadata: {                 // optional — any JSON-serializable object
      text: 'source text',
      timestamp: Date.now(),
      category: 'memory'
    }
  }
]);
// Returns: { upsertedCount: 1 }
```

### `collection.query(options)`

Search for nearest neighbors by vector similarity.

```typescript
const results = await collection.query({
  vector: [0.1, 0.2, ...],   // required — query embedding
  topK: 10,                  // required — number of results
  filter: { category: 'memory' },  // optional — metadata filter
  includeMetadata: true,     // optional — default: true
  includeValues: false,      // optional — default: false
});

// results.matches is sorted by score descending
for (const match of results.matches) {
  console.log(match.id, match.score, match.metadata);
}
```

### `collection.delete(ids)`

Delete vectors by ID.

```typescript
await collection.delete(['vec_001', 'vec_002']);
```

### `collection.fetch(ids)`

Fetch specific vectors by ID.

```typescript
const result = await collection.fetch(['vec_001']);
console.log(result.vectors['vec_001'].values);
```

### `collection.describeIndexStats()`

Get collection statistics.

```typescript
const stats = await collection.describeIndexStats();
// {
//   vectorCount: 1000,
//   dimension: 768,
//   metric: 'cosine',
//   name: 'my-collection',
//   merkleRoot: 'a3f9b2...',
//   lastUpdated: 1709123456,
//   isFrozen: false
// }
```

### `collection.verify()`

Verify collection integrity against the on-chain Merkle root.

```typescript
const proof = await collection.verify();
// {
//   verified: true,
//   onChainRoot: 'a3f9b2...',
//   localRoot: 'a3f9b2...',
//   match: true,
//   vectorCount: 1000,
//   solanaExplorerUrl: 'https://explorer.solana.com/...',
//   timestamp: 1709123456000
// }
```

---

## Integration examples

### LangChain

```typescript
import { SolVec } from '@veclabs/solvec';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { VectorStore } from 'langchain/vectorstores/base';

// Use SolVec as a drop-in VectorStore (native integration coming soon)
const sv = new SolVec({ network: 'mainnet-beta' });
const collection = sv.collection('langchain-docs', { dimensions: 1536 });

// Store document embeddings
const embeddings = new OpenAIEmbeddings();
const vectors = await embeddings.embedDocuments(docs.map(d => d.pageContent));

await collection.upsert(
  vectors.map((values, i) => ({
    id: `doc_${i}`,
    values,
    metadata: { text: docs[i].pageContent, source: docs[i].metadata.source }
  }))
);

// Query
const queryVector = await embeddings.embedQuery('What is VecLabs?');
const results = await collection.query({ vector: queryVector, topK: 3 });
```

### AI agent persistent memory

```typescript
import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ network: 'mainnet-beta' });
const memory = sv.collection('agent-memory', { dimensions: 768 });

async function rememberFact(text: string, embedding: number[]) {
  await memory.upsert([{
    id: `mem_${Date.now()}`,
    values: embedding,
    metadata: { text, timestamp: Date.now() }
  }]);
}

async function recallRelevantFacts(queryEmbedding: number[], limit = 5) {
  const results = await memory.query({ vector: queryEmbedding, topK: limit });
  return results.matches.map(m => m.metadata?.text as string);
}

// Verify what the agent remembers is unmodified
async function auditMemory() {
  const proof = await memory.verify();
  console.log('Memory verified:', proof.match);
  console.log('On-chain proof:', proof.solanaExplorerUrl);
}
```

---

## Current status

This is alpha software. The API surface is stable.

| Feature | Status |
|---|---|
| upsert / query / delete / fetch | Working |
| Cosine, euclidean, dot product | Working |
| Merkle root computation | Working |
| verify() | Working (local computation) |
| Solana on-chain Merkle updates | In progress |
| Shadow Drive persistence | In progress — in-memory for now |
| WASM Rust HNSW bridge | In progress — JS fallback for now |

Vectors are currently stored in-memory. Persistent decentralized storage via Shadow Drive is in active development and ships in v0.2.0.

---

## Links

- Homepage: [veclabs.xyz](https://veclabs.xyz)
- GitHub: [github.com/veclabs/veclabs](https://github.com/veclabs/veclabs)
- PyPI: [pypi.org/project/solvec](https://pypi.org/project/solvec)
- Live on Solana devnet: [explorer.solana.com](https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet)

---

## License

MIT