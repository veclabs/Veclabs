"""
SolVec - Decentralized vector database for AI agents.

Rust HNSW + Solana on-chain provenance.
Pinecone-compatible API. Migrate in 30 minutes.

Example:
    from solvec import SolVec

    sv = SolVec(network="devnet")
    col = sv.collection("agent-memory", dimensions=1536)

    col.upsert([
        {"id": "mem_001", "values": [...], "metadata": {"text": "User is Alex"}}
    ])

    results = col.query(vector=[...], top_k=5)
    print(results["matches"][0])
"""

from .client import SolVec
from .collection import SolVecCollection
from .types import (
    UpsertRecord,
    QueryMatch,
    QueryResponse,
    CollectionStats,
    VerificationResult,
    DistanceMetric,
)

__version__ = "0.1.0a2"
__all__ = [
    "SolVec",
    "SolVecCollection",
    "UpsertRecord",
    "QueryMatch",
    "QueryResponse",
    "CollectionStats",
    "VerificationResult",
    "DistanceMetric",
]
