"""Tests for AES-256-GCM encryption module - Phase 4."""
import pytest
from solvec.encryption import (
    derive_key, generate_salt, encrypt, decrypt,
    encrypt_json, decrypt_json, encrypt_vector, decrypt_vector,
)


def test_generate_salt_length():
    salt = generate_salt()
    assert len(salt) == 16


def test_generate_salt_unique():
    assert generate_salt() != generate_salt()


def test_derive_key_length():
    key = derive_key("passphrase", generate_salt())
    assert len(key) == 32


def test_derive_key_deterministic():
    salt = generate_salt()
    assert derive_key("pass", salt) == derive_key("pass", salt)


def test_encrypt_decrypt_roundtrip():
    key = derive_key("test-pass", generate_salt())
    data = b"hello world"
    assert decrypt(encrypt(data, key), key) == data


def test_encrypt_json_roundtrip():
    key = derive_key("test-pass", generate_salt())
    obj = {"id": "mem_001", "values": [0.1, 0.2, 0.3], "meta": {"x": 1}}
    assert decrypt_json(encrypt_json(obj, key), key) == obj


def test_encrypt_vector_roundtrip():
    key = derive_key("test-pass", generate_salt())
    vec = [0.42, 0.87, 0.13, 0.55]
    assert decrypt_vector(encrypt_vector(vec, key), key) == vec


def test_decrypt_tampered_raises():
    key = derive_key("test-pass", generate_salt())
    ciphertext = bytearray(encrypt(b"secret", key))
    ciphertext[-1] ^= 0xFF
    with pytest.raises(Exception):
        decrypt(bytes(ciphertext), key)
