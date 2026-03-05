use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use crate::types::SolVecError;

const NONCE_SIZE: usize = 12;

/// Encrypt a batch of vectors using AES-256-GCM.
/// Key should be derived from the user's Solana wallet.
/// Returns: nonce (12 bytes) + ciphertext
pub fn encrypt_vectors(vectors: &[Vec<f32>], key: &[u8; 32]) -> Result<Vec<u8>, SolVecError> {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let num_vectors = vectors.len() as u64;
    let dim = vectors.first().map(|v| v.len() as u64).unwrap_or(0);

    let mut plaintext = Vec::new();
    plaintext.extend_from_slice(&num_vectors.to_le_bytes());
    plaintext.extend_from_slice(&dim.to_le_bytes());
    for v in vectors {
        for &f in v {
            plaintext.extend_from_slice(&f.to_le_bytes());
        }
    }

    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| SolVecError::EncryptionError(e.to_string()))?;

    let mut output = nonce.to_vec();
    output.extend_from_slice(&ciphertext);
    Ok(output)
}

/// Decrypt vectors from AES-256-GCM ciphertext
pub fn decrypt_vectors(encrypted: &[u8], key: &[u8; 32]) -> Result<Vec<Vec<f32>>, SolVecError> {
    if encrypted.len() < NONCE_SIZE {
        return Err(SolVecError::DecryptionError("Ciphertext too short".into()));
    }

    let (nonce_bytes, ciphertext) = encrypted.split_at(NONCE_SIZE);
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| SolVecError::DecryptionError(e.to_string()))?;

    if plaintext.len() < 16 {
        return Err(SolVecError::DecryptionError(
            "Invalid plaintext length".into(),
        ));
    }

    let num_vectors = u64::from_le_bytes(plaintext[0..8].try_into().unwrap()) as usize;
    let dim = u64::from_le_bytes(plaintext[8..16].try_into().unwrap()) as usize;

    if dim == 0 || num_vectors == 0 {
        return Ok(vec![]);
    }

    let expected_bytes = 16 + num_vectors * dim * 4;
    if plaintext.len() < expected_bytes {
        return Err(SolVecError::DecryptionError(
            "Plaintext length mismatch".into(),
        ));
    }

    let mut vectors = Vec::with_capacity(num_vectors);
    let data = &plaintext[16..];
    for i in 0..num_vectors {
        let start = i * dim * 4;
        let vec: Vec<f32> = (0..dim)
            .map(|j| {
                let offset = start + j * 4;
                f32::from_le_bytes(data[offset..offset + 4].try_into().unwrap())
            })
            .collect();
        vectors.push(vec);
    }

    Ok(vectors)
}

/// Generate a deterministic key from a Solana wallet public key.
/// In production this would use the actual wallet signing capability.
pub fn derive_key_from_pubkey(pubkey_bytes: &[u8; 32]) -> [u8; 32] {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(b"solvec-encryption-key-v1:");
    hasher.update(pubkey_bytes);
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_key() -> [u8; 32] {
        [42u8; 32]
    }

    #[test]
    fn test_roundtrip_single_vector() {
        let key = test_key();
        let vectors = vec![vec![1.0f32, 2.0, 3.0, 4.0]];
        let encrypted = encrypt_vectors(&vectors, &key).unwrap();
        let decrypted = decrypt_vectors(&encrypted, &key).unwrap();
        assert_eq!(vectors, decrypted);
    }

    #[test]
    fn test_roundtrip_multiple_vectors() {
        let key = test_key();
        let vectors: Vec<Vec<f32>> = (0..10)
            .map(|i| (0..384).map(|j| (i * j) as f32 * 0.001).collect())
            .collect();
        let encrypted = encrypt_vectors(&vectors, &key).unwrap();
        let decrypted = decrypt_vectors(&encrypted, &key).unwrap();
        assert_eq!(vectors.len(), decrypted.len());
        for (orig, dec) in vectors.iter().zip(decrypted.iter()) {
            for (a, b) in orig.iter().zip(dec.iter()) {
                assert!((a - b).abs() < 1e-6);
            }
        }
    }

    #[test]
    fn test_wrong_key_fails() {
        let key1 = [1u8; 32];
        let key2 = [2u8; 32];
        let vectors = vec![vec![1.0f32, 2.0, 3.0]];
        let encrypted = encrypt_vectors(&vectors, &key1).unwrap();
        let result = decrypt_vectors(&encrypted, &key2);
        assert!(result.is_err());
    }

    #[test]
    fn test_different_encryptions_of_same_data() {
        let key = test_key();
        let vectors = vec![vec![1.0f32, 2.0, 3.0]];
        let enc1 = encrypt_vectors(&vectors, &key).unwrap();
        let enc2 = encrypt_vectors(&vectors, &key).unwrap();
        assert_ne!(enc1, enc2, "Each encryption should use a unique nonce");
    }

    #[test]
    fn test_empty_input() {
        let key = test_key();
        let result = encrypt_vectors(&[], &key);
        assert!(result.is_ok());
    }
}
