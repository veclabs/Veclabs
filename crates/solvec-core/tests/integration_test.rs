use solvec_core::{
    encryption::{decrypt_vectors, encrypt_vectors},
    hnsw::HNSWIndex,
    merkle::MerkleTree,
    types::{DistanceMetric, Vector},
};
use std::collections::HashMap;

#[test]
fn test_complete_veclabs_pipeline() {
    println!("\n🚀 VecLabs Full Pipeline Integration Test\n");

    // === STEP 1: Build HNSW Index ===
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);

    let test_vectors = vec![
        ("user_alex_intro", vec![0.9f32, 0.1, 0.0, 0.0]),
        ("user_alex_startup", vec![0.8f32, 0.2, 0.1, 0.0]),
        ("user_bob_intro", vec![0.0f32, 0.0, 0.9, 0.1]),
        ("session_summary", vec![0.5f32, 0.5, 0.0, 0.0]),
    ];

    for (id, values) in &test_vectors {
        let mut meta = HashMap::new();
        meta.insert(
            "source".to_string(),
            serde_json::Value::String("agent_memory".to_string()),
        );
        index
            .insert(Vector::with_metadata(*id, values.clone(), meta))
            .unwrap();
    }

    println!("✅ Step 1: Indexed {} vectors", index.len());
    assert_eq!(index.len(), 4);

    // === STEP 2: Query ===
    let query = vec![0.85f32, 0.15, 0.0, 0.0];
    let results = index.query(&query, 2).unwrap();

    println!("✅ Step 2: Query returned {} results", results.len());
    println!(
        "   Top result: {} (score: {:.4})",
        results[0].id, results[0].score
    );
    assert_eq!(results.len(), 2);
    assert!(results[0].score >= results[1].score);

    // === STEP 3: Merkle Tree ===
    let ids: Vec<String> = test_vectors.iter().map(|(id, _)| id.to_string()).collect();
    let tree = MerkleTree::new(&ids);
    let root = tree.root();
    let root_hex = tree.root_hex();

    println!("✅ Step 3: Merkle root computed: {}", &root_hex[..16]);
    assert_ne!(root, [0u8; 32]);

    let proof = tree.generate_proof("user_alex_intro").unwrap();
    assert!(proof.verify(&root));
    println!("✅ Step 3: Merkle proof verified for 'user_alex_intro'");

    // === STEP 4: Encryption ===
    let key = [0u8; 32];
    let raw_vectors: Vec<Vec<f32>> = test_vectors.iter().map(|(_, v)| v.clone()).collect();
    let encrypted = encrypt_vectors(&raw_vectors, &key).unwrap();
    let decrypted = decrypt_vectors(&encrypted, &key).unwrap();

    assert_eq!(raw_vectors.len(), decrypted.len());
    for (orig, dec) in raw_vectors.iter().zip(decrypted.iter()) {
        for (a, b) in orig.iter().zip(dec.iter()) {
            assert!(
                (a - b).abs() < 1e-6,
                "Decrypted values must match original"
            );
        }
    }

    println!("✅ Step 4: Encryption/decryption roundtrip passed");
    println!(
        "   Encrypted size: {} bytes → Shadow Drive",
        encrypted.len()
    );

    // === STEP 5: Serialization (persistence) ===
    let json = index.to_json().unwrap();
    let restored_index = HNSWIndex::from_json(&json).unwrap();
    let restored_results = restored_index.query(&query, 2).unwrap();

    assert_eq!(restored_results[0].id, results[0].id);
    println!("✅ Step 5: Index serialized and restored - query results match");

    // === FINAL SUMMARY ===
    println!("\n🎉 All pipeline steps passed!\n");
    println!("   Vectors indexed:    {}", index.len());
    println!("   Merkle root:        {} (→ Solana)", &root_hex[..16]);
    println!(
        "   Encrypted payload:  {} bytes (→ Shadow Drive)",
        encrypted.len()
    );
    println!(
        "   Top query result:   {} ({:.4})",
        results[0].id, results[0].score
    );
}
