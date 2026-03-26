/**
 * AES-256-GCM encryption helpers for Recall vector collections.
 *
 * Key derivation: PBKDF2-HMAC-SHA256 with 600,000 iterations (OWASP 2023).
 * Encryption: AES-256-GCM with a random 96-bit nonce per ciphertext.
 * Ciphertext format: nonce (12 bytes) || ciphertext+tag
 *
 * MIGRATION NOTE: Data encrypted with the old SHA-256(passphrase) key
 * derivation used in _deriveKey() (collection-level disk persistence) is
 * not compatible with this PBKDF2 implementation. Users must re-encrypt
 * existing collections after upgrading to EncryptionConfig.
 *
 * Phase 4 feature.
 */
import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ITERATIONS = 600_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derive a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256.
 *
 * @param passphrase - User-provided passphrase (never stored)
 * @param salt - Random 16-byte salt (stored alongside ciphertext)
 * @returns 32-byte AES-256 key
 */
export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Generate a cryptographically random 16-byte salt.
 */
export function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

/**
 * Encrypt data using AES-256-GCM.
 *
 * Format: nonce (12 bytes) || ciphertext+tag
 *
 * @param data - Plaintext bytes
 * @param key - 32-byte AES key (from deriveKey)
 * @returns nonce + ciphertext bytes
 */
export function encrypt(data: Buffer, key: Buffer): Buffer {
  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ciphertext, tag]);
}

/**
 * Decrypt AES-256-GCM ciphertext.
 *
 * Expects format: nonce (12 bytes) || ciphertext+tag
 *
 * @param data - nonce + ciphertext bytes
 * @param key - 32-byte AES key
 * @returns Plaintext bytes
 * @throws If data was tampered with (auth tag mismatch)
 */
export function decrypt(data: Buffer, key: Buffer): Buffer {
  const nonce = data.slice(0, NONCE_LENGTH);
  const tag = data.slice(data.length - TAG_LENGTH);
  const ciphertext = data.slice(NONCE_LENGTH, data.length - TAG_LENGTH);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Serialize obj to JSON and encrypt it.
 */
export function encryptJson(obj: unknown, key: Buffer): Buffer {
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  return encrypt(plaintext, key);
}

/**
 * Decrypt and deserialize JSON.
 */
export function decryptJson(data: Buffer, key: Buffer): unknown {
  const plaintext = decrypt(data, key);
  return JSON.parse(plaintext.toString('utf8'));
}
