"""SolVec Python client — main entry point."""

from .collection import SolVecCollection
from .types import DistanceMetric


class SolVec:
    """
    SolVec client — decentralized vector database for AI agents.

    Args:
        network: Solana network. One of 'mainnet-beta', 'devnet', 'localnet'.
        wallet: Path to Solana keypair JSON file.
        rpc_url: Custom RPC URL (Helius, QuickNode, etc.).

    Example:
        sv = SolVec(network="devnet", wallet="~/.config/solana/id.json")
        col = sv.collection("agent-memory", dimensions=1536)
    """

    RPC_URLS = {
        "mainnet-beta": "https://api.mainnet-beta.solana.com",
        "devnet": "https://api.devnet.solana.com",
        "localnet": "http://localhost:8899",
    }

    def __init__(
        self,
        network: str = "devnet",
        wallet: str | None = None,
        rpc_url: str | None = None,
    ):
        if network not in self.RPC_URLS:
            raise ValueError(f"Invalid network '{network}'. Choose from: {list(self.RPC_URLS)}")

        self.network = network
        self.wallet_path = wallet
        self.rpc_url = rpc_url or self.RPC_URLS[network]
        self._collections: dict[str, SolVecCollection] = {}

    def collection(
        self,
        name: str,
        dimensions: int = 1536,
        metric: str | DistanceMetric = DistanceMetric.COSINE,
    ) -> "SolVecCollection":
        """
        Get or create a vector collection.
        Equivalent to Pinecone's Index().

        Args:
            name: Collection name (max 64 chars).
            dimensions: Vector dimension (default: 1536 for OpenAI embeddings).
            metric: Distance metric — 'cosine', 'euclidean', or 'dot'.

        Returns:
            SolVecCollection instance.
        """
        if name not in self._collections:
            self._collections[name] = SolVecCollection(
                name=name,
                dimensions=dimensions,
                metric=DistanceMetric(metric),
                network=self.network,
                wallet_path=self.wallet_path,
            )
        return self._collections[name]

    def list_collections(self) -> list[str]:
        """List all collection names in the current session."""
        return list(self._collections.keys())
