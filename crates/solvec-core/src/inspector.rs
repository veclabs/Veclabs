use serde::{Deserialize, Serialize};

/// A single memory record as returned by the inspector
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRecord {
    pub id: String,
    pub vector: Vec<f32>,
    pub metadata: serde_json::Value,
    pub written_at: u64,
    pub merkle_root_at_write: String,
    pub hnsw_layer: usize,
    pub neighbor_count: usize,
    #[serde(default)]
    pub edge_types: Vec<Vec<u8>>,
}

/// Summary statistics for a collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionStats {
    pub total_memories: usize,
    pub dimensions: usize,
    pub current_merkle_root: String,
    pub on_chain_root: String,
    pub roots_match: bool,
    pub last_write_at: u64,
    pub last_chain_sync_at: u64,
    pub hnsw_layer_count: usize,
    pub memory_usage_bytes: usize,
    pub encrypted: bool,
}

/// A query to filter memories in the inspector
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InspectorQuery {
    pub metadata_filter: Option<serde_json::Value>,
    pub written_after: Option<u64>,
    pub written_before: Option<u64>,
    pub hnsw_layer: Option<usize>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Full inspection result for a collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InspectionResult {
    pub stats: CollectionStats,
    pub memories: Vec<MemoryRecord>,
    pub total_matching: usize,
}

/// A single Merkle history entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleHistoryEntry {
    pub root: String,
    pub timestamp: u64,
    pub memory_count_at_time: usize,
    pub trigger: String,
}
