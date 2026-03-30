"""Tests for hosted API key mode — Phase 8."""
import pytest
from unittest.mock import patch, MagicMock
from solvec import SolVec, HostedConfig
from solvec.types import DistanceMetric


def test_hosted_mode_initializes_with_api_key():
    sv = SolVec(api_key="vl_live_test123")
    assert sv._mode == 'hosted'
    assert sv._hosted.api_key == "vl_live_test123"
    assert sv._hosted.api_url == "https://api.veclabs.xyz"


def test_hosted_mode_custom_api_url():
    sv = SolVec(api_key="vl_live_test", api_url="http://localhost:3000")
    assert sv._hosted.api_url == "http://localhost:3000"


def test_self_hosted_mode_no_api_key():
    sv = SolVec(network="devnet")
    assert sv._mode == 'self-hosted'
    assert sv._hosted is None


def test_collection_has_hosted_config():
    sv = SolVec(api_key="vl_live_test123")
    col = sv.collection("test", dimensions=4)
    assert col._hosted is not None
    assert col._hosted.api_key == "vl_live_test123"


def test_collection_no_hosted_config_in_self_hosted():
    sv = SolVec(network="devnet")
    col = sv.collection("test", dimensions=4)
    assert col._hosted is None


def test_hosted_config_dataclass():
    config = HostedConfig(api_key="vl_live_abc")
    assert config.api_key == "vl_live_abc"
    assert config.api_url == "https://api.veclabs.xyz"


def test_hosted_config_custom_url():
    config = HostedConfig(api_key="vl_live_abc", api_url="http://localhost:3000")
    assert config.api_url == "http://localhost:3000"


@patch("httpx.Client")
def test_upsert_routes_to_hosted_api(mock_client):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.is_success = True
    mock_response.json.return_value = {"upsertedCount": 1, "merkleRoot": "abc123"}
    mock_client.return_value.__enter__.return_value.post.return_value = mock_response
    mock_client.return_value.__enter__.return_value.get.return_value = mock_response

    sv = SolVec(api_key="vl_live_test")
    col = sv.collection("test", dimensions=2)
    col._ensured_created = True  # skip ensure_created call

    result = col.upsert([{"id": "a", "values": [1.0, 2.0]}])
    assert result.upserted_count == 1
    assert result.merkle_root == "abc123"
