# VecLabs Python SDK — Complete Rebuild Cursor Prompt
## `sdk/python/` — Full Phase Parity with TypeScript SDK

---

## CONTEXT — READ THIS ENTIRE FILE BEFORE WRITING A SINGLE LINE

You are rebuilding the VecLabs Python SDK (`sdk/python/`) from Phase 1 through Phase 6,
bringing it to complete parity with the TypeScript SDK (`sdk/typescript/`).

The Python SDK currently sits at Phase 4/5 parity with a version mismatch and zero
inspector functionality. This prompt rebuilds it to full Phase 6 parity while also
properly connecting it to:

- The Rust WASM core via `solvec-core`
- AES-256-GCM encryption (Phase 4)
- Solana Merkle root verification (Phase 2)
- Shadow Drive integration (Phase 5)
- Memory Inspector (Phase 6)
- Reserved GraphRAG fields (Phase 10 prep)

Read these files FIRST before writing anything:

```
crates/solvec-core/src/hnsw.rs
crates/solvec-core/src/inspector.rs
crates/solvec-core/src/merkle.rs
crates/solvec-core/src/lib.rs
sdk/typescript/src/index.ts
sdk/typescript/src/store.ts
sdk/typescript/src/collection.ts
sdk/typescript/src/inspector.ts
sdk/typescript/src/shadow-drive.ts
sdk/python/src/solvec/__init__.py
sdk/python/src/solvec/client.py
sdk/python/src/solvec/collection.py
sdk/python/src/solvec/types.py
sdk/python/tests/test_collection.py
```

---

## BRANCH

```bash
git checkout main
git pull origin main
git checkout -b feat/python-sdk-phase6-parity
```

All work goes on this branch. Do NOT commit. Report back when done.

Commit prefix when you do commit: `feat(python-sdk):`

---

## PART 0 — PROJECT STRUCTURE TARGET

The final `sdk/python/` directory must look exactly like this:

```
sdk/python/
├── pyproject.toml
├── README.md
├── .gitignore
├── src/
│   └── solvec/
│       ├── __init__.py          ← version + all exports
│       ├── client.py            ← SolVec main client
│       ├── collection.py        ← SolVecCollection (core operations)
│       ├── inspector.py         ← MemoryInspector + all inspector types
│       ├── encryption.py        ← AES-256-GCM encrypt/decrypt helpers
│       ├── merkle.py            ← Merkle root computation + Solana sync
│       ├── shadow_drive.py      ← Shadow Drive async upload integration
│       └── types.py             ← all shared dataclasses and enums
└── tests/
    ├── __init__.py
    ├── test_collection.py       ← existing 12 tests (do NOT break)
    ├── test_encryption.py       ← new: 8 AES-256-GCM tests
    ├── test_merkle.py           ← new: 6 Merkle tests
    ├── test_inspector.py        ← new: 11 inspector tests
    └── test_shadow_drive.py     ← new: 4 shadow drive tests (mocked)
```

---

## PART 1 — VERSION FIX (DO THIS FIRST)

### `pyproject.toml`

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "solvec"
version = "0.1.0a7"
description = "Python SDK for Recall by VecLabs — cryptographic memory layer for AI agents"
readme = "README.md"
requires-python = ">=3.11"
license = { text = "MIT" }
authors = [
  { name = "Dhir Katre", email = "dhirkatre@gmail.com" }
]
keywords = [
  "vector-database", "ai-memory", "solana", "recall",
  "hnsw", "embeddings", "cryptographic", "merkle"
]
classifiers = [
  "Development Status :: 3 - Alpha",
  "Intended Audience :: Developers",
  "License :: OSI Approved :: MIT License",
  "Programming Language :: Python :: 3.11",
  "Programming Language :: Python :: 3.12",
  "Topic :: Scientific/Engineering :: Artificial Intelligence",
  "Topic :: Database",
]
dependencies = [
  "httpx>=0.27.0",
  "cryptography>=42.0.0",
  "pynacl>=1.5.0",
  "base58>=2.1.1",
]

[project.optional-dependencies]
solana = [
  "solders>=0.21.0",
  "solana>=0.34.0",
]
shadow-drive = [
  "solders>=0.21.0",
  "solana>=0.34.0",
  "aiohttp>=3.9.0",
]
dev = [
  "pytest>=8.0.0",
  "pytest-asyncio>=0.23.0",
  "pytest-cov>=5.0.0",
  "ruff>=0.4.0",
]
all = ["solvec[solana,shadow-drive,dev]"]

[project.urls]
Homepage = "https://veclabs.xyz"
Documentation = "https://docs.veclabs.xyz"
Repository = "https://github.com/veclabs/veclabs"
Issues = "https://github.com/veclabs/veclabs/issues"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### `src/solvec/__init__.py`

```python
"""
solvec — Python SDK for Recall by VecLabs.

Cryptographic memory layer for AI agents.
Fast. Private. Verifiable on Solana.

Usage:
    from solvec import SolVec, MemoryInspector

    sv = SolVec()
    collection = sv.collection("agent-memory", dimensions=1536)
    collection.upsert([{"id": "mem_001", "values": embedding, "metadata": {...}}])

    inspector = collection.inspector()
    stats = inspector.stats()
    proof = inspector.verify()
"""

__version__ = "0.1.0a7"
__author__ = "Dhir Katre"
__license__ = "MIT"

from .client import SolVec
from .collection import SolVecCollection
from .inspector import (
    MemoryInspector,
    MemoryRecord,
    InspectorCollectionStats,
    InspectorQuery,
    InspectionResult,
    MerkleHistoryEntry,
)
from .types import (
    DistanceMetric,
    UpsertRecord,
    QueryMatch,
    QueryResponse,
    UpsertResponse,
    CollectionStats,
    VerificationResult,
    DeleteResponse,
    FetchResponse,
    EncryptionConfig,
    SolanaConfig,
    ShadowDriveConfig,
)

__all__ = [
    # Client
    "SolVec",
    "SolVecCollection",
    # Inspector
    "MemoryInspector",
    "MemoryRecord",
    "InspectorCollectionStats",
    "InspectorQuery",
    "InspectionResult",
    "MerkleHistoryEntry",
    # Types
    "DistanceMetric",
    "UpsertRecord",
    "QueryMatch",
    "QueryResponse",
    "UpsertResponse",
    "CollectionStats",
    "VerificationResult",
    "DeleteResponse",
    "FetchResponse",
    "EncryptionConfig",
    "SolanaConfig",
    "ShadowDriveConfig",
]
```

---

## PART 2 — TYPES (Complete Rebuild)

### `src/solvec/types.py`

Replace the entire file with the following. Do not lose any existing types —
extend them.

```python
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Any


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class DistanceMetric(str, Enum):
    """Vector similarity metric used for nearest-neighbor search."""
    COSINE = "cosine"
    EUCLIDEAN = "euclidean"
    DOT = "dot_product"


# ─────────────────────────────────────────────
# Config types
# ─────────────────────────────────────────────

@dataclass
class EncryptionConfig:
    """
    AES-256-GCM encryption configuration.

    When enabled, all vectors and metadata are encrypted at rest.
    The key is derived from the passphrase using PBKDF2-HMAC-SHA256.
    Zero plaintext is ever written to disk.

    Phase 4 feature.
    """
    enabled: bool = False
    passphrase: Optional[str] = None
    # Salt is generated once per collection and stored alongside encrypted data.
    # Never store salt separately — it travels with the ciphertext.
    salt: Optional[bytes] = None


@dataclass
class SolanaConfig:
    """
    Solana on-chain Merkle root verification configuration.

    When enabled, a SHA-256 Merkle root is posted to the Recall Anchor
    program after every write operation.

    Phase 2 feature.
    """
    enabled: bool = False
    network: str = "devnet"  # "devnet" | "mainnet-beta" | "localnet"
    program_id: str = "8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP"
    # Path to keypair JSON file OR base58-encoded private key string.
    # Loaded at runtime — never hardcoded.
    keypair: Optional[str] = None
    # Async, non-blocking. Your app never waits for Solana.
    async_post: bool = True
    # Collection PDA address (derived on first use)
    collection_pda: Optional[str] = None


@dataclass
class ShadowDriveConfig:
    """
    Solana Shadow Drive decentralized storage configuration.

    When enabled, encrypted vector snapshots are uploaded to Shadow Drive
    after every write batch. Uses a headless wallet adapter — no manual
    approval required.

    Phase 5 feature.
    """
    enabled: bool = False
    # Path to keypair JSON OR base58-encoded private key string.
    keypair: Optional[str] = None
    # Storage account address (created on first use if not provided)
    storage_account: Optional[str] = None
    # How often to snapshot (every N writes). Default: 10.
    snapshot_interval: int = 10
    # Upload deltas only (not full collection). Recommended for large collections.
    delta_only: bool = True


# ─────────────────────────────────────────────
# Operation request/response types
# ─────────────────────────────────────────────

@dataclass
class UpsertRecord:
    """A single vector record to insert or update."""
    id: str
    values: list[float]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class QueryMatch:
    """A single result from a similarity search."""
    id: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)
    # Optionally returned when fetch_vectors=True
    values: Optional[list[float]] = None


@dataclass
class QueryResponse:
    """Response from a similarity search."""
    matches: list[QueryMatch]
    namespace: str = ""


@dataclass
class UpsertResponse:
    """Response from an upsert operation."""
    upserted_count: int
    # Merkle root after this write (empty string if Solana disabled)
    merkle_root: str = ""


@dataclass
class DeleteResponse:
    """Response from a delete operation."""
    deleted_count: int
    merkle_root: str = ""


@dataclass
class FetchResponse:
    """Response from a fetch-by-ID operation."""
    vectors: dict[str, QueryMatch]


@dataclass
class CollectionStats:
    """
    Basic collection statistics (pre-Phase-6).
    For full inspector stats, use MemoryInspector.stats().
    """
    vector_count: int
    dimension: int
    metric: DistanceMetric
    name: str
    merkle_root: str = ""
    last_updated: Optional[float] = None
    is_frozen: bool = False
    encrypted: bool = False


@dataclass
class VerificationResult:
    """
    Result of verifying local Merkle root against on-chain root.

    verified: True if the local collection has not been tampered with.
    match: True if local root == on-chain root.
    """
    verified: bool
    match: bool
    local_root: str
    on_chain_root: str
    vector_count: int
    solana_explorer_url: str = ""
    timestamp: Optional[float] = None
    error: Optional[str] = None
```

---

## PART 3 — ENCRYPTION MODULE (Phase 4)

### `src/solvec/encryption.py` (NEW FILE)

```python
"""
AES-256-GCM encryption for Recall vector collections.

All vectors and metadata are encrypted before being stored to disk.
Zero plaintext ever touches the filesystem.

Key derivation: PBKDF2-HMAC-SHA256 with 600,000 iterations (OWASP 2023 recommendation).
Encryption: AES-256-GCM with a random 96-bit nonce per ciphertext.
Format: salt (16 bytes) + nonce (12 bytes) + ciphertext + tag (16 bytes)

Phase 4 feature.
"""
from __future__ import annotations

import os
import json
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


# Key derivation constants
_ITERATIONS = 600_000
_KEY_LENGTH = 32   # 256 bits
_SALT_LENGTH = 16  # 128 bits
_NONCE_LENGTH = 12  # 96 bits (GCM standard)


def derive_key(passphrase: str, salt: bytes) -> bytes:
    """
    Derive a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256.

    Args:
        passphrase: User-provided passphrase (never stored)
        salt: Random 16-byte salt (stored alongside ciphertext)

    Returns:
        32-byte AES-256 key
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=_KEY_LENGTH,
        salt=salt,
        iterations=_ITERATIONS,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def generate_salt() -> bytes:
    """Generate a cryptographically random 16-byte salt."""
    return os.urandom(_SALT_LENGTH)


def encrypt(data: bytes, key: bytes) -> bytes:
    """
    Encrypt data using AES-256-GCM.

    Format: nonce (12 bytes) || ciphertext+tag

    Args:
        data: Plaintext bytes to encrypt
        key: 32-byte AES key (from derive_key)

    Returns:
        nonce + ciphertext bytes (nonce prepended for storage)
    """
    nonce = os.urandom(_NONCE_LENGTH)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext


def decrypt(data: bytes, key: bytes) -> bytes:
    """
    Decrypt AES-256-GCM ciphertext.

    Expects format: nonce (12 bytes) || ciphertext+tag

    Args:
        data: nonce + ciphertext bytes
        key: 32-byte AES key

    Returns:
        Plaintext bytes

    Raises:
        cryptography.exceptions.InvalidTag: If data was tampered with
    """
    nonce = data[:_NONCE_LENGTH]
    ciphertext = data[_NONCE_LENGTH:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)


def encrypt_json(obj: Any, key: bytes) -> bytes:
    """Serialize obj to JSON and encrypt it."""
    plaintext = json.dumps(obj, separators=(",", ":")).encode("utf-8")
    return encrypt(plaintext, key)


def decrypt_json(data: bytes, key: bytes) -> Any:
    """Decrypt and deserialize JSON."""
    plaintext = decrypt(data, key)
    return json.loads(plaintext.decode("utf-8"))


def encrypt_vector(values: list[float], key: bytes) -> bytes:
    """
    Encrypt a float32 vector.

    Serializes as JSON array for portability.
    In a future version this will use binary float32 packing for 4x space savings.
    """
    return encrypt_json(values, key)


def decrypt_vector(data: bytes, key: bytes) -> list[float]:
    """Decrypt a float32 vector."""
    return decrypt_json(data, key)
```

---

## PART 4 — MERKLE MODULE (Phase 2)

### `src/solvec/merkle.py` (NEW FILE)

```python
"""
SHA-256 Merkle tree for Recall vector collections.

After every write, a Merkle root is computed from all vector IDs
in the collection. This root is posted asynchronously to the
Recall Anchor program on Solana.

The root fingerprints the entire collection. Change a single vector
ID — the root changes. Tamper-evident, always.

Phase 2 feature.
"""
from __future__ import annotations

import hashlib
import time
import asyncio
from typing import Optional


def _sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def compute_merkle_root(ids: list[str]) -> str:
    """
    Compute a SHA-256 Merkle root from a list of vector IDs.

    IDs are sorted deterministically before hashing so the root
    is order-independent. Same set of IDs always produces same root.

    Args:
        ids: List of vector IDs in the collection

    Returns:
        Hex-encoded Merkle root string (64 chars).
        Returns empty string if ids is empty.
    """
    if not ids:
        return ""

    # Sort for determinism
    sorted_ids = sorted(ids)

    # Leaf nodes: hash each ID
    leaves = [_sha256(id_.encode("utf-8")) for id_ in sorted_ids]

    # Build tree bottom-up
    nodes = leaves
    while len(nodes) > 1:
        if len(nodes) % 2 != 0:
            # Duplicate last node if odd count (standard Merkle convention)
            nodes.append(nodes[-1])
        next_level = []
        for i in range(0, len(nodes), 2):
            combined = _sha256(nodes[i] + nodes[i + 1])
            next_level.append(combined)
        nodes = next_level

    return nodes[0].hex()


async def post_to_solana(
    root: str,
    collection_name: str,
    config: "SolanaConfig",  # type: ignore[name-defined]
) -> Optional[str]:
    """
    Post a Merkle root to the Recall Anchor program on Solana.

    This is fire-and-forget — your app never waits for this call.
    Returns the transaction signature if successful, None on failure.

    Args:
        root: Hex-encoded Merkle root
        collection_name: Name of the collection
        config: SolanaConfig with network, program_id, and keypair

    Returns:
        Transaction signature string or None if Solana disabled/failed
    """
    if not config.enabled or not config.keypair:
        return None

    try:
        # Attempt to import optional Solana dependencies
        from solders.keypair import Keypair  # type: ignore
        from solana.rpc.async_api import AsyncClient  # type: ignore
        from solana.transaction import Transaction  # type: ignore

        rpc_urls = {
            "devnet": "https://api.devnet.solana.com",
            "mainnet-beta": "https://api.mainnet-beta.solana.com",
            "localnet": "http://127.0.0.1:8899",
        }
        rpc_url = rpc_urls.get(config.network, rpc_urls["devnet"])

        # Load keypair — accepts JSON array or base58 string
        if config.keypair.startswith("["):
            import json
            keypair = Keypair.from_bytes(bytes(json.loads(config.keypair)))
        else:
            import base58
            keypair = Keypair.from_bytes(base58.b58decode(config.keypair))

        async with AsyncClient(rpc_url) as client:
            # Build instruction data: root bytes + collection name
            data = bytes.fromhex(root) + collection_name.encode("utf-8")[:32]

            # In production this calls the actual Recall Anchor program.
            # For now, we use a memo instruction as a portable placeholder
            # that works on both devnet and mainnet without custom program deployment.
            from solders.instruction import Instruction, AccountMeta  # type: ignore
            from solders.pubkey import Pubkey  # type: ignore

            program_id = Pubkey.from_string(config.program_id)
            instruction = Instruction(
                program_id=program_id,
                accounts=[
                    AccountMeta(pubkey=keypair.pubkey(), is_signer=True, is_writable=True)
                ],
                data=data,
            )

            tx = Transaction()
            tx.add(instruction)

            blockhash_resp = await client.get_latest_blockhash()
            tx.recent_blockhash = blockhash_resp.value.blockhash
            tx.sign(keypair)

            result = await client.send_transaction(tx)
            return str(result.value)

    except ImportError:
        # solana/solders not installed — silently skip
        return None
    except Exception:
        # Never let a Solana failure crash the write operation
        return None


def schedule_solana_post(
    root: str,
    collection_name: str,
    config: "SolanaConfig",  # type: ignore[name-defined]
) -> None:
    """
    Schedule an async Solana post without blocking the caller.

    Uses asyncio.create_task if an event loop is running,
    otherwise creates a new loop in a background thread.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(post_to_solana(root, collection_name, config))
    except RuntimeError:
        # No running event loop — run in background thread
        import threading

        def _run():
            asyncio.run(post_to_solana(root, collection_name, config))

        t = threading.Thread(target=_run, daemon=True)
        t.start()
```

---

## PART 5 — SHADOW DRIVE MODULE (Phase 5)

### `src/solvec/shadow_drive.py` (NEW FILE)

```python
"""
Solana Shadow Drive integration for Recall.

Encrypted vector snapshots are stored on Shadow Drive — Solana's
decentralized permanent storage layer. Uses a headless wallet adapter
(auto-signing keypair) so no manual wallet approval is ever needed.

Writes are fire-and-forget. Your app never blocks on Shadow Drive.
Snapshots happen every N writes (configurable).

Phase 5 feature.
"""
from __future__ import annotations

import asyncio
import json
import time
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .types import ShadowDriveConfig
    from .collection import SolVecCollection


async def _upload_snapshot(
    collection: "SolVecCollection",
    config: "ShadowDriveConfig",
) -> Optional[str]:
    """
    Upload an encrypted snapshot of the collection to Shadow Drive.

    Returns the Shadow Drive URL if successful, None on failure.
    Never raises — Solana errors must never crash write operations.
    """
    try:
        from shadow_drive import ShadowDriveClient  # type: ignore
        from solders.keypair import Keypair  # type: ignore

        # Load keypair from config
        if config.keypair and config.keypair.startswith("["):
            keypair = Keypair.from_bytes(bytes(json.loads(config.keypair)))
        elif config.keypair:
            import base58
            keypair = Keypair.from_bytes(base58.b58decode(config.keypair))
        else:
            return None

        # Serialize and encrypt the collection snapshot
        snapshot_data = collection._serialize_snapshot()

        client = ShadowDriveClient(keypair)

        # Create storage account on first use
        if not config.storage_account:
            result = await client.create_storage_account(
                name=f"recall-{collection._name}",
                size="100MB",
            )
            config.storage_account = str(result.storage_account)

        # Upload snapshot
        filename = f"snapshot_{collection._name}_{int(time.time())}.bin"
        result = await client.upload_file(
            storage_account=config.storage_account,
            filename=filename,
            data=snapshot_data,
        )
        return str(result.url)

    except ImportError:
        # shadow-drive package not installed — silently skip
        return None
    except Exception:
        # Never let Shadow Drive failures crash writes
        return None


def schedule_snapshot(
    collection: "SolVecCollection",
    config: "ShadowDriveConfig",
) -> None:
    """
    Schedule a non-blocking Shadow Drive snapshot upload.

    Only runs if write_count % snapshot_interval == 0.
    Uses fire-and-forget async task scheduling.
    """
    if not config.enabled:
        return

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_upload_snapshot(collection, config))
    except RuntimeError:
        import threading

        def _run():
            asyncio.run(_upload_snapshot(collection, config))

        t = threading.Thread(target=_run, daemon=True)
        t.start()
```

---

## PART 6 — INSPECTOR MODULE (Phase 6)

### `src/solvec/inspector.py` (NEW FILE)

```python
"""
Memory Inspector for Recall by VecLabs.

Provides full visibility into what an AI agent has stored:
- Collection statistics (memory count, dimensions, encryption status)
- Filtered memory queries (time range, HNSW layer, metadata)
- Individual memory record retrieval
- Similarity search with full record objects
- Merkle root history
- Tamper detection via root verification

Phase 6 feature.

Usage:
    inspector = collection.inspector()

    # Fast stats
    stats = inspector.stats()
    print(f"{stats.total_memories} memories, {stats.memory_usage_bytes} bytes")

    # Filter memories
    from solvec import InspectorQuery
    result = inspector.inspect(InspectorQuery(limit=10, written_after=1700000000000))

    # Get single record
    record = inspector.get("mem_001")

    # Semantic search with full records
    matches = inspector.search_with_records(query_vector, k=5)

    # Verify integrity
    proof = inspector.verify()
    print("tampered!" if not proof.match else "all good")

    # Merkle history
    history = inspector.merkle_history()
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional, Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from .collection import SolVecCollection


# ─────────────────────────────────────────────
# Inspector types
# ─────────────────────────────────────────────

@dataclass
class MemoryRecord:
    """
    A single memory record as returned by the inspector.

    Contains the full vector, metadata, write timestamp,
    Merkle root at write time, and HNSW graph metadata.
    """
    id: str
    vector: list[float]
    metadata: dict
    written_at: int               # Unix ms timestamp
    merkle_root_at_write: str     # Merkle root when this memory was written
    hnsw_layer: int               # HNSW graph layer (0 = base layer)
    neighbor_count: int           # Number of HNSW neighbors at base layer
    # Reserved for Phase 10 GraphRAG — edge relationship types
    edge_types: list[list[int]] = field(default_factory=list)


@dataclass
class InspectorCollectionStats:
    """
    Full collection statistics from the Memory Inspector.

    More detailed than CollectionStats — includes on-chain verification
    status, HNSW layer count, and memory usage estimation.
    """
    total_memories: int
    dimensions: int
    current_merkle_root: str
    on_chain_root: str
    roots_match: bool
    last_write_at: int            # Unix ms
    last_chain_sync_at: int       # Unix ms
    hnsw_layer_count: int
    memory_usage_bytes: int
    encrypted: bool


@dataclass
class InspectorQuery:
    """
    Query filters for the Memory Inspector.

    All fields are optional. Without any filters, inspect() returns
    all memories (up to limit).
    """
    metadata_filter: Optional[dict] = None
    written_after: Optional[int] = None    # Unix ms
    written_before: Optional[int] = None   # Unix ms
    hnsw_layer: Optional[int] = None
    limit: Optional[int] = 50
    offset: Optional[int] = 0


@dataclass
class InspectionResult:
    """Full inspection result: stats + filtered memory records."""
    stats: InspectorCollectionStats
    memories: list[MemoryRecord]
    total_matching: int


@dataclass
class MerkleHistoryEntry:
    """A single entry in the Merkle root change history."""
    root: str
    timestamp: int                # Unix ms
    memory_count_at_time: int
    trigger: Literal["write", "delete", "bulk_write"]


# ─────────────────────────────────────────────
# MemoryInspector class
# ─────────────────────────────────────────────

class MemoryInspector:
    """
    Visual and programmatic inspector for Recall memory collections.

    Provides stats, filtering, verification, and Merkle history.
    Always bound to a specific SolVecCollection instance.

    Do not instantiate directly — use collection.inspector().
    """

    def __init__(self, collection: "SolVecCollection") -> None:
        self._collection = collection

    def stats(self) -> InspectorCollectionStats:
        """
        Returns fast collection statistics without iterating all memories.

        O(1) — reads pre-computed fields from the collection.
        Use this for dashboards, health checks, and monitoring.
        """
        c = self._collection

        # Check root match
        on_chain = getattr(c, "_on_chain_root", "") or ""
        current = getattr(c, "_current_merkle_root", "") or ""
        roots_match = bool(on_chain and current and on_chain == current)

        # Estimate memory usage
        dims = getattr(c, "_dimensions", 0) or 0
        vec_count = len(getattr(c, "_vectors", {}))
        memory_usage_bytes = vec_count * dims * 4  # float32 = 4 bytes

        return InspectorCollectionStats(
            total_memories=vec_count,
            dimensions=dims,
            current_merkle_root=current,
            on_chain_root=on_chain,
            roots_match=roots_match,
            last_write_at=getattr(c, "_last_write_at", 0) or 0,
            last_chain_sync_at=getattr(c, "_last_chain_sync_at", 0) or 0,
            hnsw_layer_count=1,  # Python SDK uses flat index; Rust core is multi-layer
            memory_usage_bytes=memory_usage_bytes,
            encrypted=getattr(c, "_encrypted", False),
        )

    def inspect(self, query: Optional[InspectorQuery] = None) -> InspectionResult:
        """
        Returns stats + filtered memory records.

        Supports filtering by time range, metadata, and HNSW layer.
        Pagination via limit and offset.

        O(n) where n = total memories.
        """
        q = query or InspectorQuery()
        c = self._collection

        vectors = getattr(c, "_vectors", {})
        metadata_store = getattr(c, "_metadata", {})
        written_at_store = getattr(c, "_written_at", {})
        merkle_at_write_store = getattr(c, "_merkle_root_at_write", {})

        all_records: list[MemoryRecord] = []

        for vid, vec in vectors.items():
            written_at = written_at_store.get(vid, 0)

            # Time filters
            if q.written_after is not None and written_at < q.written_after:
                continue
            if q.written_before is not None and written_at > q.written_before:
                continue

            # Metadata filter
            if q.metadata_filter:
                meta = metadata_store.get(vid, {})
                if not all(meta.get(k) == v for k, v in q.metadata_filter.items()):
                    continue

            # hnsw_layer filter — Python SDK uses flat index (all layer 0)
            if q.hnsw_layer is not None and q.hnsw_layer != 0:
                continue

            all_records.append(MemoryRecord(
                id=vid,
                vector=vec,
                metadata=metadata_store.get(vid, {}),
                written_at=written_at,
                merkle_root_at_write=merkle_at_write_store.get(vid, ""),
                hnsw_layer=0,
                neighbor_count=0,
            ))

        total_matching = len(all_records)
        offset = q.offset or 0
        limit = q.limit or 50
        paginated = all_records[offset: offset + limit]

        return InspectionResult(
            stats=self.stats(),
            memories=paginated,
            total_matching=total_matching,
        )

    def get(self, id: str) -> Optional[MemoryRecord]:
        """
        Returns a single MemoryRecord by ID.

        Returns None if the ID does not exist in the collection.
        O(1) — direct dict lookup.
        """
        c = self._collection
        vectors = getattr(c, "_vectors", {})

        if id not in vectors:
            return None

        return MemoryRecord(
            id=id,
            vector=vectors[id],
            metadata=getattr(c, "_metadata", {}).get(id, {}),
            written_at=getattr(c, "_written_at", {}).get(id, 0),
            merkle_root_at_write=getattr(c, "_merkle_root_at_write", {}).get(id, ""),
            hnsw_layer=0,
            neighbor_count=0,
        )

    def search_with_records(
        self,
        vector: list[float],
        k: int,
    ) -> list[tuple[float, MemoryRecord]]:
        """
        Searches and returns full MemoryRecord objects alongside similarity scores.

        Returns list of (score, MemoryRecord) tuples sorted by score descending.
        Uses the same distance metric as the collection (default: cosine).

        O(n) — linear scan. For large collections, use collection.query() which
        uses the HNSW approximate search instead.
        """
        c = self._collection
        vectors = getattr(c, "_vectors", {})
        metadata_store = getattr(c, "_metadata", {})
        written_at_store = getattr(c, "_written_at", {})
        merkle_at_write_store = getattr(c, "_merkle_root_at_write", {})

        results: list[tuple[float, MemoryRecord]] = []

        for vid, vec in vectors.items():
            score = c._cosine_similarity(vector, vec)
            record = MemoryRecord(
                id=vid,
                vector=vec,
                metadata=metadata_store.get(vid, {}),
                written_at=written_at_store.get(vid, 0),
                merkle_root_at_write=merkle_at_write_store.get(vid, ""),
                hnsw_layer=0,
                neighbor_count=0,
            )
            results.append((score, record))

        results.sort(key=lambda x: x[0], reverse=True)
        return results[:k]

    def merkle_history(self) -> list[MerkleHistoryEntry]:
        """
        Returns the full Merkle root change history.

        Each entry represents a point in time when the collection's
        Merkle root changed — triggered by writes and deletes.

        Use this to see exactly when the collection changed and
        how many memories existed at each point.
        """
        c = self._collection
        return list(getattr(c, "_merkle_history", []))

    def verify(self) -> dict:
        """
        Verify local Merkle root against the on-chain root.

        Returns:
            dict with keys:
                match (bool): True if local == on-chain root
                local_root (str): Current local Merkle root
                on_chain_root (str): Last known on-chain Merkle root
        """
        c = self._collection
        local = getattr(c, "_current_merkle_root", "") or ""
        on_chain = getattr(c, "_on_chain_root", "") or ""
        return {
            "match": bool(local and on_chain and local == on_chain),
            "local_root": local,
            "on_chain_root": on_chain,
        }
```

---

## PART 7 — COLLECTION REBUILD (Complete)

### `src/solvec/collection.py`

Rewrite this file completely. Preserve the existing public method signatures
(upsert, query, delete, fetch, describe_index_stats, verify) but add all the
Phase 4/5/6 internals.

```python
"""
SolVecCollection — the core collection class for Recall.

Handles vector storage, similarity search, AES-256-GCM encryption,
Merkle root computation, Solana posting, Shadow Drive snapshots,
and the full Phase 6 Memory Inspector integration.
"""
from __future__ import annotations

import math
import time
from typing import Optional, Any, TYPE_CHECKING

from .types import (
    DistanceMetric,
    UpsertRecord,
    QueryMatch,
    QueryResponse,
    UpsertResponse,
    DeleteResponse,
    FetchResponse,
    CollectionStats,
    VerificationResult,
    EncryptionConfig,
    SolanaConfig,
    ShadowDriveConfig,
)
from .merkle import compute_merkle_root, schedule_solana_post
from .inspector import MemoryInspector, MerkleHistoryEntry

if TYPE_CHECKING:
    pass


class SolVecCollection:
    """
    A named vector collection with encryption, on-chain verification,
    and Memory Inspector support.

    Do not instantiate directly — use SolVec.collection().
    """

    def __init__(
        self,
        name: str,
        dimensions: int,
        metric: DistanceMetric = DistanceMetric.COSINE,
        encryption: Optional[EncryptionConfig] = None,
        solana: Optional[SolanaConfig] = None,
        shadow_drive: Optional[ShadowDriveConfig] = None,
    ) -> None:
        self._name = name
        self._dimensions = dimensions
        self._metric = metric

        # Config
        self._encryption = encryption or EncryptionConfig()
        self._solana = solana or SolanaConfig()
        self._shadow_drive = shadow_drive or ShadowDriveConfig()

        # Storage
        self._vectors: dict[str, list[float]] = {}
        self._metadata: dict[str, dict] = {}

        # Phase 4 — Encryption
        self._encrypted: bool = self._encryption.enabled
        self._aes_key: Optional[bytes] = None
        if self._encryption.enabled and self._encryption.passphrase:
            from .encryption import derive_key, generate_salt
            salt = self._encryption.salt or generate_salt()
            self._encryption.salt = salt
            self._aes_key = derive_key(self._encryption.passphrase, salt)

        # Phase 2 — Merkle / Solana state
        self._current_merkle_root: str = ""
        self._on_chain_root: str = ""
        self._last_write_at: int = 0
        self._last_chain_sync_at: int = 0
        self._write_count: int = 0

        # Phase 6 — Inspector state
        self._written_at: dict[str, int] = {}
        self._merkle_root_at_write: dict[str, str] = {}
        self._merkle_history: list[MerkleHistoryEntry] = []

        # Phase 10 — Reserved for GraphRAG
        # edge_types stored per-vector ID when Phase 10 ships
        self._edge_types: dict[str, list[list[int]]] = {}

        # Cached inspector instance
        self._inspector_instance: Optional[MemoryInspector] = None

    # ─────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────

    def upsert(self, records: list[dict | UpsertRecord]) -> UpsertResponse:
        """
        Insert or update vectors in the collection.

        Each record must have: id (str), values (list[float]), metadata (dict, optional)
        If a record with the same ID exists, it is overwritten.

        Triggers: Merkle root recomputation + async Solana post + Shadow Drive snapshot.

        Args:
            records: List of dicts or UpsertRecord objects

        Returns:
            UpsertResponse with upserted_count and new merkle_root
        """
        normalized = [
            r if isinstance(r, UpsertRecord)
            else UpsertRecord(
                id=r["id"],
                values=r["values"],
                metadata=r.get("metadata", {}),
            )
            for r in records
        ]

        if not normalized:
            return UpsertResponse(upserted_count=0, merkle_root=self._current_merkle_root)

        # Validate dimensions
        for r in normalized:
            if len(r.values) != self._dimensions:
                raise ValueError(
                    f"Vector '{r.id}' has {len(r.values)} dimensions, "
                    f"expected {self._dimensions}"
                )

        now_ms = int(time.time() * 1000)
        trigger = "bulk_write" if len(normalized) > 1 else "write"

        for r in normalized:
            if self._encrypted and self._aes_key:
                # Store encrypted — decrypt on read
                from .encryption import encrypt_vector
                self._vectors[r.id] = r.values  # keep plaintext in-memory only
                # Disk persistence would use encrypt_vector here
            else:
                self._vectors[r.id] = r.values

            self._metadata[r.id] = r.metadata
            self._written_at[r.id] = now_ms

        # Recompute Merkle root
        new_root = compute_merkle_root(list(self._vectors.keys()))
        self._current_merkle_root = new_root
        self._last_write_at = now_ms
        self._write_count += len(normalized)

        # Record root at write time for each record
        for r in normalized:
            self._merkle_root_at_write[r.id] = new_root

        # Append to history
        self._merkle_history.append(MerkleHistoryEntry(
            root=new_root,
            timestamp=now_ms,
            memory_count_at_time=len(self._vectors),
            trigger=trigger,  # type: ignore
        ))

        # Async Solana post (fire-and-forget)
        if self._solana.enabled:
            schedule_solana_post(new_root, self._name, self._solana)
            self._last_chain_sync_at = now_ms

        # Shadow Drive snapshot (fire-and-forget, every N writes)
        if (
            self._shadow_drive.enabled
            and self._write_count % self._shadow_drive.snapshot_interval == 0
        ):
            from .shadow_drive import schedule_snapshot
            schedule_snapshot(self, self._shadow_drive)

        return UpsertResponse(
            upserted_count=len(normalized),
            merkle_root=new_root,
        )

    def query(
        self,
        vector: list[float],
        top_k: int = 10,
        filter: Optional[dict] = None,
        include_values: bool = False,
    ) -> QueryResponse:
        """
        Find the top-K most similar vectors to a query vector.

        Uses cosine similarity (or configured metric).
        Supports optional metadata filtering.

        Args:
            vector: Query vector (must match collection dimensions)
            top_k: Number of results to return
            filter: Optional metadata filter dict (exact match on all keys)
            include_values: Whether to include raw vectors in results

        Returns:
            QueryResponse with matches sorted by score descending
        """
        if len(vector) != self._dimensions:
            raise ValueError(
                f"Query vector has {len(vector)} dimensions, expected {self._dimensions}"
            )

        scores: list[tuple[float, str]] = []

        for vid, vec in self._vectors.items():
            if filter:
                meta = self._metadata.get(vid, {})
                if not all(meta.get(k) == v for k, v in filter.items()):
                    continue

            if self._metric == DistanceMetric.COSINE:
                score = self._cosine_similarity(vector, vec)
            elif self._metric == DistanceMetric.DOT:
                score = sum(a * b for a, b in zip(vector, vec))
            else:  # EUCLIDEAN — convert distance to similarity
                dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(vector, vec)))
                score = 1.0 / (1.0 + dist)

            scores.append((score, vid))

        scores.sort(key=lambda x: x[0], reverse=True)
        top = scores[:top_k]

        matches = [
            QueryMatch(
                id=vid,
                score=score,
                metadata=self._metadata.get(vid, {}),
                values=self._vectors[vid] if include_values else None,
            )
            for score, vid in top
        ]

        return QueryResponse(matches=matches)

    def delete(self, ids: list[str]) -> DeleteResponse:
        """
        Delete vectors by ID.

        Triggers Merkle root recomputation + async Solana post.

        Args:
            ids: List of vector IDs to delete

        Returns:
            DeleteResponse with deleted_count and new merkle_root
        """
        deleted = 0
        for vid in ids:
            if vid in self._vectors:
                del self._vectors[vid]
                self._metadata.pop(vid, None)
                self._written_at.pop(vid, None)
                self._merkle_root_at_write.pop(vid, None)
                self._edge_types.pop(vid, None)
                deleted += 1

        if deleted > 0:
            now_ms = int(time.time() * 1000)
            new_root = compute_merkle_root(list(self._vectors.keys()))
            self._current_merkle_root = new_root
            self._last_write_at = now_ms

            self._merkle_history.append(MerkleHistoryEntry(
                root=new_root,
                timestamp=now_ms,
                memory_count_at_time=len(self._vectors),
                trigger="delete",
            ))

            if self._solana.enabled:
                schedule_solana_post(new_root, self._name, self._solana)
                self._last_chain_sync_at = now_ms

        return DeleteResponse(
            deleted_count=deleted,
            merkle_root=self._current_merkle_root,
        )

    def fetch(self, ids: list[str]) -> FetchResponse:
        """
        Fetch vectors by exact ID.

        Returns only the IDs that exist in the collection.
        IDs not found are silently omitted.

        Args:
            ids: List of vector IDs to fetch

        Returns:
            FetchResponse with a dict of id -> QueryMatch
        """
        result: dict[str, QueryMatch] = {}
        for vid in ids:
            if vid in self._vectors:
                result[vid] = QueryMatch(
                    id=vid,
                    score=1.0,
                    metadata=self._metadata.get(vid, {}),
                    values=self._vectors[vid],
                )
        return FetchResponse(vectors=result)

    def describe_index_stats(self) -> CollectionStats:
        """
        Returns basic collection statistics.

        For full inspector stats including on-chain verification status,
        use collection.inspector().stats() instead.
        """
        return CollectionStats(
            vector_count=len(self._vectors),
            dimension=self._dimensions,
            metric=self._metric,
            name=self._name,
            merkle_root=self._current_merkle_root,
            last_updated=self._last_write_at / 1000 if self._last_write_at else None,
            encrypted=self._encrypted,
        )

    def verify(self) -> VerificationResult:
        """
        Verify local Merkle root against the on-chain root.

        Returns a VerificationResult indicating whether the collection
        has been tampered with since the last Solana sync.
        """
        local = self._current_merkle_root
        on_chain = self._on_chain_root
        match = bool(local and on_chain and local == on_chain)

        explorer_url = ""
        if on_chain and self._solana.network == "devnet":
            explorer_url = f"https://explorer.solana.com/address/{self._solana.program_id}?cluster=devnet"

        return VerificationResult(
            verified=match,
            match=match,
            local_root=local,
            on_chain_root=on_chain,
            vector_count=len(self._vectors),
            solana_explorer_url=explorer_url,
            timestamp=time.time(),
        )

    def inspector(self) -> MemoryInspector:
        """
        Returns a MemoryInspector bound to this collection.

        The inspector is cached — calling inspector() multiple times
        returns the same instance.

        Phase 6 feature.

        Example:
            inspector = collection.inspector()
            stats = inspector.stats()
            result = inspector.inspect()
            proof = inspector.verify()
        """
        if self._inspector_instance is None:
            self._inspector_instance = MemoryInspector(self)
        return self._inspector_instance

    # ─────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """Compute cosine similarity between two vectors."""
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(x * x for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    def _serialize_snapshot(self) -> bytes:
        """
        Serialize collection to bytes for Shadow Drive upload.

        Returns encrypted bytes if encryption is enabled,
        plaintext JSON bytes otherwise.
        """
        import json
        data = {
            "name": self._name,
            "dimensions": self._dimensions,
            "metric": self._metric.value,
            "vectors": self._vectors,
            "metadata": self._metadata,
            "merkle_root": self._current_merkle_root,
            "timestamp": time.time(),
        }
        raw = json.dumps(data).encode("utf-8")

        if self._encrypted and self._aes_key:
            from .encryption import encrypt
            return encrypt(raw, self._aes_key)

        return raw
```

---

## PART 8 — CLIENT REBUILD

### `src/solvec/client.py`

```python
"""
SolVec — main client for Recall by VecLabs.

Entry point for creating and managing vector collections.

Usage:
    from solvec import SolVec

    # Basic usage
    sv = SolVec()
    collection = sv.collection("agent-memory", dimensions=1536)

    # With encryption (Phase 4)
    from solvec import EncryptionConfig
    sv = SolVec(encryption=EncryptionConfig(enabled=True, passphrase="your-passphrase"))

    # With Solana verification (Phase 2)
    from solvec import SolanaConfig
    sv = SolVec(solana=SolanaConfig(enabled=True, keypair="/path/to/keypair.json"))

    # With Shadow Drive (Phase 5)
    from solvec import ShadowDriveConfig
    sv = SolVec(shadow_drive=ShadowDriveConfig(enabled=True, keypair="..."))

    # Full stack
    sv = SolVec(
        encryption=EncryptionConfig(enabled=True, passphrase="secret"),
        solana=SolanaConfig(enabled=True, keypair="keypair.json", network="devnet"),
        shadow_drive=ShadowDriveConfig(enabled=True, keypair="keypair.json"),
    )
"""
from __future__ import annotations

from typing import Optional

from .collection import SolVecCollection
from .types import (
    DistanceMetric,
    EncryptionConfig,
    SolanaConfig,
    ShadowDriveConfig,
)


class SolVec:
    """
    Main client for Recall by VecLabs.

    Manages a registry of named vector collections.
    All collections share the same encryption, Solana, and Shadow Drive config.
    """

    def __init__(
        self,
        encryption: Optional[EncryptionConfig] = None,
        solana: Optional[SolanaConfig] = None,
        shadow_drive: Optional[ShadowDriveConfig] = None,
    ) -> None:
        self._encryption = encryption or EncryptionConfig()
        self._solana = solana or SolanaConfig()
        self._shadow_drive = shadow_drive or ShadowDriveConfig()
        self._collections: dict[str, SolVecCollection] = {}

    def collection(
        self,
        name: str,
        dimensions: int,
        metric: DistanceMetric = DistanceMetric.COSINE,
    ) -> SolVecCollection:
        """
        Get or create a named vector collection.

        If a collection with this name already exists, returns the
        existing instance (same in-memory state preserved).

        Args:
            name: Unique collection name
            dimensions: Vector dimensionality (must match your embeddings)
            metric: Distance metric (default: cosine)

        Returns:
            SolVecCollection instance
        """
        if name not in self._collections:
            self._collections[name] = SolVecCollection(
                name=name,
                dimensions=dimensions,
                metric=metric,
                encryption=self._encryption,
                solana=self._solana,
                shadow_drive=self._shadow_drive,
            )
        return self._collections[name]

    def list_collections(self) -> list[str]:
        """Returns the names of all collections managed by this client."""
        return list(self._collections.keys())

    def drop_collection(self, name: str) -> bool:
        """
        Remove a collection from the registry.

        Warning: This does NOT delete data from Shadow Drive.
        The in-memory collection is cleared.

        Returns True if the collection existed, False otherwise.
        """
        if name in self._collections:
            del self._collections[name]
            return True
        return False
```

---

## PART 9 — TESTS

### `tests/test_encryption.py` (NEW FILE)

```python
"""Tests for AES-256-GCM encryption module — Phase 4."""
import pytest
from solvec.encryption import (
    derive_key, generate_salt, encrypt, decrypt,
    encrypt_json, decrypt_json, encrypt_vector, decrypt_vector,
)


def test_generate_salt_length():
    salt = generate_salt()
    assert len(salt) == 16


def test_generate_salt_unique():
    assert generate_salt() != generate_salt()


def test_derive_key_length():
    key = derive_key("passphrase", generate_salt())
    assert len(key) == 32


def test_derive_key_deterministic():
    salt = generate_salt()
    assert derive_key("pass", salt) == derive_key("pass", salt)


def test_encrypt_decrypt_roundtrip():
    key = derive_key("test-pass", generate_salt())
    data = b"hello world"
    assert decrypt(encrypt(data, key), key) == data


def test_encrypt_json_roundtrip():
    key = derive_key("test-pass", generate_salt())
    obj = {"id": "mem_001", "values": [0.1, 0.2, 0.3], "meta": {"x": 1}}
    assert decrypt_json(encrypt_json(obj, key), key) == obj


def test_encrypt_vector_roundtrip():
    key = derive_key("test-pass", generate_salt())
    vec = [0.42, 0.87, 0.13, 0.55]
    assert decrypt_vector(encrypt_vector(vec, key), key) == vec


def test_decrypt_tampered_raises():
    from cryptography.exceptions import InvalidTag
    key = derive_key("test-pass", generate_salt())
    ciphertext = bytearray(encrypt(b"secret", key))
    ciphertext[-1] ^= 0xFF  # flip last bit
    with pytest.raises(Exception):
        decrypt(bytes(ciphertext), key)
```

### `tests/test_merkle.py` (NEW FILE)

```python
"""Tests for Merkle root computation — Phase 2."""
import pytest
from solvec.merkle import compute_merkle_root


def test_empty_returns_empty_string():
    assert compute_merkle_root([]) == ""


def test_single_id_returns_hash():
    root = compute_merkle_root(["mem_001"])
    assert len(root) == 64  # hex SHA-256


def test_deterministic_same_input():
    ids = ["mem_001", "mem_002", "mem_003"]
    assert compute_merkle_root(ids) == compute_merkle_root(ids)


def test_order_independent():
    ids = ["mem_001", "mem_002", "mem_003"]
    assert compute_merkle_root(ids) == compute_merkle_root(list(reversed(ids)))


def test_different_ids_different_root():
    assert compute_merkle_root(["a", "b"]) != compute_merkle_root(["a", "c"])


def test_adding_id_changes_root():
    root_before = compute_merkle_root(["a", "b"])
    root_after = compute_merkle_root(["a", "b", "c"])
    assert root_before != root_after
```

### `tests/test_inspector.py` (NEW FILE)

```python
"""Tests for Memory Inspector — Phase 6."""
import pytest
import time
from solvec import SolVec, InspectorQuery, MemoryRecord, MerkleHistoryEntry


def make_collection(n: int = 10):
    """Create a collection with n vectors."""
    sv = SolVec()
    col = sv.collection("test", dimensions=4)
    records = [
        {"id": f"mem_{i:03d}", "values": [float(i), float(i+1), float(i+2), float(i+3)],
         "metadata": {"index": i, "tag": "even" if i % 2 == 0 else "odd"}}
        for i in range(n)
    ]
    col.upsert(records)
    return col


def test_inspector_returns_instance():
    col = make_collection()
    inspector = col.inspector()
    assert inspector is not None


def test_inspector_cached():
    col = make_collection()
    assert col.inspector() is col.inspector()


def test_stats_total_memories():
    col = make_collection(10)
    stats = col.inspector().stats()
    assert stats.total_memories == 10


def test_stats_dimensions():
    col = make_collection()
    assert col.inspector().stats().dimensions == 4


def test_stats_merkle_root_not_empty():
    col = make_collection()
    assert col.inspector().stats().current_merkle_root != ""


def test_stats_encrypted_false_by_default():
    col = make_collection()
    assert col.inspector().stats().encrypted is False


def test_inspect_no_filter_returns_all():
    col = make_collection(10)
    result = col.inspector().inspect()
    assert result.total_matching == 10


def test_inspect_limit():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(limit=3))
    assert len(result.memories) == 3


def test_inspect_offset():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(limit=5, offset=5))
    assert len(result.memories) == 5


def test_inspect_metadata_filter():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(metadata_filter={"tag": "even"}))
    assert all(m.metadata["tag"] == "even" for m in result.memories)


def test_get_returns_record():
    col = make_collection(5)
    record = col.inspector().get("mem_000")
    assert record is not None
    assert record.id == "mem_000"


def test_get_returns_none_for_missing():
    col = make_collection(5)
    assert col.inspector().get("nonexistent") is None


def test_search_with_records_returns_k():
    col = make_collection(10)
    query = [1.0, 2.0, 3.0, 4.0]
    results = col.inspector().search_with_records(query, k=3)
    assert len(results) == 3


def test_search_with_records_sorted_descending():
    col = make_collection(10)
    query = [1.0, 2.0, 3.0, 4.0]
    results = col.inspector().search_with_records(query, k=5)
    scores = [r[0] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_merkle_history_grows_on_write():
    sv = SolVec()
    col = sv.collection("history-test", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    col.upsert([{"id": "b", "values": [3.0, 4.0]}])
    history = col.inspector().merkle_history()
    assert len(history) == 2


def test_merkle_history_trigger_is_write():
    sv = SolVec()
    col = sv.collection("trigger-test", dimensions=2)
    col.upsert([{"id": "x", "values": [1.0, 0.0]}])
    history = col.inspector().merkle_history()
    assert history[0].trigger == "write"


def test_written_at_nonzero():
    col = make_collection(3)
    record = col.inspector().get("mem_000")
    assert record.written_at > 0


def test_verify_structure():
    col = make_collection(3)
    proof = col.inspector().verify()
    assert "match" in proof
    assert "local_root" in proof
    assert "on_chain_root" in proof
```

### `tests/test_shadow_drive.py` (NEW FILE)

```python
"""Tests for Shadow Drive integration — Phase 5 (mocked)."""
import pytest
from unittest.mock import patch, AsyncMock
from solvec import SolVec
from solvec.types import ShadowDriveConfig


def test_serialize_snapshot_returns_bytes():
    sv = SolVec()
    col = sv.collection("snap-test", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    snapshot = col._serialize_snapshot()
    assert isinstance(snapshot, bytes)
    assert len(snapshot) > 0


def test_serialize_snapshot_contains_collection_name():
    sv = SolVec()
    col = sv.collection("my-collection", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    snapshot = col._serialize_snapshot()
    assert b"my-collection" in snapshot


def test_shadow_drive_disabled_by_default():
    sv = SolVec()
    col = sv.collection("test", dimensions=2)
    assert col._shadow_drive.enabled is False


def test_write_count_increments():
    sv = SolVec()
    col = sv.collection("counter", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    col.upsert([{"id": "b", "values": [3.0, 4.0]}])
    assert col._write_count == 2
```

---

## PART 10 — README UPDATE

### `README.md`

Replace with a clean, up-to-date README that matches the TypeScript SDK README style.

Key sections:
- Installation
- Quick Start (basic upsert + query)
- Phase 4: Encryption
- Phase 2: Solana Verification
- Phase 5: Shadow Drive
- Phase 6: Memory Inspector
- API Reference (all public methods)
- Running Tests

---

## PART 11 — DEFINITION OF DONE

Phase 6 Python SDK parity is complete when ALL of the following are true:

- [ ] `pyproject.toml` version is `0.1.0a7`
- [ ] `__init__.py` version is `0.1.0a7`
- [ ] All imports in `__init__.py` resolve without errors
- [ ] `SolVec`, `SolVecCollection`, `MemoryInspector` all importable from `solvec`
- [ ] `EncryptionConfig`, `SolanaConfig`, `ShadowDriveConfig` importable from `solvec`
- [ ] All 5 inspector types importable from `solvec`
- [ ] `pytest tests/` runs with **zero failures**
- [ ] Existing 12 tests in `test_collection.py` still pass (no regressions)
- [ ] 8 new encryption tests pass
- [ ] 6 new Merkle tests pass
- [ ] 11 new inspector tests pass
- [ ] 4 new Shadow Drive tests pass
- [ ] Total: **41 tests passing**
- [ ] `collection.inspector()` returns a `MemoryInspector`
- [ ] `inspector.stats()` returns `InspectorCollectionStats`
- [ ] `inspector.inspect()` returns `InspectionResult`
- [ ] `inspector.get(id)` returns `MemoryRecord` or `None`
- [ ] `inspector.verify()` returns dict with `match`, `local_root`, `on_chain_root`
- [ ] `inspector.merkle_history()` returns non-empty list after writes
- [ ] `inspector.search_with_records()` returns `list[tuple[float, MemoryRecord]]`
- [ ] AES-256-GCM encrypt/decrypt roundtrip works
- [ ] Merkle root is recomputed after every upsert and delete
- [ ] `edge_types` field reserved on MemoryRecord (Phase 10 prep)
- [ ] No breaking changes to existing public API

---

## FINAL NOTES

- Do NOT commit — report back with results only
- Run `pytest tests/ -v` and paste the full output
- If any existing test breaks, fix it before proceeding
- Use `#[serde(default)]` equivalent in Python: `field(default_factory=list)` for backward compat
- The Python SDK does not call the WASM binary directly — it reimplements the core
  algorithms in pure Python. The Rust WASM bridge is TypeScript-only.
  Phase 8 will explore PyO3 bindings for native Rust speed in Python.
- Solana and Shadow Drive dependencies are optional — guard all imports with try/except ImportError
- Never let Solana or Shadow Drive failures crash write operations
```
