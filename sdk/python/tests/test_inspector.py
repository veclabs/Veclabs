"""Tests for Memory Inspector — Phase 6."""
import pytest
import time
from solvec import SolVec, InspectorQuery, MemoryRecord, MerkleHistoryEntry


def make_collection(n: int = 10):
    """Create a collection with n vectors."""
    sv = SolVec()
    col = sv.collection("test", dimensions=4)
    records = [
        {"id": f"mem_{i:03d}", "values": [float(i), float(i+1), float(i+2), float(i+3)],
         "metadata": {"index": i, "tag": "even" if i % 2 == 0 else "odd"}}
        for i in range(n)
    ]
    col.upsert(records)
    return col


def test_inspector_returns_instance():
    col = make_collection()
    inspector = col.inspector()
    assert inspector is not None


def test_inspector_cached():
    col = make_collection()
    assert col.inspector() is col.inspector()


def test_stats_total_memories():
    col = make_collection(10)
    stats = col.inspector().stats()
    assert stats.total_memories == 10


def test_stats_dimensions():
    col = make_collection()
    assert col.inspector().stats().dimensions == 4


def test_stats_merkle_root_not_empty():
    col = make_collection()
    assert col.inspector().stats().current_merkle_root != ""


def test_stats_encrypted_false_by_default():
    col = make_collection()
    assert col.inspector().stats().encrypted is False


def test_inspect_no_filter_returns_all():
    col = make_collection(10)
    result = col.inspector().inspect()
    assert result.total_matching == 10


def test_inspect_limit():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(limit=3))
    assert len(result.memories) == 3


def test_inspect_offset():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(limit=5, offset=5))
    assert len(result.memories) == 5


def test_inspect_metadata_filter():
    col = make_collection(10)
    result = col.inspector().inspect(InspectorQuery(metadata_filter={"tag": "even"}))
    assert all(m.metadata["tag"] == "even" for m in result.memories)


def test_get_returns_record():
    col = make_collection(5)
    record = col.inspector().get("mem_000")
    assert record is not None
    assert record.id == "mem_000"


def test_get_returns_none_for_missing():
    col = make_collection(5)
    assert col.inspector().get("nonexistent") is None


def test_search_with_records_returns_k():
    col = make_collection(10)
    query = [1.0, 2.0, 3.0, 4.0]
    results = col.inspector().search_with_records(query, k=3)
    assert len(results) == 3


def test_search_with_records_sorted_descending():
    col = make_collection(10)
    query = [1.0, 2.0, 3.0, 4.0]
    results = col.inspector().search_with_records(query, k=5)
    scores = [r[0] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_merkle_history_grows_on_write():
    sv = SolVec()
    col = sv.collection("history-test", dimensions=2)
    col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    col.upsert([{"id": "b", "values": [3.0, 4.0]}])
    history = col.inspector().merkle_history()
    assert len(history) == 2


def test_merkle_history_trigger_is_write():
    sv = SolVec()
    col = sv.collection("trigger-test", dimensions=2)
    col.upsert([{"id": "x", "values": [1.0, 0.0]}])
    history = col.inspector().merkle_history()
    assert history[0].trigger == "write"


def test_written_at_nonzero():
    col = make_collection(3)
    record = col.inspector().get("mem_000")
    assert record.written_at > 0


def test_verify_structure():
    col = make_collection(3)
    proof = col.inspector().verify()
    assert "match" in proof
    assert "local_root" in proof
    assert "on_chain_root" in proof
