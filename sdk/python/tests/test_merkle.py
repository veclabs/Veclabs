"""Tests for Merkle root computation — Phase 2."""
import pytest
from solvec.merkle import compute_merkle_root


def test_empty_returns_empty_string():
    assert compute_merkle_root([]) == "0" * 64


def test_single_id_returns_hash():
    root = compute_merkle_root(["mem_001"])
    assert len(root) == 64  # hex SHA-256


def test_deterministic_same_input():
    ids = ["mem_001", "mem_002", "mem_003"]
    assert compute_merkle_root(ids) == compute_merkle_root(ids)


def test_order_independent():
    ids = ["mem_001", "mem_002", "mem_003"]
    assert compute_merkle_root(ids) == compute_merkle_root(list(reversed(ids)))


def test_different_ids_different_root():
    assert compute_merkle_root(["a", "b"]) != compute_merkle_root(["a", "c"])


def test_adding_id_changes_root():
    root_before = compute_merkle_root(["a", "b"])
    root_after = compute_merkle_root(["a", "b", "c"])
    assert root_before != root_after
