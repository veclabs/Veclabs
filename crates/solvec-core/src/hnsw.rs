use crate::distance;
use crate::types::{DistanceMetric, QueryResult, SolVecError, Vector};
use ahash::AHashMap;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashSet};

#[derive(Debug, Clone)]
struct Candidate {
    id: String,
    score: f32,
}

impl PartialEq for Candidate {
    fn eq(&self, other: &Self) -> bool {
        self.score == other.score
    }
}
impl Eq for Candidate {}

impl PartialOrd for Candidate {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Candidate {
    fn cmp(&self, other: &Self) -> Ordering {
        self.score
            .partial_cmp(&other.score)
            .unwrap_or(Ordering::Equal)
    }
}

/// The VecLabs HNSW Index
///
/// Implements Hierarchical Navigable Small World graph for approximate
/// nearest neighbor search. This is the performance core of SolVec.
///
/// Parameters:
/// - M: max connections per node per layer (default: 16)
/// - ef_construction: beam width during index build (default: 200)
/// - ef_search: beam width during query (default: 50)
#[derive(Debug, Serialize, Deserialize)]
pub struct HNSWIndex {
    m: usize,
    m_max_0: usize,
    ef_construction: usize,
    ef_search: usize,
    ml: f64,

    vectors: AHashMap<String, Vector>,

    // layers[0] = base layer (densest), layers[max] = entry point layer (sparsest)
    layers: Vec<AHashMap<String, Vec<String>>>,

    entry_point: Option<String>,
    entry_point_level: usize,

    total_inserts: usize,
    total_deletes: usize,

    metric: DistanceMetric,
    dimension: Option<usize>,
}

impl HNSWIndex {
    /// Create a new HNSW index
    ///
    /// # Arguments
    /// * `m` - Max connections per node. 16 is standard. Higher = better recall, more memory.
    /// * `ef_construction` - Build-time beam width. 200 is standard. Higher = better quality, slower build.
    /// * `metric` - Distance metric for similarity computation.
    pub fn new(m: usize, ef_construction: usize, metric: DistanceMetric) -> Self {
        let m = m.max(2);
        Self {
            m,
            m_max_0: m * 2,
            ef_construction,
            ef_search: ef_construction.min(50).max(10),
            ml: 1.0 / (m as f64).ln(),
            vectors: AHashMap::new(),
            layers: Vec::new(),
            entry_point: None,
            entry_point_level: 0,
            total_inserts: 0,
            total_deletes: 0,
            metric,
            dimension: None,
        }
    }

    /// Create with sensible defaults - what most users should use
    pub fn default_cosine() -> Self {
        Self::new(16, 200, DistanceMetric::Cosine)
    }

    /// Set ef_search - increase for better recall at cost of speed
    pub fn set_ef_search(&mut self, ef: usize) {
        self.ef_search = ef.max(1);
    }

    /// Number of vectors in the index
    pub fn len(&self) -> usize {
        self.vectors.len()
    }

    /// Whether the index contains no vectors
    pub fn is_empty(&self) -> bool {
        self.vectors.is_empty()
    }

    /// The distance metric used by this index
    pub fn metric(&self) -> DistanceMetric {
        self.metric
    }

    /// Insert a vector into the index
    ///
    /// If a vector with the same ID already exists, it is updated.
    pub fn insert(&mut self, vector: Vector) -> Result<(), SolVecError> {
        vector.validate()?;

        if let Some(dim) = self.dimension {
            if vector.values.len() != dim {
                return Err(SolVecError::DimensionMismatch {
                    expected: dim,
                    actual: vector.values.len(),
                });
            }
        } else {
            self.dimension = Some(vector.values.len());
        }

        if self.vectors.contains_key(&vector.id) {
            self.delete(&vector.id)?;
        }

        let id = vector.id.clone();
        let insert_level = self.random_level();

        while self.layers.len() <= insert_level {
            self.layers.push(AHashMap::new());
        }

        for l in 0..=insert_level {
            self.layers[l].insert(id.clone(), Vec::new());
        }

        self.vectors.insert(id.clone(), vector);

        if self.entry_point.is_none() {
            self.entry_point = Some(id);
            self.entry_point_level = insert_level;
            self.total_inserts += 1;
            return Ok(());
        }

        self.connect_new_node(&id, insert_level);

        if insert_level > self.entry_point_level {
            self.entry_point = Some(id);
            self.entry_point_level = insert_level;
        }

        self.total_inserts += 1;
        Ok(())
    }

    /// Delete a vector by ID
    pub fn delete(&mut self, id: &str) -> Result<(), SolVecError> {
        if !self.vectors.contains_key(id) {
            return Err(SolVecError::VectorNotFound(id.to_string()));
        }

        for layer in &mut self.layers {
            layer.remove(id);
            for neighbors in layer.values_mut() {
                neighbors.retain(|n| n != id);
            }
        }

        self.vectors.remove(id);
        self.total_deletes += 1;

        if self.entry_point.as_deref() == Some(id) {
            self.entry_point = None;
            self.entry_point_level = 0;
            for (level, layer) in self.layers.iter().enumerate().rev() {
                if let Some(new_ep) = layer.keys().next() {
                    self.entry_point = Some(new_ep.clone());
                    self.entry_point_level = level;
                    break;
                }
            }
        }

        Ok(())
    }

    /// Update a vector (convenience wrapper for delete + insert)
    pub fn update(&mut self, vector: Vector) -> Result<(), SolVecError> {
        self.insert(vector)
    }

    /// Query the index for top-K nearest neighbors
    ///
    /// Returns results sorted by score descending (most similar first)
    pub fn query(
        &self,
        query_vector: &[f32],
        top_k: usize,
    ) -> Result<Vec<QueryResult>, SolVecError> {
        if top_k == 0 {
            return Err(SolVecError::InvalidTopK(top_k));
        }
        if self.vectors.is_empty() {
            return Ok(vec![]);
        }
        if let Some(dim) = self.dimension {
            if query_vector.len() != dim {
                return Err(SolVecError::DimensionMismatch {
                    expected: dim,
                    actual: query_vector.len(),
                });
            }
        }

        let entry = match &self.entry_point {
            Some(ep) => ep.clone(),
            None => return Ok(vec![]),
        };

        let ef = self.ef_search.max(top_k);

        // Phase 1: greedy descent from entry point to layer 1
        let mut current_nearest = entry;
        for layer_idx in (1..=self.entry_point_level).rev() {
            let candidates = self.search_layer(query_vector, &current_nearest, 1, layer_idx);
            if let Some(best) = candidates.into_iter().next() {
                current_nearest = best.id;
            }
        }

        // Phase 2: full ef search at the base layer
        let candidates = self.search_layer(query_vector, &current_nearest, ef, 0);

        let results: Vec<QueryResult> = candidates
            .into_iter()
            .take(top_k)
            .map(|c| {
                let vec = &self.vectors[&c.id];
                QueryResult::new(c.id, c.score, vec.metadata.clone())
            })
            .collect();

        Ok(results)
    }

    /// Search a single HNSW layer using beam search.
    /// Returns candidates sorted by score descending.
    fn search_layer(
        &self,
        query: &[f32],
        entry_id: &str,
        ef: usize,
        layer_idx: usize,
    ) -> Vec<Candidate> {
        let layer = match self.layers.get(layer_idx) {
            Some(l) => l,
            None => return vec![],
        };

        let entry_vec = match self.vectors.get(entry_id) {
            Some(v) => &v.values,
            None => return vec![],
        };

        let entry_score = self.similarity_score(query, entry_vec);

        let mut visited: HashSet<String> = HashSet::new();
        visited.insert(entry_id.to_string());

        let mut candidates: BinaryHeap<Candidate> = BinaryHeap::new();
        candidates.push(Candidate {
            id: entry_id.to_string(),
            score: entry_score,
        });

        let mut results: BinaryHeap<Candidate> = BinaryHeap::new();
        results.push(Candidate {
            id: entry_id.to_string(),
            score: entry_score,
        });

        let mut worst_result_score = entry_score;

        while let Some(current) = candidates.pop() {
            if results.len() >= ef && current.score < worst_result_score {
                break;
            }

            if let Some(neighbors) = layer.get(&current.id) {
                for neighbor_id in neighbors {
                    if visited.contains(neighbor_id) {
                        continue;
                    }
                    visited.insert(neighbor_id.clone());

                    let neighbor_vec = match self.vectors.get(neighbor_id) {
                        Some(v) => &v.values,
                        None => continue,
                    };

                    let score = self.similarity_score(query, neighbor_vec);

                    if results.len() < ef || score > worst_result_score {
                        candidates.push(Candidate {
                            id: neighbor_id.clone(),
                            score,
                        });
                        results.push(Candidate {
                            id: neighbor_id.clone(),
                            score,
                        });

                        if results.len() > ef {
                            let mut sorted: Vec<Candidate> = results.drain().collect();
                            sorted.sort_by(|a, b| {
                                b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal)
                            });
                            sorted.truncate(ef);
                            worst_result_score =
                                sorted.last().map(|c| c.score).unwrap_or(f32::MIN);
                            results = sorted.into_iter().collect();
                        } else {
                            worst_result_score = worst_result_score.min(score);
                        }
                    }
                }
            }
        }

        let mut final_results: Vec<Candidate> = results.into_iter().collect();
        final_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        final_results
    }

    /// Connect a newly inserted node to the graph at all its layers
    fn connect_new_node(&mut self, node_id: &str, insert_level: usize) {
        let node_values = self.vectors[node_id].values.clone();
        let entry = self.entry_point.clone().unwrap();

        let mut current_nearest = entry;

        // Greedy descent from top to insert_level+1 (no connections)
        for layer_idx in (insert_level + 1..=self.entry_point_level).rev() {
            if layer_idx < self.layers.len() {
                let candidates =
                    self.search_layer(&node_values, &current_nearest, 1, layer_idx);
                if let Some(best) = candidates.into_iter().next() {
                    current_nearest = best.id;
                }
            }
        }

        // From insert_level down to 0: search and connect
        for layer_idx in (0..=insert_level.min(self.entry_point_level)).rev() {
            let m_at_layer = if layer_idx == 0 { self.m_max_0 } else { self.m };

            let candidates = self.search_layer(
                &node_values,
                &current_nearest,
                self.ef_construction,
                layer_idx,
            );

            let neighbors: Vec<String> = candidates
                .iter()
                .filter(|c| c.id != node_id)
                .take(m_at_layer)
                .map(|c| c.id.clone())
                .collect();

            if let Some(best) = candidates.into_iter().next() {
                current_nearest = best.id;
            }

            // Bidirectional connections
            if let Some(node_neighbors) = self.layers[layer_idx].get_mut(node_id) {
                for n in &neighbors {
                    if !node_neighbors.contains(n) {
                        node_neighbors.push(n.clone());
                    }
                }
            }

            let node_values_clone = node_values.clone();
            for neighbor_id in &neighbors {
                if let Some(n_neighbors) = self.layers[layer_idx].get_mut(neighbor_id) {
                    if !n_neighbors.contains(&node_id.to_string()) {
                        n_neighbors.push(node_id.to_string());
                    }

                    // Prune if over capacity
                    if n_neighbors.len() > m_at_layer {
                        let neighbor_values = self.vectors[neighbor_id].values.clone();
                        let metric = self.metric;

                        n_neighbors.sort_by(|a, b| {
                            let score_a = if a == node_id {
                                distance::compute(&neighbor_values, &node_values_clone, metric)
                            } else {
                                self.vectors
                                    .get(a)
                                    .map(|v| {
                                        distance::compute(&neighbor_values, &v.values, metric)
                                    })
                                    .unwrap_or(f32::MIN)
                            };
                            let score_b = if b == node_id {
                                distance::compute(&neighbor_values, &node_values_clone, metric)
                            } else {
                                self.vectors
                                    .get(b)
                                    .map(|v| {
                                        distance::compute(&neighbor_values, &v.values, metric)
                                    })
                                    .unwrap_or(f32::MIN)
                            };
                            score_b.partial_cmp(&score_a).unwrap_or(Ordering::Equal)
                        });
                        n_neighbors.truncate(m_at_layer);
                    }
                }
            }
        }
    }

    /// Compute similarity score between two vectors.
    /// Higher is always better (handles euclidean inversion internally).
    #[inline]
    fn similarity_score(&self, a: &[f32], b: &[f32]) -> f32 {
        match self.metric {
            DistanceMetric::Cosine => distance::cosine_similarity(a, b),
            DistanceMetric::DotProduct => distance::dot_product(a, b),
            DistanceMetric::Euclidean => {
                let d = distance::euclidean_distance(a, b);
                1.0 / (1.0 + d)
            }
        }
    }

    /// Generate a random level for a new node.
    /// Uses the standard HNSW formula: level = floor(-ln(rand) * ml)
    fn random_level(&self) -> usize {
        let mut rng = rand::thread_rng();
        let mut level = 0usize;
        loop {
            let r: f64 = rng.gen();
            if r > self.ml || level >= 16 {
                break;
            }
            level += 1;
        }
        level
    }

    /// Serialize the entire index to JSON for persistence
    pub fn to_json(&self) -> Result<String, SolVecError> {
        serde_json::to_string(self).map_err(|e| SolVecError::SerializationError(e.to_string()))
    }

    /// Deserialize an index from JSON
    pub fn from_json(json: &str) -> Result<Self, SolVecError> {
        serde_json::from_str(json).map_err(|e| SolVecError::SerializationError(e.to_string()))
    }

    /// Get stats about the index
    pub fn stats(&self) -> IndexStats {
        IndexStats {
            vector_count: self.vectors.len(),
            layer_count: self.layers.len(),
            entry_point_level: self.entry_point_level,
            dimension: self.dimension.unwrap_or(0),
            total_inserts: self.total_inserts,
            total_deletes: self.total_deletes,
            metric: self.metric,
        }
    }
}

/// Index statistics for monitoring and debugging
#[derive(Debug, Serialize, Deserialize)]
pub struct IndexStats {
    pub vector_count: usize,
    pub layer_count: usize,
    pub entry_point_level: usize,
    pub dimension: usize,
    pub total_inserts: usize,
    pub total_deletes: usize,
    pub metric: DistanceMetric,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn make_vector(id: &str, values: Vec<f32>) -> Vector {
        Vector::new(id, values)
    }

    fn random_vector(dim: usize) -> Vec<f32> {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        (0..dim).map(|_| rng.gen::<f32>()).collect()
    }

    #[test]
    fn test_basic_insert_and_query() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);

        index
            .insert(make_vector("a", vec![1.0, 0.0, 0.0]))
            .unwrap();
        index
            .insert(make_vector("b", vec![0.9, 0.1, 0.0]))
            .unwrap();
        index
            .insert(make_vector("c", vec![0.0, 1.0, 0.0]))
            .unwrap();
        index
            .insert(make_vector("d", vec![0.0, 0.0, 1.0]))
            .unwrap();

        let results = index.query(&[1.0, 0.0, 0.0], 2).unwrap();
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].id, "a");
        assert_eq!(results[1].id, "b");
    }

    #[test]
    fn test_query_returns_correct_count() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        for i in 0..50 {
            index
                .insert(make_vector(&format!("v{}", i), random_vector(128)))
                .unwrap();
        }
        let results = index.query(&random_vector(128), 10).unwrap();
        assert_eq!(results.len(), 10);
    }

    #[test]
    fn test_insert_duplicate_id_updates() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        index
            .insert(make_vector("a", vec![1.0, 0.0, 0.0]))
            .unwrap();
        index
            .insert(make_vector("a", vec![0.0, 1.0, 0.0]))
            .unwrap();

        assert_eq!(index.len(), 1);
        let stored = &index.vectors["a"];
        assert_eq!(stored.values, vec![0.0, 1.0, 0.0]);
    }

    #[test]
    fn test_delete_removes_vector() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        index
            .insert(make_vector("a", vec![1.0, 0.0, 0.0]))
            .unwrap();
        index
            .insert(make_vector("b", vec![0.0, 1.0, 0.0]))
            .unwrap();

        index.delete("a").unwrap();
        assert_eq!(index.len(), 1);

        let results = index.query(&[1.0, 0.0, 0.0], 5).unwrap();
        assert!(!results.iter().any(|r| r.id == "a"));
    }

    #[test]
    fn test_delete_nonexistent_returns_error() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        let result = index.delete("nonexistent");
        assert!(matches!(result, Err(SolVecError::VectorNotFound(_))));
    }

    #[test]
    fn test_dimension_mismatch_error() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        index
            .insert(make_vector("a", vec![1.0, 0.0, 0.0]))
            .unwrap();
        let result = index.insert(make_vector("b", vec![1.0, 0.0]));
        assert!(matches!(
            result,
            Err(SolVecError::DimensionMismatch { .. })
        ));
    }

    #[test]
    fn test_empty_index_returns_empty() {
        let index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        let results = index.query(&[1.0, 0.0, 0.0], 5).unwrap();
        assert!(results.is_empty());
    }

    #[test]
    fn test_serialization_roundtrip() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        for i in 0..20 {
            index
                .insert(make_vector(&format!("v{}", i), random_vector(64)))
                .unwrap();
        }

        let json = index.to_json().unwrap();
        let restored = HNSWIndex::from_json(&json).unwrap();

        assert_eq!(restored.len(), 20);
        assert_eq!(restored.metric(), DistanceMetric::Cosine);
    }

    #[test]
    fn test_results_sorted_by_score_descending() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        for i in 0..30 {
            index
                .insert(make_vector(&format!("v{}", i), random_vector(128)))
                .unwrap();
        }
        let results = index.query(&random_vector(128), 10).unwrap();
        for window in results.windows(2) {
            assert!(
                window[0].score >= window[1].score,
                "Results must be sorted descending"
            );
        }
    }

    #[test]
    fn test_large_index_query_returns_results() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        for i in 0..1000 {
            index
                .insert(make_vector(&format!("v{}", i), random_vector(384)))
                .unwrap();
        }
        let results = index.query(&random_vector(384), 10).unwrap();
        assert_eq!(results.len(), 10);
    }

    #[test]
    fn test_metadata_preserved_in_results() {
        let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
        let mut meta = HashMap::new();
        meta.insert(
            "text".to_string(),
            serde_json::Value::String("hello world".to_string()),
        );

        index
            .insert(Vector::with_metadata("a", vec![1.0, 0.0, 0.0], meta))
            .unwrap();
        index
            .insert(make_vector("b", vec![0.5, 0.5, 0.0]))
            .unwrap();

        let results = index.query(&[1.0, 0.0, 0.0], 1).unwrap();
        assert_eq!(results[0].id, "a");
        assert!(results[0].metadata.contains_key("text"));
    }
}
