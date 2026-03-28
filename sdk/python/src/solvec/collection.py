"""
SolVecCollection - the core collection class for Recall.

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


class SolVecCollection:
    """
    A named vector collection with encryption, on-chain verification,
    and Memory Inspector support.

    Do not instantiate directly - use SolVec.collection().
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

        # Accept string metrics for backward compatibility
        if isinstance(metric, str):
            try:
                metric = DistanceMetric(metric)
            except ValueError:
                metric = DistanceMetric.COSINE
        self._metric = metric

        self._encryption = encryption or EncryptionConfig()
        self._solana = solana or SolanaConfig()
        self._shadow_drive = shadow_drive or ShadowDriveConfig()

        # Storage
        self._vectors: dict[str, list[float]] = {}
        self._metadata: dict[str, dict] = {}

        # Phase 4 - Encryption
        self._encrypted: bool = self._encryption.enabled
        self._aes_key: Optional[bytes] = None
        if self._encryption.enabled and self._encryption.passphrase:
            from .encryption import derive_key, generate_salt
            salt = self._encryption.salt or generate_salt()
            self._encryption.salt = salt
            self._aes_key = derive_key(self._encryption.passphrase, salt)

        # Phase 2 - Merkle / Solana state
        self._current_merkle_root: str = ""
        self._on_chain_root: str = ""
        self._last_write_at: int = 0
        self._last_chain_sync_at: int = 0
        self._write_count: int = 0

        # Phase 6 - Inspector state
        self._written_at: dict[str, int] = {}
        self._merkle_root_at_write: dict[str, str] = {}
        self._merkle_history: list[MerkleHistoryEntry] = []

        # Phase 10 - Reserved for GraphRAG
        self._edge_types: dict[str, list[list[int]]] = {}

        self._inspector_instance: Optional[MemoryInspector] = None

    # ─────────────────────────────────────────
    # Backward-compat properties
    # ─────────────────────────────────────────

    @property
    def name(self) -> str:
        return self._name

    @property
    def dimensions(self) -> int:
        return self._dimensions

    # ─────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────

    def upsert(self, records: list[dict | UpsertRecord]) -> UpsertResponse:
        """
        Insert or update vectors in the collection.

        Each record must have: id (str), values (list[float]), metadata (dict, optional)
        If a record with the same ID exists, it is overwritten.

        Triggers: Merkle root recomputation + async Solana post + Shadow Drive snapshot.
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

        for r in normalized:
            if len(r.values) != self._dimensions:
                raise ValueError(
                    f"Dimension mismatch: vector '{r.id}' has {len(r.values)} "
                    f"dimensions, expected {self._dimensions}"
                )

        now_ms = int(time.time() * 1000)
        trigger = "bulk_write" if len(normalized) > 1 else "write"

        for r in normalized:
            self._vectors[r.id] = r.values
            self._metadata[r.id] = r.metadata
            self._written_at[r.id] = now_ms

        new_root = compute_merkle_root(list(self._vectors.keys()))
        self._current_merkle_root = new_root
        self._last_write_at = now_ms
        self._write_count += len(normalized)

        for r in normalized:
            self._merkle_root_at_write[r.id] = new_root

        self._merkle_history.append(MerkleHistoryEntry(
            root=new_root,
            timestamp=now_ms,
            memory_count_at_time=len(self._vectors),
            trigger=trigger,  # type: ignore
        ))

        if self._solana.enabled:
            schedule_solana_post(new_root, self._name, self._solana)
            self._last_chain_sync_at = now_ms

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
        """
        if len(vector) != self._dimensions:
            raise ValueError(
                f"Query dimension mismatch: expected {self._dimensions}, "
                f"got {len(vector)}"
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
            else:  # EUCLIDEAN
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

    def fetch(self, ids: list[str]) -> dict:
        """
        Fetch vectors by exact ID.

        Returns dict with "vectors" key for backward compatibility.
        IDs not found are silently omitted.
        """
        result: dict[str, dict] = {}
        for vid in ids:
            if vid in self._vectors:
                result[vid] = {
                    "id": vid,
                    "values": self._vectors[vid],
                    "metadata": self._metadata.get(vid, {}),
                }
        return {"vectors": result, "namespace": self._name}

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
            explorer_url = (
                f"https://explorer.solana.com/address/"
                f"{self._solana.program_id}?cluster=devnet"
            )

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

        The inspector is cached - calling inspector() multiple times
        returns the same instance.

        Phase 6 feature.
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
