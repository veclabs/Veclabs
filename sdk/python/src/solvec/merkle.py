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
        return "0" * 64

    sorted_ids = sorted(ids)
    leaves = [_sha256(b"leaf:" + id_.encode("utf-8")) for id_ in sorted_ids]

    nodes = leaves
    while len(nodes) > 1:
        if len(nodes) % 2 != 0:
            nodes.append(nodes[-1])
        next_level = []
        for i in range(0, len(nodes), 2):
            combined = _sha256(b"node:" + nodes[i] + nodes[i + 1])
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
        from solders.keypair import Keypair  # type: ignore
        from solana.rpc.async_api import AsyncClient  # type: ignore
        from solana.transaction import Transaction  # type: ignore

        rpc_urls = {
            "devnet": "https://api.devnet.solana.com",
            "mainnet-beta": "https://api.mainnet-beta.solana.com",
            "localnet": "http://127.0.0.1:8899",
        }
        rpc_url = rpc_urls.get(config.network, rpc_urls["devnet"])

        if config.keypair.startswith("["):
            import json
            keypair = Keypair.from_bytes(bytes(json.loads(config.keypair)))
        else:
            import base58
            keypair = Keypair.from_bytes(base58.b58decode(config.keypair))

        async with AsyncClient(rpc_url) as client:
            data = bytes.fromhex(root) + collection_name.encode("utf-8")[:32]

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
        return None
    except Exception:
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
        import threading

        def _run():
            asyncio.run(post_to_solana(root, collection_name, config))

        t = threading.Thread(target=_run, daemon=True)
        t.start()
