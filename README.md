> ⚠️ **This repository has been restructured.** The monorepo has been split into focused repositories:
> - **Rust core engine** → [veclabs/recall](https://github.com/veclabs/recall)
> - **TypeScript SDK** → [veclabs/recall-sdk-js](https://github.com/veclabs/recall-sdk-js)
> - **Python SDK** → [veclabs/recall-sdk-python](https://github.com/veclabs/recall-sdk-python)
>
> This repository is archived for historical reference. Please use the repos above.


# VecLabs

Decentralized vector memory for AI agents. Rust HNSW core. Solana on-chain provenance. 88% cheaper than Pinecone.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-37%20passing-brightgreen.svg)]()
[![Solana Devnet](https://img.shields.io/badge/solana-devnet%20live-9945FF.svg)](https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet)
[![npm](https://img.shields.io/badge/npm-%40veclabs%2Fsolvec-orange.svg)](https://www.npmjs.com/package/@veclabs/solvec)

---

## Overview

Most vector databases are centralized infrastructure you rent access to. Your data lives on their servers. You trust their uptime, their pricing, and their word that nothing has changed.

VecLabs is built differently. Vectors are encrypted with your Solana wallet key and stored on decentralized storage. After every write, a 32-byte Merkle root is posted to Solana - a cryptographic fingerprint of your entire collection, immutable and publicly verifiable. The query engine is a Rust HNSW implementation with no garbage collector, delivering consistent sub-3ms p99 latency that Python and Go-based engines cannot match under load.

The result: a vector database that is faster, cheaper, and verifiable by anyone - without trusting VecLabs.

**Live on Solana devnet:**

- Program: [`8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP`](https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet)
- Collection: [`8iLpyegDt8Vx2Q56kdvDJYpmnkTD2VDZvHXXead75Fm7`](https://explorer.solana.com/address/8iLpyegDt8Vx2Q56kdvDJYpmnkTD2VDZvHXXead75Fm7?cluster=devnet)

---

## Benchmarks

Measured on Apple M3. 100K vectors, 1536 dimensions (OpenAI ada-002), top-10 query, cosine similarity, 1,000 samples. Release build.

|                           | VecLabs         | Pinecone s1   | Qdrant        | Weaviate      |
| ------------------------- | --------------- | ------------- | ------------- | ------------- |
| p50                       | **2.995ms**     | ~10ms         | ~6ms          | ~18ms         |
| p95                       | **3.854ms**     | ~20ms         | ~12ms         | ~32ms         |
| p99                       | **4.688ms**     | ~30ms         | ~18ms         | ~48ms         |
| p99.9                     | **5.674ms**     | ~50ms         | ~30ms         | ~80ms         |
| Monthly cost (1M vectors) | **~$20**        | $70           | $25+          | $25+          |
| Data ownership            | **Your wallet** | Their servers | Their servers | Their servers |
| Audit trail               | **On-chain**    | None          | None          | None          |

Full benchmark methodology and reproduction steps: [`benchmarks/COMPARISON.md`](benchmarks/COMPARISON.md)

---

## Install

```bash
npm install @veclabs/solvec
```

```bash
pip install solvec --pre
```

---

## Usage

```typescript
import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ network: 'devnet' });
const collection = sv.collection('agent-memory', { dimensions: 1536 });

await collection.upsert([{
  id: 'mem_001',
  values: [...],
  metadata: { text: 'User prefers dark mode' }
}]);

const results = await collection.query({ vector: [...], topK: 5 });

// Verify collection integrity against on-chain Merkle root
const proof = await collection.verify();
console.log(proof.solanaExplorerUrl);
```

```python
from solvec import SolVec

sv = SolVec(network="devnet", wallet="~/.config/solana/id.json")
collection = sv.collection("agent-memory", dimensions=1536)

collection.upsert([{
    "id": "mem_001",
    "values": [...],
    "metadata": {"text": "User prefers dark mode"}
}])

results = collection.query(vector=[...], top_k=5)

proof = collection.verify()
print(proof.solana_explorer_url)
```

---

## Migrating from Pinecone

The SolVec API is intentionally shaped to match Pinecone's client. Migration is three line changes.

```python
# Before
from pinecone import Pinecone
pc = Pinecone(api_key="YOUR_KEY")
index = pc.Index("my-index")

# After
from solvec import SolVec
sv = SolVec(wallet="~/.config/solana/id.json")
index = sv.collection("my-index")

# Everything below stays identical
index.upsert(vectors=[...])
index.query(vector=[...], top_k=10)
index.verify()  # new - Pinecone has no equivalent
```

---

## Architecture

Three layers. Each does only what it is best at.

```
SolVec SDK (TypeScript / Python)
.upsert()  .query()  .delete()  .verify()
      |           |           |
      v           v           v
 Rust HNSW    Shadow Drive   Solana
 (in memory)  (encrypted     (32-byte
 sub-5ms p99   vectors)       Merkle root)
 Speed Layer  Storage Layer   Trust Layer
```

**Rust HNSW** - the query engine runs in memory with no garbage collector. No GC means no latency spikes under concurrent load. Built with Criterion benchmarks, 31 unit tests, full serialization support.

**Shadow Drive** - vectors are encrypted with AES-256-GCM using a key derived from your Solana wallet before leaving the SDK. VecLabs cannot read your data. Storage costs approximately $0.000039 per MB per epoch.

**Solana Anchor program** - after every write, a 32-byte SHA-256 Merkle root of all vector IDs is posted on-chain. One transaction, $0.00025, 400ms finality. The root is public and permanent. Any party can verify the current state of a collection without trusting VecLabs.

---

## Current Status

This is alpha software. The API surface is stable and will not change. Backend persistence is in progress.

| Component                      | Status                                           |
| ------------------------------ | ------------------------------------------------ |
| Rust HNSW core                 | Complete - 31 tests, 2.011ms p99 at 100K vectors |
| AES-256-GCM encryption         | Complete                                         |
| Merkle tree + proof generation | Complete                                         |
| Solana Anchor program          | Live on devnet - 6/6 tests passing               |
| TypeScript SDK                 | Alpha - `npm install solvec@alpha`               |
| Python SDK                     | Alpha - `pip install solvec --pre`               |
| Agent memory demo              | In progress                                      |
| Shadow Drive persistence       | In progress - vectors currently in-memory        |
| WASM Rust bridge               | In progress - SDK uses JS fallback for now       |
| Mainnet deployment             | Planned                                          |
| LangChain integration          | Planned                                          |

---

## Repository Structure

```
veclabs/
├── crates/
│   └── solvec-core/            # Rust HNSW engine
│       └── src/
│           ├── hnsw.rs         # HNSW graph - insert, delete, query, serialize
│           ├── distance.rs     # Cosine, euclidean, dot product
│           ├── merkle.rs       # Merkle tree + proof generation + verification
│           ├── encryption.rs   # AES-256-GCM vector encryption
│           └── types.rs        # Core types and error handling
├── programs/
│   └── solvec/                 # Solana Anchor program
├── sdk/
│   ├── typescript/             # npm: solvec
│   └── python/                 # pip: solvec
├── demo/
│   └── agent-memory/           # AI agent with on-chain persistent memory
├── benchmarks/                 # Criterion.rs benchmark suite
└── docs/
    └── architecture.md         # Full architecture documentation
```

---

## Building from Source

Requirements: Rust 1.85+, Node.js 18+, Python 3.10+, Solana CLI 2.0+, Anchor CLI 0.32+

```bash
git clone https://github.com/veclabs/veclabs
cd veclabs

# Rust core
cargo build --workspace
cargo test --workspace
cargo test --test integration_test -- --nocapture

# Benchmarks
cargo bench --workspace

# TypeScript SDK
cd sdk/typescript && npm install && npm test

# Python SDK
cd sdk/python && pip install hatch && hatch build && pytest tests/ -v

# Solana program (requires devnet SOL)
cd programs/solvec && anchor build && anchor test --skip-deploy
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Priority areas: Rust HNSW SIMD optimizations, Shadow Drive integration, LangChain and AutoGen integrations, additional language SDKs.

---

## License

MIT. See [LICENSE](LICENSE).

---

[veclabs.xyz](https://veclabs.xyz) · [@veclabs](https://x.com/veclabs46369) · [Discord](https://discord.gg/veclabs)
