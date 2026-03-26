import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const VECLABS_DIR = path.join(process.cwd(), '.veclabs');

function cleanVeclabsDir() {
  if (fs.existsSync(VECLABS_DIR)) {
    fs.rmSync(VECLABS_DIR, { recursive: true, force: true });
  }
}

// --- Mock @shadow-drive/sdk ---
const mockUploadFile = jest.fn().mockResolvedValue({ finalized_locations: [], message: 'ok', upload_errors: [] });
const mockGetStorageAccounts = jest.fn().mockResolvedValue([]);
const mockCreateStorageAccount = jest.fn().mockResolvedValue({ shdw_bucket: '11111111111111111111111111111111', transaction_signature: 'sig' });
const mockInit = jest.fn();

jest.mock('@shadow-drive/sdk', () => {
  return {
    ShdwDrive: jest.fn().mockImplementation(() => ({
      init: mockInit,
      uploadFile: mockUploadFile,
      getStorageAccounts: mockGetStorageAccounts,
      createStorageAccount: mockCreateStorageAccount,
    })),
  };
});

// mockInit returns the instance itself (chained after init())
mockInit.mockImplementation(function (this: any) {
  return Promise.resolve(this);
});

import { Keypair } from '@solana/web3.js';
import { ShadowDriveClient } from '../shadow-drive';
import { SolVec } from '../client';

function makeKeypair() {
  return Keypair.generate();
}

function buildEncryptedBuffer(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>): Buffer {
  const payload = JSON.stringify({ version: 1, name: 'test', dimensions: 3, metric: 'cosine', vectors });
  const key = crypto.createHash('sha256').update('dev-default-key-veclabs-phase4').digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

describe('ShadowDriveClient', () => {
  beforeEach(() => {
    cleanVeclabsDir();
    jest.clearAllMocks();
    mockInit.mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });
    mockGetStorageAccounts.mockResolvedValue([]);
    mockCreateStorageAccount.mockResolvedValue({
      shdw_bucket: '11111111111111111111111111111111',
      transaction_signature: 'sig',
    });
    mockUploadFile.mockResolvedValue({ finalized_locations: [], message: 'ok', upload_errors: [] });
  });

  afterAll(cleanVeclabsDir);

  it('initializes and sets available=true when Shadow Drive succeeds', async () => {
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    expect(client.available).toBe(true);
  });

  it('sets available=false when Shadow Drive init throws', async () => {
    mockInit.mockRejectedValueOnce(new Error('network unavailable'));
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    expect(client.available).toBe(false);
  });

  it('uploadCollection calls uploadFile with correct file name', async () => {
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    const buf = Buffer.from('test-data');
    await client.uploadCollection('my-collection', buf);
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    const [, fileArg] = mockUploadFile.mock.calls[0];
    expect(fileArg.name).toBe('my-collection.db');
    expect(fileArg.file).toBe(buf);
  });

  it('uploadCollection silently returns when available=false', async () => {
    mockInit.mockRejectedValueOnce(new Error('offline'));
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    expect(client.available).toBe(false);
    await expect(client.uploadCollection('x', Buffer.from('data'))).resolves.toBeUndefined();
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it('uploadCollection does not throw when uploadFile rejects', async () => {
    mockUploadFile.mockRejectedValueOnce(new Error('upload error'));
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    await expect(client.uploadCollection('col', Buffer.from('x'))).resolves.toBeUndefined();
  });

  it('downloadCollection returns null when available=false', async () => {
    mockInit.mockRejectedValueOnce(new Error('offline'));
    const client = new ShadowDriveClient(makeKeypair(), 'devnet');
    await client.initialize();
    const result = await client.downloadCollection('col');
    expect(result).toBeNull();
  });
});

describe('SolVec: Shadow Drive integration via collection', () => {
  beforeEach(() => {
    cleanVeclabsDir();
    jest.clearAllMocks();
    mockInit.mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });
    mockGetStorageAccounts.mockResolvedValue([]);
    mockCreateStorageAccount.mockResolvedValue({
      shdw_bucket: '11111111111111111111111111111111',
      transaction_signature: 'sig',
    });
    mockUploadFile.mockResolvedValue({ finalized_locations: [], message: 'ok', upload_errors: [] });
  });

  afterAll(cleanVeclabsDir);

  it('uploadCollection NOT called when no shadowDrive client set', async () => {
    const sv = new SolVec({ network: 'devnet' });
    const col = sv.collection('no-shadow', { dimensions: 3 });
    await col.upsert([{ id: 'a', values: [1, 0, 0] }]);
    // Allow microtasks to flush
    await new Promise((r) => setImmediate(r));
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it('upsert does NOT throw or block when uploadFile rejects', async () => {
    mockUploadFile.mockRejectedValue(new Error('shadow error'));

    const keypair = makeKeypair();
    const keypairPath = path.join(VECLABS_DIR, 'test-keypair.json');
    fs.mkdirSync(VECLABS_DIR, { recursive: true });
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));

    const sv = new SolVec({ network: 'devnet', walletPath: keypairPath, shadowDrive: true });
    const col = sv.collection('shadow-err-test', { dimensions: 3 });

    await expect(col.upsert([{ id: 'a', values: [1, 0, 0] }])).resolves.toMatchObject({ upsertedCount: 1 });
    // Allow fire-and-forget to settle
    await new Promise((r) => setImmediate(r));
  });

  it('restoreFromShadowDrive returns false when no client set', async () => {
    const sv = new SolVec({ network: 'devnet' });
    const col = sv.collection('restore-no-client', { dimensions: 3 });
    const result = await col.restoreFromShadowDrive();
    expect(result).toBe(false);
  });

  it('restoreFromShadowDrive loads vectors when downloadCollection returns data', async () => {
    const encrypted = buildEncryptedBuffer([
      { id: 'sd1', values: [1, 0, 0] },
      { id: 'sd2', values: [0, 1, 0] },
    ]);

    // Make downloadCollection return our encrypted buffer via fetch mock
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(encrypted.buffer.slice(encrypted.byteOffset, encrypted.byteOffset + encrypted.byteLength)),
    } as any);

    const keypair = makeKeypair();
    const keypairPath = path.join(VECLABS_DIR, 'restore-keypair.json');
    fs.mkdirSync(VECLABS_DIR, { recursive: true });
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));

    const sv = new SolVec({ network: 'devnet', walletPath: keypairPath, shadowDrive: true });
    // Wait for shadow drive init
    await (sv as any).shadowDriveReady;

    const col = sv.collection('restore-test', { dimensions: 3 });
    const restored = await col.restoreFromShadowDrive();

    expect(restored).toBe(true);
    const stats = await col.describeIndexStats();
    expect(stats.vectorCount).toBe(2);

    const { matches } = await col.query({ vector: [1, 0, 0], topK: 2 });
    expect(matches.map((m) => m.id)).toContain('sd1');
  });
});
