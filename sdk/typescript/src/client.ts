import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import { SolVecConfig, Network, CollectionConfig } from "./types";
import { SolVecCollection } from "./collection";
import { ShadowDriveClient } from "./shadow-drive";

const RPC_URLS: Record<Network, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  localnet: "http://localhost:8899",
};

/**
 * SolVec - Decentralized vector database client
 *
 * @example
 * ```typescript
 * import { SolVec } from 'solvec';
 *
 * const sv = new SolVec({ network: 'devnet' });
 * const col = sv.collection('agent-memory', { dimensions: 1536 });
 *
 * await col.upsert([{ id: 'mem_001', values: [...], metadata: { text: 'User is Alex' } }]);
 * const results = await col.query({ vector: [...], topK: 5 });
 * ```
 */
export class SolVec {
  readonly connection: Connection;
  readonly network: Network;
  private wallet?: Keypair;
  private shadowDriveClient?: ShadowDriveClient;
  private shadowDriveReady: Promise<void>;

  constructor(config: SolVecConfig) {
    this.network = config.network;
    const rpcUrl = config.rpcUrl ?? RPC_URLS[config.network];
    this.connection = new Connection(rpcUrl, "confirmed");

    if (config.walletPath) {
      const raw = fs.readFileSync(config.walletPath, "utf-8");
      const secretKey = Uint8Array.from(JSON.parse(raw));
      this.wallet = Keypair.fromSecretKey(secretKey);
    }

    if (config.shadowDrive) {
      if (!this.wallet) {
        console.warn("[SolVec] shadowDrive requires walletPath — Shadow Drive disabled");
        this.shadowDriveReady = Promise.resolve();
      } else {
        const sdNetwork =
          this.network === "mainnet-beta" ? "mainnet-beta" : "devnet";
        this.shadowDriveClient = new ShadowDriveClient(this.wallet, sdNetwork);
        this.shadowDriveReady = this.shadowDriveClient.initialize();
      }
    } else {
      this.shadowDriveReady = Promise.resolve();
    }
  }

  /**
   * Get or create a vector collection.
   * Equivalent to Pinecone's index().
   */
  collection(name: string, config: CollectionConfig = {}): SolVecCollection {
    return new SolVecCollection(
      name,
      config,
      this.connection,
      this.network,
      this.wallet,
      this.shadowDriveClient,
    );
  }

  /**
   * List all collections owned by the connected wallet.
   */
  async listCollections(): Promise<string[]> {
    if (!this.wallet) {
      throw new Error("Wallet required to list collections");
    }
    return [];
  }

  /** The connected wallet's public key, if available. */
  get walletPublicKey(): PublicKey | undefined {
    return this.wallet?.publicKey;
  }
}
