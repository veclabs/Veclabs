use solvec_core::{
    hnsw::HNSWIndex,
    merkle::MerkleTree,
    types::{DistanceMetric, Vector},
};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

// Initialize panic hook for better error messages in browser console
#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// WASM-exposed HNSW index
/// This is the class the TypeScript SDK instantiates
#[wasm_bindgen]
pub struct WasmHNSWIndex {
    inner: HNSWIndex,
}

#[wasm_bindgen]
impl WasmHNSWIndex {
    /// Create a new HNSW index
    /// metric: 0 = cosine, 1 = euclidean, 2 = dot_product
    #[wasm_bindgen(constructor)]
    pub fn new(m: usize, ef_construction: usize, metric: u8) -> Result<WasmHNSWIndex, JsValue> {
        let dist_metric = match metric {
            0 => DistanceMetric::Cosine,
            1 => DistanceMetric::Euclidean,
            2 => DistanceMetric::DotProduct,
            _ => return Err(JsValue::from_str("Invalid metric: use 0=cosine, 1=euclidean, 2=dot")),
        };

        Ok(WasmHNSWIndex {
            inner: HNSWIndex::new(m, ef_construction, dist_metric),
        })
    }

    /// Create with default parameters (M=16, ef=200, cosine)
    #[wasm_bindgen(js_name = "defaultCosine")]
    pub fn default_cosine() -> WasmHNSWIndex {
        WasmHNSWIndex {
            inner: HNSWIndex::default_cosine(),
        }
    }

    /// Insert a vector
    /// values_ptr: Float32Array passed from TypeScript
    /// metadata_json: JSON string of metadata object
    #[wasm_bindgen]
    pub fn insert(
        &mut self,
        id: &str,
        values: &[f32],
        metadata_json: &str,
    ) -> Result<(), JsValue> {
        let metadata: HashMap<String, serde_json::Value> =
            serde_json::from_str(metadata_json).unwrap_or_default();

        let vector = Vector::with_metadata(id, values.to_vec(), metadata);
        self.inner
            .insert(vector)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Query for nearest neighbors
    /// Returns JSON string: Array<{ id: string, score: number, metadata: object }>
    #[wasm_bindgen]
    pub fn query(&self, values: &[f32], top_k: usize) -> Result<String, JsValue> {
        let results = self
            .inner
            .query(values, top_k)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let output: Vec<serde_json::Value> = results
            .into_iter()
            .map(|r| {
                serde_json::json!({
                    "id": r.id,
                    "score": r.score,
                    "metadata": r.metadata,
                })
            })
            .collect();

        serde_json::to_string(&output)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Delete a vector by ID
    #[wasm_bindgen]
    pub fn delete(&mut self, id: &str) -> Result<(), JsValue> {
        self.inner
            .delete(id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Check if a vector ID exists
    #[wasm_bindgen]
    pub fn contains(&self, id: &str) -> bool {
        self.inner.contains_id(id)
    }

    /// Number of vectors in the index
    #[wasm_bindgen]
    pub fn len(&self) -> usize {
        self.inner.len()
    }

    /// Whether the index is empty
    #[wasm_bindgen(js_name = "isEmpty")]
    pub fn is_empty(&self) -> bool {
        self.inner.is_empty()
    }

    /// Serialize the entire index to JSON string (for persistence)
    #[wasm_bindgen(js_name = "toJson")]
    pub fn to_json(&self) -> Result<String, JsValue> {
        self.inner
            .to_json()
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Deserialize an index from JSON string
    #[wasm_bindgen(js_name = "fromJson")]
    pub fn from_json(json: &str) -> Result<WasmHNSWIndex, JsValue> {
        let inner = HNSWIndex::from_json(json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(WasmHNSWIndex { inner })
    }

    /// Set ef_search parameter (controls recall vs speed tradeoff)
    /// Higher ef_search = better recall, slower queries
    #[wasm_bindgen(js_name = "setEfSearch")]
    pub fn set_ef_search(&mut self, ef: usize) {
        self.inner.set_ef_search(ef);
    }

    /// Get index statistics as JSON string
    #[wasm_bindgen]
    pub fn stats(&self) -> String {
        let s = self.inner.stats();
        serde_json::to_string(&s).unwrap_or_default()
    }
}

/// Compute Merkle root from a list of vector IDs
/// This ensures the WASM and on-chain roots always match
/// ids_json: JSON array of string IDs
#[wasm_bindgen(js_name = "computeMerkleRoot")]
pub fn compute_merkle_root(ids_json: &str) -> Result<String, JsValue> {
    let ids: Vec<String> = serde_json::from_str(ids_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let tree = MerkleTree::new(&ids);
    Ok(tree.root_hex())
}

/// Verify a Merkle proof
/// proof_json: JSON of MerkleProof struct
/// expected_root_hex: hex string of expected root
#[wasm_bindgen(js_name = "verifyMerkleProof")]
pub fn verify_merkle_proof(proof_json: &str, expected_root_hex: &str) -> Result<bool, JsValue> {
    let proof: solvec_core::merkle::MerkleProof = serde_json::from_str(proof_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let root_bytes = hex::decode(expected_root_hex)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let mut root = [0u8; 32];
    root.copy_from_slice(&root_bytes);

    Ok(proof.verify(&root))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wasm_index_basic() {
        let mut idx = WasmHNSWIndex::new(16, 200, 0).unwrap();
        idx.insert("a", &[1.0, 0.0, 0.0], "{}").unwrap();
        idx.insert("b", &[0.9, 0.1, 0.0], "{}").unwrap();
        idx.insert("c", &[0.0, 1.0, 0.0], "{}").unwrap();

        let results_json = idx.query(&[1.0, 0.0, 0.0], 2).unwrap();
        let results: Vec<serde_json::Value> = serde_json::from_str(&results_json).unwrap();

        assert_eq!(results.len(), 2);
        assert_eq!(results[0]["id"], "a");
    }

    #[test]
    fn test_wasm_serialization() {
        let mut idx = WasmHNSWIndex::default_cosine();
        for i in 0..10 {
            idx.insert(&format!("v{}", i), &[i as f32, 0.0, 0.0], "{}").unwrap();
        }

        let json = idx.to_json().unwrap();
        let restored = WasmHNSWIndex::from_json(&json).unwrap();
        assert_eq!(restored.len(), 10);
    }

    #[test]
    fn test_merkle_root_computation() {
        let ids = serde_json::json!(["vec_1", "vec_2", "vec_3"]).to_string();
        let root = compute_merkle_root(&ids).unwrap();
        assert_eq!(root.len(), 64); // 32 bytes = 64 hex chars
        assert_ne!(root, "0".repeat(64));
    }

    #[test]
    fn test_delete() {
        let mut idx = WasmHNSWIndex::default_cosine();
        idx.insert("a", &[1.0, 0.0, 0.0], "{}").unwrap();
        idx.insert("b", &[0.0, 1.0, 0.0], "{}").unwrap();
        idx.delete("a").unwrap();
        assert_eq!(idx.len(), 1);
    }
}
