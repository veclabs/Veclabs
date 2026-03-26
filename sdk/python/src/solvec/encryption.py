"""
AES-256-GCM encryption for Recall vector collections.

All vectors and metadata are encrypted before being stored to disk.
Zero plaintext ever touches the filesystem.

Key derivation: PBKDF2-HMAC-SHA256 with 600,000 iterations (OWASP 2023 recommendation).
Encryption: AES-256-GCM with a random 96-bit nonce per ciphertext.
Format: salt (16 bytes) + nonce (12 bytes) + ciphertext + tag (16 bytes)

Phase 4 feature.
"""
from __future__ import annotations

import os
import json
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


_ITERATIONS = 600_000
_KEY_LENGTH = 32
_SALT_LENGTH = 16
_NONCE_LENGTH = 12


def derive_key(passphrase: str, salt: bytes) -> bytes:
    """
    Derive a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256.

    Args:
        passphrase: User-provided passphrase (never stored)
        salt: Random 16-byte salt (stored alongside ciphertext)

    Returns:
        32-byte AES-256 key
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=_KEY_LENGTH,
        salt=salt,
        iterations=_ITERATIONS,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def generate_salt() -> bytes:
    """Generate a cryptographically random 16-byte salt."""
    return os.urandom(_SALT_LENGTH)


def encrypt(data: bytes, key: bytes) -> bytes:
    """
    Encrypt data using AES-256-GCM.

    Format: nonce (12 bytes) || ciphertext+tag

    Args:
        data: Plaintext bytes to encrypt
        key: 32-byte AES key (from derive_key)

    Returns:
        nonce + ciphertext bytes (nonce prepended for storage)
    """
    nonce = os.urandom(_NONCE_LENGTH)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext


def decrypt(data: bytes, key: bytes) -> bytes:
    """
    Decrypt AES-256-GCM ciphertext.

    Expects format: nonce (12 bytes) || ciphertext+tag

    Args:
        data: nonce + ciphertext bytes
        key: 32-byte AES key

    Returns:
        Plaintext bytes

    Raises:
        cryptography.exceptions.InvalidTag: If data was tampered with
    """
    nonce = data[:_NONCE_LENGTH]
    ciphertext = data[_NONCE_LENGTH:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)


def encrypt_json(obj: Any, key: bytes) -> bytes:
    """Serialize obj to JSON and encrypt it."""
    plaintext = json.dumps(obj, separators=(",", ":")).encode("utf-8")
    return encrypt(plaintext, key)


def decrypt_json(data: bytes, key: bytes) -> Any:
    """Decrypt and deserialize JSON."""
    plaintext = decrypt(data, key)
    return json.loads(plaintext.decode("utf-8"))


def encrypt_vector(values: list[float], key: bytes) -> bytes:
    """
    Encrypt a float32 vector.

    Serializes as JSON array for portability.
    """
    return encrypt_json(values, key)


def decrypt_vector(data: bytes, key: bytes) -> list[float]:
    """Decrypt a float32 vector."""
    return decrypt_json(data, key)
