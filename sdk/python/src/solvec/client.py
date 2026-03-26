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
        **kwargs,  # absorbs legacy params: network, wallet_path, rpc_url
    ) -> None:
        self._encryption = encryption or EncryptionConfig()
        self._solana = solana or SolanaConfig()
        self._shadow_drive = shadow_drive or ShadowDriveConfig()

        # Legacy: if network was passed directly, apply it to SolanaConfig
        if "network" in kwargs:
            self._solana.network = kwargs["network"]

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
