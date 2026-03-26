use solvec_core::{
    hnsw::HNSWIndex,
    inspector::{InspectorQuery, InspectionResult},
    types::{DistanceMetric, Vector},
};
use std::collections::HashMap;

fn make_vector(id: &str, values: Vec<f32>) -> Vector {
    Vector::new(id, values)
}

fn make_vector_with_meta(id: &str, values: Vec<f32>, key: &str, val: &str) -> Vector {
    let mut meta = HashMap::new();
    meta.insert(
        key.to_string(),
        serde_json::Value::String(val.to_string()),
    );
    Vector::with_metadata(id, values, meta)
}

fn make_index_with_data() -> HNSWIndex {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    for i in 0..20 {
        let values: Vec<f32> = (0..64)
            .map(|j| ((i * 64 + j) as f32 * 0.001).sin())
            .collect();
        let vec = make_vector_with_meta(
            &format!("mem_{:03}", i),
            values,
            "source",
            if i % 2 == 0 { "agent" } else { "user" },
        );
        index.insert(vec).unwrap();
    }
    index
}

#[test]
fn test_stats_total_memories() {
    let index = make_index_with_data();
    let stats = index.collection_stats();
    assert_eq!(stats.total_memories, 20);
}

#[test]
fn test_stats_dimensions() {
    let index = make_index_with_data();
    let stats = index.collection_stats();
    assert_eq!(stats.dimensions, 64);
}

#[test]
fn test_stats_merkle_root_not_empty() {
    let index = make_index_with_data();
    let stats = index.collection_stats();
    assert!(!stats.current_merkle_root.is_empty());
    assert_ne!(stats.current_merkle_root, "0".repeat(64));
}

#[test]
fn test_inspect_no_filter_returns_all() {
    let index = make_index_with_data();
    let result = index.inspect(None);
    assert_eq!(result.total_matching, 20);
}

#[test]
fn test_inspect_limit() {
    let index = make_index_with_data();
    let result = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: None,
        written_before: None,
        hnsw_layer: None,
        limit: Some(5),
        offset: None,
    }));
    assert_eq!(result.memories.len(), 5);
    assert_eq!(result.total_matching, 20);
}

#[test]
fn test_inspect_offset_pagination() {
    let index = make_index_with_data();
    let page1 = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: None,
        written_before: None,
        hnsw_layer: None,
        limit: Some(10),
        offset: Some(0),
    }));
    let page2 = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: None,
        written_before: None,
        hnsw_layer: None,
        limit: Some(10),
        offset: Some(10),
    }));
    assert_eq!(page1.memories.len(), 10);
    assert_eq!(page2.memories.len(), 10);
    let ids1: Vec<&str> = page1.memories.iter().map(|m| m.id.as_str()).collect();
    let ids2: Vec<&str> = page2.memories.iter().map(|m| m.id.as_str()).collect();
    for id in &ids2 {
        assert!(
            !ids1.contains(id),
            "Page 2 should not overlap page 1"
        );
    }
}

#[test]
fn test_inspect_written_after_filter() {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);

    index.insert(make_vector("early", vec![1.0, 0.0, 0.0])).unwrap();
    let mid_ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;
    std::thread::sleep(std::time::Duration::from_millis(10));
    index.insert(make_vector("late", vec![0.0, 1.0, 0.0])).unwrap();

    let result = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: Some(mid_ts),
        written_before: None,
        hnsw_layer: None,
        limit: None,
        offset: None,
    }));
    assert!(result.total_matching >= 1);
    assert!(result.memories.iter().all(|m| m.written_at >= mid_ts));
}

#[test]
fn test_inspect_hnsw_layer_filter() {
    let index = make_index_with_data();
    let result = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: None,
        written_before: None,
        hnsw_layer: Some(0),
        limit: None,
        offset: None,
    }));
    assert!(result.total_matching > 0);
    assert!(result.memories.iter().all(|m| m.hnsw_layer == 0));
}

#[test]
fn test_get_memory_by_id() {
    let index = make_index_with_data();
    let record = index.get_memory("mem_005");
    assert!(record.is_some());
    let record = record.unwrap();
    assert_eq!(record.id, "mem_005");
    assert_eq!(record.vector.len(), 64);
}

#[test]
fn test_get_memory_nonexistent_returns_none() {
    let index = make_index_with_data();
    assert!(index.get_memory("nonexistent").is_none());
}

#[test]
fn test_search_with_records_returns_scores() {
    let index = make_index_with_data();
    let query_vec: Vec<f32> = (0..64).map(|j| (j as f32 * 0.001).sin()).collect();
    let results = index.search_with_records(&query_vec, 5);
    assert!(!results.is_empty());
    for (score, _rec) in &results {
        assert!(*score >= -1.0 && *score <= 1.0);
    }
}

#[test]
fn test_search_with_records_count() {
    let index = make_index_with_data();
    let query_vec: Vec<f32> = (0..64).map(|j| (j as f32 * 0.01).cos()).collect();
    let results = index.search_with_records(&query_vec, 5);
    assert_eq!(results.len(), 5);
}

#[test]
fn test_merkle_history_grows_on_write() {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    for i in 0..5 {
        index
            .insert(make_vector(&format!("v{}", i), vec![i as f32, 0.0, 0.0]))
            .unwrap();
    }
    let history = index.merkle_history();
    assert_eq!(history.len(), 5);
}

#[test]
fn test_merkle_history_trigger_is_write() {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    index.insert(make_vector("a", vec![1.0, 0.0, 0.0])).unwrap();
    let history = index.merkle_history();
    assert_eq!(history[0].trigger, "write");
}

#[test]
fn test_merkle_history_trigger_is_delete() {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    index.insert(make_vector("a", vec![1.0, 0.0, 0.0])).unwrap();
    index.insert(make_vector("b", vec![0.0, 1.0, 0.0])).unwrap();
    index.delete("a").unwrap();
    let history = index.merkle_history();
    assert_eq!(history.last().unwrap().trigger, "delete");
}

#[test]
fn test_written_at_timestamp_nonzero() {
    let index = make_index_with_data();
    let record = index.get_memory("mem_000").unwrap();
    assert!(record.written_at > 0, "written_at should be a Unix ms timestamp");
}

#[test]
fn test_neighbor_count_nonzero_after_multiple_inserts() {
    let index = make_index_with_data();
    let mut has_neighbors = false;
    for i in 0..20 {
        let rec = index.get_memory(&format!("mem_{:03}", i)).unwrap();
        if rec.neighbor_count > 0 {
            has_neighbors = true;
            break;
        }
    }
    assert!(has_neighbors, "At least one node should have neighbors");
}

#[test]
fn test_inspect_result_total_matching_accurate() {
    let index = make_index_with_data();
    let all = index.inspect(None);
    assert_eq!(all.total_matching, 20);

    let limited = index.inspect(Some(InspectorQuery {
        metadata_filter: None,
        written_after: None,
        written_before: None,
        hnsw_layer: None,
        limit: Some(3),
        offset: None,
    }));
    assert_eq!(limited.memories.len(), 3);
    assert_eq!(limited.total_matching, 20);
}

#[test]
fn test_memory_usage_bytes_nonzero() {
    let index = make_index_with_data();
    let stats = index.collection_stats();
    assert!(stats.memory_usage_bytes > 0);
}

#[test]
fn test_serde_roundtrip_inspection_result() {
    let index = make_index_with_data();
    let result = index.inspect(None);
    let json = serde_json::to_string(&result).unwrap();
    let restored: InspectionResult = serde_json::from_str(&json).unwrap();
    assert_eq!(restored.total_matching, result.total_matching);
    assert_eq!(restored.memories.len(), result.memories.len());
    assert_eq!(
        restored.stats.total_memories,
        result.stats.total_memories
    );
}

#[test]
fn test_backward_compat_deserialize_old_index() {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    index.insert(make_vector("a", vec![1.0, 0.0, 0.0])).unwrap();
    index.insert(make_vector("b", vec![0.0, 1.0, 0.0])).unwrap();
    let json = index.to_json().unwrap();

    let mut val: serde_json::Value = serde_json::from_str(&json).unwrap();
    if let Some(obj) = val.as_object_mut() {
        obj.remove("written_at");
        obj.remove("node_levels");
        obj.remove("merkle_root_at_write");
        obj.remove("merkle_history");
    }
    let stripped_json = serde_json::to_string(&val).unwrap();

    let restored = HNSWIndex::from_json(&stripped_json).unwrap();
    assert_eq!(restored.len(), 2);
    let results = restored.query(&[1.0, 0.0, 0.0], 1).unwrap();
    assert_eq!(results[0].id, "a");
}

#[test]
fn test_metadata_filter() {
    let index = make_index_with_data();
    let filter = serde_json::json!({ "source": "agent" });
    let result = index.inspect(Some(InspectorQuery {
        metadata_filter: Some(filter),
        written_after: None,
        written_before: None,
        hnsw_layer: None,
        limit: None,
        offset: None,
    }));
    assert_eq!(result.total_matching, 10);
}
