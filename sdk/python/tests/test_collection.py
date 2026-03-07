import pytest
from solvec import SolVec
from solvec.types import DistanceMetric


@pytest.fixture
def sv():
    return SolVec(network="devnet")


def test_create_collection(sv):
    col = sv.collection("test", dimensions=4)
    assert col is not None
    assert col.name == "test"
    assert col.dimensions == 4


def test_upsert_and_query(sv):
    col = sv.collection("test", dimensions=4)
    col.upsert([
        {"id": "a", "values": [1.0, 0.0, 0.0, 0.0], "metadata": {"text": "alpha"}},
        {"id": "b", "values": [0.9, 0.1, 0.0, 0.0], "metadata": {"text": "beta"}},
        {"id": "c", "values": [0.0, 1.0, 0.0, 0.0], "metadata": {"text": "gamma"}},
    ])
    response = col.query(vector=[1.0, 0.0, 0.0, 0.0], top_k=2)
    assert len(response.matches) == 2
    assert response.matches[0].id == "a"
    assert response.matches[0].score == pytest.approx(1.0, abs=1e-3)
    assert response.matches[0].score >= response.matches[1].score


def test_delete(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([
        {"id": "x", "values": [1.0, 0.0, 0.0]},
        {"id": "y", "values": [0.0, 1.0, 0.0]},
    ])
    col.delete(["x"])
    stats = col.describe_index_stats()
    assert stats.vector_count == 1
    response = col.query(vector=[1.0, 0.0, 0.0], top_k=5)
    assert not any(m.id == "x" for m in response.matches)


def test_dimension_mismatch_upsert(sv):
    col = sv.collection("test", dimensions=3)
    with pytest.raises(ValueError, match="Dimension mismatch"):
        col.upsert([{"id": "bad", "values": [1.0, 0.0]}])


def test_dimension_mismatch_query(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([{"id": "a", "values": [1.0, 0.0, 0.0]}])
    with pytest.raises(ValueError, match="dimension mismatch"):
        col.query(vector=[1.0, 0.0], top_k=1)


def test_empty_collection_returns_no_matches(sv):
    col = sv.collection("empty", dimensions=4)
    response = col.query(vector=[1.0, 0.0, 0.0, 0.0], top_k=5)
    assert len(response.matches) == 0


def test_upsert_updates_existing_id(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([{"id": "a", "values": [1.0, 0.0, 0.0]}])
    col.upsert([{"id": "a", "values": [0.0, 1.0, 0.0]}])
    stats = col.describe_index_stats()
    assert stats.vector_count == 1


def test_metadata_filter(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([
        {"id": "a", "values": [1.0, 0.0, 0.0], "metadata": {"type": "memory"}},
        {"id": "b", "values": [0.9, 0.1, 0.0], "metadata": {"type": "fact"}},
    ])
    response = col.query(
        vector=[1.0, 0.0, 0.0],
        top_k=5,
        filter={"type": "memory"}
    )
    assert all(m.metadata.get("type") == "memory" for m in response.matches)


def test_scores_sorted_descending(sv):
    col = sv.collection("test", dimensions=4)
    col.upsert([
        {"id": "a", "values": [1.0, 0.0, 0.0, 0.0]},
        {"id": "b", "values": [0.5, 0.5, 0.0, 0.0]},
        {"id": "c", "values": [0.0, 0.0, 1.0, 0.0]},
    ])
    response = col.query(vector=[1.0, 0.0, 0.0, 0.0], top_k=3)
    for i in range(len(response.matches) - 1):
        assert response.matches[i].score >= response.matches[i + 1].score


def test_verify_returns_valid_shape(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([{"id": "a", "values": [1.0, 0.0, 0.0]}])
    result = col.verify()
    assert hasattr(result, "verified")
    assert hasattr(result, "local_root")
    assert hasattr(result, "solana_explorer_url")
    assert result.vector_count == 1


def test_fetch_vectors(sv):
    col = sv.collection("test", dimensions=3)
    col.upsert([
        {"id": "a", "values": [1.0, 0.0, 0.0]},
        {"id": "b", "values": [0.0, 1.0, 0.0]},
    ])
    result = col.fetch(["a"])
    assert "a" in result["vectors"]
    assert result["vectors"]["a"]["values"] == [1.0, 0.0, 0.0]


def test_euclidean_metric(sv):
    col = sv.collection("euclidean-test", dimensions=3, metric="euclidean")
    col.upsert([
        {"id": "near", "values": [1.0, 0.1, 0.0]},
        {"id": "far", "values": [0.0, 0.0, 1.0]},
    ])
    response = col.query(vector=[1.0, 0.0, 0.0], top_k=2)
    assert response.matches[0].id == "near"
