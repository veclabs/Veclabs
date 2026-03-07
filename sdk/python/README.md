# solvec

Python SDK for VecLabs — decentralized vector memory for AI agents.

Rust HNSW search engine. Solana on-chain Merkle proofs. Pinecone-compatible API.

[![PyPI version](https://img.shields.io/pypi/v/solvec.svg)](https://pypi.org/project/solvec/)
[![Python](https://img.shields.io/pypi/pyversions/solvec.svg)](https://pypi.org/project/solvec/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/veclabs/veclabs/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-12%20passing-brightgreen.svg)](https://github.com/veclabs/veclabs)

```bash
pip install solvec
```

---

## What this is

A vector database SDK that stores your embeddings on decentralized storage, posts a cryptographic Merkle root to Solana after every write, and queries them through a Rust HNSW engine at sub-5ms p99.

If you are currently using Pinecone, the API is intentionally identical. Migration is three line changes.

---

## Quick start

```python
from solvec import SolVec

sv = SolVec(network="devnet")
collection = sv.collection("agent-memory", dimensions=768)

# Store vectors
collection.upsert([
    {
        "id": "mem_001",
        "values": [...],  # your embedding — any dimension
        "metadata": {"text": "User is Alex, building a fintech startup"}
    }
])

# Search by similarity
results = collection.query(vector=[...], top_k=5)

for match in results.matches:
    print(match.id, match.score, match.metadata)

# Verify collection integrity against on-chain Merkle root
proof = collection.verify()
print(proof.solana_explorer_url)
```

---

## Migrating from Pinecone

```python
# Before
from pinecone import Pinecone
pc = Pinecone(api_key="YOUR_KEY")
index = pc.Index("my-index")

# After — change 3 lines
from solvec import SolVec
sv = SolVec(wallet="~/.config/solana/id.json")
index = sv.collection("my-index")

# Everything below is identical
index.upsert([{"id": "vec_001", "values": [...], "metadata": {}}])
results = index.query(vector=[...], top_k=10)

# New — Pinecone has no equivalent
proof = index.verify()
print(proof.solana_explorer_url)
```

---

## API Reference

### `SolVec(network, wallet, rpc_url)`

Creates a new SolVec client.

```python
sv = SolVec(
    network="devnet",                          # "mainnet-beta" | "devnet" | "localnet"
    wallet="~/.config/solana/id.json",         # optional — required for on-chain writes
    rpc_url="https://...",                     # optional — custom RPC endpoint
)
```

### `sv.collection(name, dimensions, metric)`

Returns a `SolVecCollection` instance. Equivalent to Pinecone's `Index()`.

```python
collection = sv.collection(
    "my-collection",
    dimensions=768,      # default: 1536
    metric="cosine",     # "cosine" | "euclidean" | "dot" — default: "cosine"
)
```

---

### `collection.upsert(vectors)`

Insert or update vectors. If a record with the same `id` already exists, it is overwritten.

Accepts either a list of dicts or a list of `UpsertRecord` dataclasses.

```python
from solvec import UpsertRecord

# Dict style (matches Pinecone exactly)
collection.upsert([
    {
        "id": "vec_001",
        "values": [0.1, 0.2, ...],
        "metadata": {
            "text": "source text",
            "timestamp": 1709123456,
            "category": "memory"
        }
    }
])

# Dataclass style
collection.upsert([
    UpsertRecord(
        id="vec_001",
        values=[0.1, 0.2, ...],
        metadata={"text": "source text"}
    )
])

# Returns: UpsertResponse(upserted_count=1)
```

### `collection.query(vector, top_k, filter, include_metadata, include_values)`

Search for nearest neighbors by vector similarity.

```python
results = collection.query(
    vector=[0.1, 0.2, ...],      # required — query embedding
    top_k=10,                    # required — number of results
    filter={"category": "memory"},  # optional — metadata filter
    include_metadata=True,       # optional — default: True
    include_values=False,        # optional — default: False
)

# results.matches is a list of QueryMatch, sorted by score descending
for match in results.matches:
    print(match.id, match.score, match.metadata)
```

### `collection.delete(ids)`

Delete vectors by ID.

```python
collection.delete(["vec_001", "vec_002"])
```

### `collection.fetch(ids)`

Fetch specific vectors by ID.

```python
result = collection.fetch(["vec_001"])
print(result["vectors"]["vec_001"]["values"])
```

### `collection.describe_index_stats()`

Get collection statistics.

```python
stats = collection.describe_index_stats()
# CollectionStats(
#   vector_count=1000,
#   dimension=768,
#   metric=<DistanceMetric.COSINE: 'cosine'>,
#   name='my-collection',
#   merkle_root='a3f9b2...',
#   last_updated=1709123456,
#   is_frozen=False
# )
```

### `collection.verify()`

Verify collection integrity against the on-chain Merkle root.

```python
proof = collection.verify()
# VerificationResult(
#   verified=True,
#   on_chain_root='a3f9b2...',
#   local_root='a3f9b2...',
#   match=True,
#   vector_count=1000,
#   solana_explorer_url='https://explorer.solana.com/...',
#   timestamp=1709123456000
# )
```

---

## Integration examples

### LangChain

```python
from solvec import SolVec
from langchain_openai import OpenAIEmbeddings

sv = SolVec(network="mainnet-beta")
collection = sv.collection("langchain-docs", dimensions=1536)

embeddings = OpenAIEmbeddings()

# Store document embeddings
texts = ["VecLabs is a decentralized vector DB", "Built on Solana", "Rust HNSW core"]
vectors = embeddings.embed_documents(texts)

collection.upsert([
    {"id": f"doc_{i}", "values": v, "metadata": {"text": t}}
    for i, (v, t) in enumerate(zip(vectors, texts))
])

# Query
query_vector = embeddings.embed_query("What is VecLabs?")
results = collection.query(vector=query_vector, top_k=3)

for match in results.matches:
    print(f"{match.score:.3f} — {match.metadata['text']}")
```

### AI agent persistent memory

```python
from solvec import SolVec

sv = SolVec(network="mainnet-beta", wallet="~/.config/solana/id.json")
memory = sv.collection("agent-memory", dimensions=768)

def remember(text: str, embedding: list[float]) -> None:
    memory.upsert([{
        "id": f"mem_{int(time.time() * 1000)}",
        "values": embedding,
        "metadata": {"text": text, "timestamp": int(time.time())}
    }])

def recall(query_embedding: list[float], limit: int = 5) -> list[str]:
    results = memory.query(vector=query_embedding, top_k=limit)
    return [m.metadata.get("text", "") for m in results.matches]

def audit() -> None:
    proof = memory.verify()
    print(f"Memory verified: {proof.match}")
    print(f"On-chain proof: {proof.solana_explorer_url}")
```

### Metadata filtering

```python
collection.upsert([
    {"id": "a", "values": [...], "metadata": {"type": "fact", "source": "user"}},
    {"id": "b", "values": [...], "metadata": {"type": "memory", "source": "agent"}},
])

# Only return facts
results = collection.query(
    vector=[...],
    top_k=5,
    filter={"type": "fact"}
)
```

### Using dataclasses

```python
from solvec.types import DistanceMetric, UpsertRecord

sv = SolVec(network="devnet")
collection = sv.collection("typed-collection", dimensions=3, metric=DistanceMetric.EUCLIDEAN)

collection.upsert([
    UpsertRecord(id="a", values=[1.0, 0.0, 0.0], metadata={"label": "x-axis"}),
    UpsertRecord(id="b", values=[0.0, 1.0, 0.0], metadata={"label": "y-axis"}),
])

results = collection.query(vector=[1.0, 0.1, 0.0], top_k=1)
assert results.matches[0].id == "a"
```

---

## Current status

This is alpha software. The API surface is stable.

| Feature | Status |
|---|---|
| upsert / query / delete / fetch | Working |
| Cosine, euclidean, dot product | Working |
| Metadata filtering | Working |
| Merkle root computation | Working |
| verify() | Working (local computation) |
| Solana on-chain Merkle updates | In progress |
| Shadow Drive persistence | In progress — in-memory for now |

Vectors are currently stored in-memory. Persistent decentralized storage via Shadow Drive ships in v0.2.0.

---

## Requirements

- Python 3.10+
- No Solana wallet required for basic upsert/query
- Solana wallet required for on-chain verify() (coming in v0.2.0)

---

## Links

- Homepage: [veclabs.xyz](https://veclabs.xyz)
- GitHub: [github.com/veclabs/veclabs](https://github.com/veclabs/veclabs)
- npm: [@veclabs/solvec](https://www.npmjs.com/package/@veclabs/solvec)
- Live on Solana devnet: [explorer.solana.com](https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet)

---

## License

MIT