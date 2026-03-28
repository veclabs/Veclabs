"""
solvec - Python SDK for Recall by VecLabs.

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
