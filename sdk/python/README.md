# solvec - Python SDK for Recall by VecLabs

> Cryptographic memory layer for AI agents. Fast. Private. Verifiable on Solana.

[![PyPI version](https://badge.fury.io/py/solvec.svg)](https://pypi.org/project/solvec/)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Hosted Mode (Recommended)

```python
from solvec import SolVec

# Get your API key at app.veclabs.xyz
sv = SolVec(api_key="vl_live_...")
collection = sv.collection("agent-memory", dimensions=1536)

# All operations route to api.veclabs.xyz
collection.upsert([{
    "id": "mem_001",
    "values": embedding,
    "metadata": {"text": "User prefers dark mode"}
}])

results = collection.query(vector=query_embedding, top_k=5)
proof = collection.verify()
```

## Self-Hosted Mode

---

## Installation

```bash
pip install solvec

# With Solana verification (Phase 2)
pip install "solvec[solana]"

# With Shadow Drive (Phase 5)
pip install "solvec[shadow-drive]"

# Full install
pip install "solvec[all]"
```

---

## Quick Start

```python
from solvec import SolVec

sv = SolVec()
collection = sv.collection("agent-memory", dimensions=1536)

# Insert memories
collection.upsert([
    {"id": "mem_001", "values": embedding, "metadata": {"source": "conversation"}},
    {"id": "mem_002", "values": embedding2, "metadata": {"source": "document"}},
])

# Semantic search
response = collection.query(vector=query_embedding, top_k=5)
for match in response.matches:
    print(f"{match.id}: {match.score:.4f} - {match.metadata}")
```

---

## Phase 4: Encryption

```python
from solvec import SolVec, EncryptionConfig

sv = SolVec(
    encryption=EncryptionConfig(
        enabled=True,
        passphrase="your-secret-passphrase"
    )
)
collection = sv.collection("encrypted-memories", dimensions=1536)
# All vectors and metadata are encrypted at rest using AES-256-GCM
```

---

## Phase 2: Solana Verification

```python
from solvec import SolVec, SolanaConfig

sv = SolVec(
    solana=SolanaConfig(
        enabled=True,
        network="devnet",
        keypair="/path/to/keypair.json"
    )
)
collection = sv.collection("verified-memories", dimensions=1536)

# After upsert, Merkle root is posted to Solana asynchronously
collection.upsert([{"id": "mem_001", "values": embedding}])

# Verify integrity
result = collection.verify()
print(f"Tampered: {not result.verified}")
```

---

## Phase 5: Shadow Drive

```python
from solvec import SolVec, ShadowDriveConfig

sv = SolVec(
    shadow_drive=ShadowDriveConfig(
        enabled=True,
        keypair="/path/to/keypair.json",
        snapshot_interval=10,  # snapshot every 10 writes
    )
)
collection = sv.collection("persistent-memories", dimensions=1536)
```

---

## Phase 6: Memory Inspector

```python
from solvec import SolVec, InspectorQuery

sv = SolVec()
collection = sv.collection("agent-memory", dimensions=1536)

# Write some memories
collection.upsert([
    {"id": "mem_001", "values": embedding1, "metadata": {"type": "episodic"}},
    {"id": "mem_002", "values": embedding2, "metadata": {"type": "semantic"}},
])

# Get the inspector
inspector = collection.inspector()

# Fast collection stats
stats = inspector.stats()
print(f"Total: {stats.total_memories} memories")
print(f"Size: {stats.memory_usage_bytes} bytes")
print(f"Merkle root: {stats.current_merkle_root}")

# Filter memories
result = inspector.inspect(InspectorQuery(
    metadata_filter={"type": "episodic"},
    limit=20,
))
for record in result.memories:
    print(f"{record.id} - written at {record.written_at}ms")

# Get a single record
record = inspector.get("mem_001")
print(f"Vector dim: {len(record.vector)}")
print(f"Merkle root at write: {record.merkle_root_at_write}")

# Semantic search with full records
matches = inspector.search_with_records(query_vector, k=5)
for score, record in matches:
    print(f"{record.id}: {score:.4f}")

# Merkle history
history = inspector.merkle_history()
for entry in history:
    print(f"{entry.trigger} - {entry.memory_count_at_time} memories - {entry.root[:16]}...")

# Tamper detection
proof = inspector.verify()
print("All good" if proof["match"] else "TAMPERED!")
```

---

## API Reference

### `SolVec`

```python
SolVec(
    encryption: EncryptionConfig = None,
    solana: SolanaConfig = None,
    shadow_drive: ShadowDriveConfig = None,
)
```

| Method                                 | Description                       |
| -------------------------------------- | --------------------------------- |
| `collection(name, dimensions, metric)` | Get or create a named collection  |
| `list_collections()`                   | List all collection names         |
| `drop_collection(name)`                | Remove a collection from registry |

### `SolVecCollection`

| Method                         | Returns              | Description                    |
| ------------------------------ | -------------------- | ------------------------------ |
| `upsert(records)`              | `UpsertResponse`     | Insert or update vectors       |
| `query(vector, top_k, filter)` | `QueryResponse`      | Similarity search              |
| `delete(ids)`                  | `DeleteResponse`     | Delete by ID                   |
| `fetch(ids)`                   | `dict`               | Fetch by exact ID              |
| `describe_index_stats()`       | `CollectionStats`    | Basic statistics               |
| `verify()`                     | `VerificationResult` | Merkle root verification       |
| `inspector()`                  | `MemoryInspector`    | Get Memory Inspector (Phase 6) |

### `MemoryInspector`

| Method                           | Returns                            | Description              |
| -------------------------------- | ---------------------------------- | ------------------------ |
| `stats()`                        | `InspectorCollectionStats`         | O(1) collection stats    |
| `inspect(query)`                 | `InspectionResult`                 | Filtered memory list     |
| `get(id)`                        | `MemoryRecord \| None`             | Single record by ID      |
| `search_with_records(vector, k)` | `list[tuple[float, MemoryRecord]]` | Search with full records |
| `merkle_history()`               | `list[MerkleHistoryEntry]`         | Root change history      |
| `verify()`                       | `dict`                             | Tamper detection         |

---

## Running Tests

```bash
cd sdk/python
pip install -e ".[dev]"
pytest tests/ -v
```

Expected: **41 tests passing** - 12 collection, 8 encryption, 6 merkle, 11 inspector, 4 shadow drive.
