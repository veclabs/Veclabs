import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { createHash } from "crypto";

// Program ID from devnet deployment
export const SOLVEC_PROGRAM_ID = new PublicKey(
  "8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP",
);

export type Network = "mainnet-beta" | "devnet" | "localnet";

const RPC_URLS: Record<Network, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  localnet: "http://localhost:8899",
};

function getDiscriminator(instructionName: string): Buffer {
  const hash = createHash("sha256")
    .update(`global:${instructionName}`)
    .digest();
  return hash.subarray(0, 8);
}

/**
 * AnchorClient - handles all Solana on-chain operations for SolVec
 */
export class AnchorClient {
  readonly connection: Connection;
  readonly network: Network;
  private wallet?: Keypair;
  private provider?: anchor.AnchorProvider;

  constructor(network: Network, wallet?: Keypair, rpcUrl?: string) {
    this.network = network;
    this.connection = new Connection(rpcUrl ?? RPC_URLS[network], "confirmed");
    this.wallet = wallet;

    if (wallet) {
      const anchorWallet = new anchor.Wallet(wallet);
      this.provider = new anchor.AnchorProvider(this.connection, anchorWallet, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      });
    }
  }

  /**
   * Derive the Collection PDA for a given owner and collection name
   */
  getCollectionPDA(ownerPubkey: PublicKey, collectionName: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("collection"),
        ownerPubkey.toBuffer(),
        Buffer.from(collectionName),
      ],
      SOLVEC_PROGRAM_ID,
    );
    return pda;
  }

  /**
   * Post a Merkle root update to Solana
   * Called after every upsert or delete operation
   * Returns the transaction signature
   */
  async updateMerkleRoot(
    collectionName: string,
    merkleRootHex: string,
    vectorCount: number,
  ): Promise<{ signature: string; explorerUrl: string }> {
    if (!this.wallet || !this.provider) {
      throw new Error("Wallet required for on-chain operations");
    }

    const rootBytes = Buffer.from(merkleRootHex, "hex");
    if (rootBytes.length !== 32) {
      throw new Error(
        `Invalid Merkle root: expected 32 bytes, got ${rootBytes.length}`,
      );
    }

    const rootArray = Array.from(rootBytes);
    const collectionPDA = this.getCollectionPDA(
      this.wallet.publicKey,
      collectionName,
    );

    const discriminator = getDiscriminator("update_merkle_root");

    const rootBuffer = Buffer.from(rootArray);
    const countBuffer = Buffer.alloc(8);
    countBuffer.writeBigUInt64LE(BigInt(vectorCount));

    const data = Buffer.concat([discriminator, rootBuffer, countBuffer]);

    const instruction = new anchor.web3.TransactionInstruction({
      keys: [
        { pubkey: collectionPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      programId: SOLVEC_PROGRAM_ID,
      data,
    });

    const transaction = new anchor.web3.Transaction().add(instruction);
    const signature = await anchor.web3.sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet],
      { commitment: "confirmed" },
    );

    const cluster = this.network === "devnet" ? "?cluster=devnet" : "";
    const explorerUrl = `https://explorer.solana.com/tx/${signature}${cluster}`;

    console.log(`[SolVec] Merkle root posted on-chain. Tx: ${signature}`);
    console.log(`[SolVec] Explorer: ${explorerUrl}`);

    return { signature, explorerUrl };
  }

  /**
   * Fetch the current on-chain Merkle root for a collection
   * Returns hex string of the 32-byte root
   */
  async fetchOnChainRoot(
    ownerPubkey: PublicKey,
    collectionName: string,
  ): Promise<{ root: string; vectorCount: number; lastUpdated: number }> {
    const collectionPDA = this.getCollectionPDA(ownerPubkey, collectionName);
    const accountInfo = await this.connection.getAccountInfo(collectionPDA);

    if (!accountInfo) {
      throw new Error(
        `Collection '${collectionName}' not found on-chain. ` +
          `Call createCollection() first.`,
      );
    }

    const data = accountInfo.data;
    let offset = 8;

    offset += 32;

    const nameLen = data.readUInt32LE(offset);
    offset += 4 + nameLen;

    offset += 4;
    offset += 1;

    const vectorCount = Number(data.readBigUInt64LE(offset));
    offset += 8;

    const merkleRootBytes = data.slice(offset, offset + 32);
    const merkleRootHex = merkleRootBytes.toString("hex");
    offset += 32;

    offset += 8;
    const lastUpdated = Number(data.readBigInt64LE(offset));

    return {
      root: merkleRootHex,
      vectorCount,
      lastUpdated,
    };
  }

  /**
   * Create a new collection on-chain
   * Only needs to be called once per collection
   */
  async createCollection(
    collectionName: string,
    dimensions: number,
    metric: number = 0,
  ): Promise<{ signature: string; pda: string }> {
    if (!this.wallet || !this.provider) {
      throw new Error("Wallet required to create a collection");
    }

    const collectionPDA = this.getCollectionPDA(
      this.wallet.publicKey,
      collectionName,
    );

    const existing = await this.connection.getAccountInfo(collectionPDA);
    if (existing) {
      console.log(
        `[SolVec] Collection '${collectionName}' already exists on-chain`,
      );
      return {
        signature: "already-exists",
        pda: collectionPDA.toString(),
      };
    }

    const discriminator = getDiscriminator("create_collection");

    const nameBytes = Buffer.from(collectionName);
    const nameLenBuffer = Buffer.alloc(4);
    nameLenBuffer.writeUInt32LE(nameBytes.length);

    const dimBuffer = Buffer.alloc(4);
    dimBuffer.writeUInt32LE(dimensions);

    const metricBuffer = Buffer.alloc(1);
    metricBuffer.writeUInt8(metric);

    const data = Buffer.concat([
      discriminator,
      nameLenBuffer,
      nameBytes,
      dimBuffer,
      metricBuffer,
    ]);

    const instruction = new anchor.web3.TransactionInstruction({
      keys: [
        { pubkey: collectionPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: SOLVEC_PROGRAM_ID,
      data,
    });

    const transaction = new anchor.web3.Transaction().add(instruction);
    const signature = await anchor.web3.sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet],
      { commitment: "confirmed" },
    );

    console.log(`[SolVec] Collection '${collectionName}' created on-chain`);
    console.log(`[SolVec] PDA: ${collectionPDA.toString()}`);

    return {
      signature,
      pda: collectionPDA.toString(),
    };
  }

  get walletPublicKey(): PublicKey | undefined {
    return this.wallet?.publicKey;
  }

  isConnected(): boolean {
    return this.wallet != null;
  }
}
