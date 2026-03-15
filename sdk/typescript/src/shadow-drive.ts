import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const ACCOUNT_FILE = path.join(process.cwd(), '.veclabs', 'shadow-account.json');
const STORAGE_NAME = 'veclabs';
const STORAGE_SIZE = '10MB';
const SHDW_DRIVE_URL = 'https://shdw-drive.genesysgo.net';

function makeWalletAdapter(keypair: Keypair) {
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: Transaction): Promise<Transaction> => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]): Promise<Transaction[]> => {
      return txs.map((tx) => {
        tx.partialSign(keypair);
        return tx;
      });
    },
  };
}

export class ShadowDriveClient {
  available = false;

  private keypair: Keypair;
  private network: 'devnet' | 'mainnet-beta';
  private accountPubkey?: PublicKey;
  private drive?: any;

  constructor(keypair: Keypair, network: 'devnet' | 'mainnet-beta') {
    this.keypair = keypair;
    this.network = network;
  }

  async initialize(): Promise<void> {
    try {
      const { ShdwDrive } = await import('@shadow-drive/sdk');
      const rpcUrl =
        this.network === 'mainnet-beta'
          ? 'https://api.mainnet-beta.solana.com'
          : 'https://api.devnet.solana.com';

      const connection = new Connection(rpcUrl, 'confirmed');
      const wallet = makeWalletAdapter(this.keypair);
      const drive = await new ShdwDrive(connection, wallet).init();
      this.drive = drive;

      this.accountPubkey = await this._resolveAccount();
      this.available = true;
    } catch (e: any) {
      console.warn(`[SolVec] Shadow Drive unavailable: ${e?.message ?? e}`);
      this.available = false;
    }
  }

  private async _resolveAccount(): Promise<PublicKey> {
    if (fs.existsSync(ACCOUNT_FILE)) {
      const saved = JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf-8'));
      return new PublicKey(saved.pubkey);
    }

    const existing: Array<{ publicKey: PublicKey; account: { identifier: string } }> =
      await this.drive.getStorageAccounts();

    const match = existing.find((a) => a.account.identifier === STORAGE_NAME);
    if (match) {
      this._saveAccount(match.publicKey);
      return match.publicKey;
    }

    const res = await this.drive.createStorageAccount(STORAGE_NAME, STORAGE_SIZE);
    const pubkey = new PublicKey(res.shdw_bucket);
    this._saveAccount(pubkey);
    return pubkey;
  }

  private _saveAccount(pubkey: PublicKey): void {
    fs.mkdirSync(path.dirname(ACCOUNT_FILE), { recursive: true });
    fs.writeFileSync(ACCOUNT_FILE, JSON.stringify({ pubkey: pubkey.toString() }));
  }

  async uploadCollection(name: string, data: Buffer): Promise<void> {
    if (!this.available || !this.accountPubkey) return;

    try {
      const file = { name: `${name}.db`, file: data };
      await this.drive.uploadFile(this.accountPubkey, file, true);
    } catch (e: any) {
      console.warn(`[SolVec] Shadow Drive upload failed for '${name}': ${e?.message ?? e}`);
    }
  }

  async downloadCollection(name: string): Promise<Buffer | null> {
    if (!this.available || !this.accountPubkey) return null;

    try {
      const url = `${SHDW_DRIVE_URL}/${this.accountPubkey.toString()}/${name}.db`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    } catch (e: any) {
      console.warn(`[SolVec] Shadow Drive download failed for '${name}': ${e?.message ?? e}`);
      return null;
    }
  }
}
