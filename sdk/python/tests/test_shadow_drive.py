"""Tests for Shadow Drive integration - Phase 5 (mocked)."""
import pytest
from unittest.mock import patch, AsyncMock
from solvec import SolVec
from solvec.types import ShadowDriveConfig


def test_serialize_snapshot_returns_bytes():
    sv = SolVec()
    col = sv.collection("snap-test", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    snapshot = col._serialize_snapshot()
    assert isinstance(snapshot, bytes)
    assert len(snapshot) > 0


def test_serialize_snapshot_contains_collection_name():
    sv = SolVec()
    col = sv.collection("my-collection", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    snapshot = col._serialize_snapshot()
    assert b"my-collection" in snapshot


def test_shadow_drive_disabled_by_default():
    sv = SolVec()
    col = sv.collection("test", dimensions=2)
    assert col._shadow_drive.enabled is False


def test_write_count_increments():
    sv = SolVec()
    col = sv.collection("counter", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    col.upsert([{"id": "b", "values": [3.0, 4.0]}])
    assert col._write_count == 2
