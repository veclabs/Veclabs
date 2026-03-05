use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Merkle tree for cryptographic verification of vector collections.
/// The root (32 bytes) is what gets posted to Solana.
pub struct MerkleTree {
    leaves: Vec<[u8; 32]>,
    tree: Vec<Vec<[u8; 32]>>,
    original_ids: Vec<String>,
}

impl MerkleTree {
    /// Build a Merkle tree from a list of vector IDs
    pub fn new(vector_ids: &[String]) -> Self {
        let leaves: Vec<[u8; 32]> = vector_ids.iter().map(|id| hash_leaf(id.as_bytes())).collect();

        let tree = build_tree(&leaves);

        Self {
            leaves,
            tree,
            original_ids: vector_ids.to_vec(),
        }
    }

    /// Get the Merkle root — this 32-byte value goes on Solana
    pub fn root(&self) -> [u8; 32] {
        match self.tree.last() {
            Some(top) if !top.is_empty() => top[0],
            _ => [0u8; 32],
        }
    }

    /// Get root as hex string (for display and logging)
    pub fn root_hex(&self) -> String {
        hex::encode(self.root())
    }

    /// Generate a Merkle proof that a given vector ID is in this collection.
    /// The proof can be verified by anyone with just the root.
    pub fn generate_proof(&self, vector_id: &str) -> Option<MerkleProof> {
        let leaf = hash_leaf(vector_id.as_bytes());
        let leaf_pos = self.leaves.iter().position(|l| l == &leaf)?;

        let mut proof_nodes: Vec<ProofNode> = Vec::new();
        let mut current_pos = leaf_pos;

        for layer in &self.tree[..self.tree.len().saturating_sub(1)] {
            let is_right = current_pos % 2 == 0;
            let sibling_pos = if is_right {
                (current_pos + 1).min(layer.len() - 1)
            } else {
                current_pos - 1
            };

            proof_nodes.push(ProofNode {
                hash: layer[sibling_pos],
                position: if is_right {
                    NodePosition::Right
                } else {
                    NodePosition::Left
                },
            });

            current_pos /= 2;
        }

        Some(MerkleProof {
            vector_id: vector_id.to_string(),
            leaf_hash: leaf,
            proof_nodes,
            root: self.root(),
        })
    }

    /// Number of vectors in this tree
    pub fn vector_count(&self) -> usize {
        self.original_ids.len()
    }
}

/// A single node in a Merkle proof
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofNode {
    pub hash: [u8; 32],
    pub position: NodePosition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodePosition {
    Left,
    Right,
}

/// A complete Merkle proof for a single vector ID
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleProof {
    pub vector_id: String,
    pub leaf_hash: [u8; 32],
    pub proof_nodes: Vec<ProofNode>,
    pub root: [u8; 32],
}

impl MerkleProof {
    /// Verify this proof against a given root.
    /// Returns true if the vector_id is provably in the collection with that root.
    pub fn verify(&self, expected_root: &[u8; 32]) -> bool {
        let mut current_hash = self.leaf_hash;

        for node in &self.proof_nodes {
            current_hash = match node.position {
                NodePosition::Right => hash_pair(&current_hash, &node.hash),
                NodePosition::Left => hash_pair(&node.hash, &current_hash),
            };
        }

        &current_hash == expected_root
    }

    /// Get root as hex string
    pub fn root_hex(&self) -> String {
        hex::encode(self.root)
    }
}

fn hash_leaf(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"leaf:");
    hasher.update(data);
    hasher.finalize().into()
}

fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"node:");
    hasher.update(left);
    hasher.update(right);
    hasher.finalize().into()
}

fn build_tree(leaves: &[[u8; 32]]) -> Vec<Vec<[u8; 32]>> {
    if leaves.is_empty() {
        return vec![vec![[0u8; 32]]];
    }

    let mut tree: Vec<Vec<[u8; 32]>> = vec![leaves.to_vec()];
    let mut current_layer = leaves.to_vec();

    while current_layer.len() > 1 {
        let mut next_layer = Vec::new();
        let mut i = 0;
        while i < current_layer.len() {
            let left = current_layer[i];
            let right = if i + 1 < current_layer.len() {
                current_layer[i + 1]
            } else {
                current_layer[i]
            };
            next_layer.push(hash_pair(&left, &right));
            i += 2;
        }
        tree.push(next_layer.clone());
        current_layer = next_layer;
    }

    tree
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ids(n: usize) -> Vec<String> {
        (0..n).map(|i| format!("vec_{}", i)).collect()
    }

    #[test]
    fn test_single_element_tree() {
        let tree = MerkleTree::new(&ids(1));
        let root = tree.root();
        assert_ne!(root, [0u8; 32]);
    }

    #[test]
    fn test_proof_verifies_correctly() {
        let id_list = ids(10);
        let tree = MerkleTree::new(&id_list);
        let root = tree.root();

        let proof = tree.generate_proof("vec_5").unwrap();
        assert!(proof.verify(&root), "Proof should verify against root");
    }

    #[test]
    fn test_proof_fails_with_wrong_root() {
        let tree = MerkleTree::new(&ids(10));
        let wrong_root = [1u8; 32];
        let proof = tree.generate_proof("vec_3").unwrap();
        assert!(
            !proof.verify(&wrong_root),
            "Proof should fail with wrong root"
        );
    }

    #[test]
    fn test_proof_nonexistent_id_returns_none() {
        let tree = MerkleTree::new(&ids(5));
        assert!(tree.generate_proof("nonexistent_id").is_none());
    }

    #[test]
    fn test_different_id_sets_produce_different_roots() {
        let tree1 = MerkleTree::new(&ids(5));
        let tree2 = MerkleTree::new(&ids(6));
        assert_ne!(tree1.root(), tree2.root());
    }

    #[test]
    fn test_all_proofs_verify() {
        let id_list = ids(20);
        let tree = MerkleTree::new(&id_list);
        let root = tree.root();

        for id in &id_list {
            let proof = tree.generate_proof(id).unwrap();
            assert!(proof.verify(&root), "Proof failed for id: {}", id);
        }
    }

    #[test]
    fn test_empty_tree() {
        let tree = MerkleTree::new(&[]);
        assert_eq!(tree.root(), [0u8; 32]);
    }
}
