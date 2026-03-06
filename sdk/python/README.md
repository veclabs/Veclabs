# SolVec Python SDK

Decentralized vector database for AI agents. Rust HNSW + Solana on-chain provenance.

## Installation

```bash
pip install solvec
```

## Quick Start

```python
from solvec import SolVec

sv = SolVec(network="devnet")
col = sv.collection("agent-memory", dimensions=1536)

col.upsert([
    {"id": "mem_001", "values": [...], "metadata": {"text": "User is Alex"}}
])

results = col.query(vector=[...], top_k=5)
```
