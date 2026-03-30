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
    print("tampered!" if not proof["match"] else "all good")

    # Merkle history
    history = inspector.merkle_history()
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from .collection import SolVecCollection  # noqa: F401


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
    written_at: int
    merkle_root_at_write: str
    hnsw_layer: int
    neighbor_count: int
    # Reserved for Phase 10 GraphRAG - edge relationship types
    edge_types: list[list[int]] = field(default_factory=list)


@dataclass
class InspectorCollectionStats:
    """
    Full collection statistics from the Memory Inspector.

    More detailed than CollectionStats - includes on-chain verification
    status, HNSW layer count, and memory usage estimation.
    """
    total_memories: int
    dimensions: int
    current_merkle_root: str
    on_chain_root: str
    roots_match: bool
    last_write_at: int
    last_chain_sync_at: int
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
    written_after: Optional[int] = None
    written_before: Optional[int] = None
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
    timestamp: int
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

    Do not instantiate directly - use collection.inspector().
    """

    def __init__(self, collection: "SolVecCollection") -> None:
        self._collection = collection

    def stats(self) -> InspectorCollectionStats:
        """
        Returns fast collection statistics without iterating all memories.

        O(1) - reads pre-computed fields from the collection.
        Use this for dashboards, health checks, and monitoring.
        """
        c = self._collection

        on_chain = getattr(c, "_on_chain_root", "") or ""
        current = getattr(c, "_current_merkle_root", "") or ""
        roots_match = bool(on_chain and current and on_chain == current)

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
            hnsw_layer_count=1,
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

            if q.written_after is not None and written_at < q.written_after:
                continue
            if q.written_before is not None and written_at > q.written_before:
                continue

            if q.metadata_filter:
                meta = metadata_store.get(vid, {})
                if not all(meta.get(k) == v for k, v in q.metadata_filter.items()):
                    continue

            # Python SDK uses flat index (all layer 0)
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
        O(1) - direct dict lookup.
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

        O(n) - linear scan. For large collections, use collection.query() which
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
        Merkle root changed - triggered by writes and deletes.

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


# ─────────────────────────────────────────────
# HostedMemoryInspector — routes to api.veclabs.xyz
# ─────────────────────────────────────────────

class HostedMemoryInspector:
    """
    Memory Inspector for hosted API mode.
    Routes inspector calls to api.veclabs.xyz.
    """

    def __init__(self, collection: "SolVecCollection") -> None:
        self._collection = collection

    def stats(self) -> InspectorCollectionStats:
        data = self._collection._hosted_fetch(
            f"/api/v1/collections/{self._collection._name}/inspect"
        )
        s = data.get("stats", {})
        return InspectorCollectionStats(
            total_memories=s.get("total_memories", 0),
            dimensions=s.get("dimensions", 0),
            current_merkle_root=s.get("current_merkle_root", ""),
            on_chain_root=s.get("on_chain_root", ""),
            roots_match=s.get("roots_match", False),
            last_write_at=s.get("last_write_at", 0),
            last_chain_sync_at=s.get("last_chain_sync_at", 0),
            hnsw_layer_count=s.get("hnsw_layer_count", 1),
            memory_usage_bytes=s.get("memory_usage_bytes", 0),
            encrypted=s.get("encrypted", False),
        )

    def verify(self) -> dict:
        return self._collection._hosted_fetch(
            f"/api/v1/collections/{self._collection._name}/verify"
        )

    def inspect(self, query: Optional[InspectorQuery] = None) -> InspectionResult:
        q = query or InspectorQuery()
        params = f"?limit={q.limit or 50}&offset={q.offset or 0}"
        data = self._collection._hosted_fetch(
            f"/api/v1/collections/{self._collection._name}/inspect{params}"
        )
        return InspectionResult(
            stats=self.stats(),
            memories=[],
            total_matching=data.get("total_matching", 0),
        )

    def get(self, id: str) -> Optional[MemoryRecord]:
        print(f"Warning: inspector.get() not yet available in hosted mode")
        return None

    def search_with_records(self, vector: list[float], k: int):
        raise NotImplementedError(
            "search_with_records() is not yet available in hosted mode. "
            "Use collection.query() instead."
        )

    def merkle_history(self) -> list[MerkleHistoryEntry]:
        return []
