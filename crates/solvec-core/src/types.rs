use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

/// A single vector with its ID and optional metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vector {
    pub id: String,
    pub values: Vec<f32>,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl Vector {
    pub fn new(id: impl Into<String>, values: Vec<f32>) -> Self {
        Self {
            id: id.into(),
            values,
            metadata: HashMap::new(),
        }
    }

    pub fn with_metadata(
        id: impl Into<String>,
        values: Vec<f32>,
        metadata: HashMap<String, serde_json::Value>,
    ) -> Self {
        Self {
            id: id.into(),
            values,
            metadata,
        }
    }

    pub fn dimension(&self) -> usize {
        self.values.len()
    }

    pub fn validate(&self) -> Result<(), SolVecError> {
        if self.id.is_empty() {
            return Err(SolVecError::InvalidVector("Vector ID cannot be empty".into()));
        }
        if self.values.is_empty() {
            return Err(SolVecError::InvalidVector("Vector values cannot be empty".into()));
        }
        if self.values.iter().any(|v| v.is_nan() || v.is_infinite()) {
            return Err(SolVecError::InvalidVector(
                "Vector contains NaN or infinite values".into(),
            ));
        }
        Ok(())
    }
}

/// Query result returned from HNSW search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub id: String,
    pub score: f32,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl QueryResult {
    pub fn new(id: String, score: f32, metadata: HashMap<String, serde_json::Value>) -> Self {
        Self { id, score, metadata }
    }
}

/// Distance metric options for vector similarity
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum DistanceMetric {
    Cosine,
    Euclidean,
    DotProduct,
}

impl Default for DistanceMetric {
    fn default() -> Self {
        DistanceMetric::Cosine
    }
}

impl std::fmt::Display for DistanceMetric {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DistanceMetric::Cosine => write!(f, "cosine"),
            DistanceMetric::Euclidean => write!(f, "euclidean"),
            DistanceMetric::DotProduct => write!(f, "dot_product"),
        }
    }
}

/// Collection configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub name: String,
    pub dimension: usize,
    pub metric: DistanceMetric,
    pub vector_count: usize,
    pub created_at: u64,
}

impl Collection {
    pub fn new(name: impl Into<String>, dimension: usize, metric: DistanceMetric) -> Self {
        let created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        Self {
            name: name.into(),
            dimension,
            metric,
            vector_count: 0,
            created_at,
        }
    }
}

/// All errors that can occur in solvec-core
#[derive(Error, Debug)]
pub enum SolVecError {
    #[error("Invalid vector: {0}")]
    InvalidVector(String),

    #[error("Dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch { expected: usize, actual: usize },

    #[error("Vector not found: {0}")]
    VectorNotFound(String),

    #[error("Index is empty")]
    EmptyIndex,

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Decryption error: {0}")]
    DecryptionError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Invalid top_k: must be >= 1, got {0}")]
    InvalidTopK(usize),
}
