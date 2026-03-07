from typing import Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class DistanceMetric(str, Enum):
    COSINE = "cosine"
    EUCLIDEAN = "euclidean"
    DOT = "dot"


@dataclass
class UpsertRecord:
    id: str
    values: list[float]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class QueryMatch:
    id: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)
    values: Optional[list[float]] = None


@dataclass
class QueryResponse:
    matches: list[QueryMatch]
    namespace: str


@dataclass
class UpsertResponse:
    upserted_count: int


@dataclass
class CollectionStats:
    vector_count: int
    dimension: int
    metric: DistanceMetric
    name: str
    merkle_root: str
    last_updated: int
    is_frozen: bool


@dataclass
class VerificationResult:
    verified: bool
    on_chain_root: str
    local_root: str
    match: bool
    vector_count: int
    solana_explorer_url: str
    timestamp: int
