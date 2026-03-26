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
    DOT = "dot"


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
    network: str = "devnet"
    program_id: str = "8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP"
    keypair: Optional[str] = None
    async_post: bool = True
    collection_pda: Optional[str] = None


@dataclass
class ShadowDriveConfig:
    """
    Solana Shadow Drive decentralized storage configuration.

    When enabled, encrypted vector snapshots are uploaded to Shadow Drive
    after every write batch.

    Phase 5 feature.
    """
    enabled: bool = False
    keypair: Optional[str] = None
    storage_account: Optional[str] = None
    snapshot_interval: int = 10
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
