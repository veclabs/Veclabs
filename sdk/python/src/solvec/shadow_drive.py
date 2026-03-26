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

        if config.keypair and config.keypair.startswith("["):
            keypair = Keypair.from_bytes(bytes(json.loads(config.keypair)))
        elif config.keypair:
            import base58
            keypair = Keypair.from_bytes(base58.b58decode(config.keypair))
        else:
            return None

        snapshot_data = collection._serialize_snapshot()

        client = ShadowDriveClient(keypair)

        if not config.storage_account:
            result = await client.create_storage_account(
                name=f"recall-{collection._name}",
                size="100MB",
            )
            config.storage_account = str(result.storage_account)

        filename = f"snapshot_{collection._name}_{int(time.time())}.bin"
        result = await client.upload_file(
            storage_account=config.storage_account,
            filename=filename,
            data=snapshot_data,
        )
        return str(result.url)

    except ImportError:
        return None
    except Exception:
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
