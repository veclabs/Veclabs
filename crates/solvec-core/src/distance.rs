use crate::types::DistanceMetric;

/// Main dispatch function — called by HNSW for all distance computations
#[inline(always)]
pub fn compute(a: &[f32], b: &[f32], metric: DistanceMetric) -> f32 {
    debug_assert_eq!(a.len(), b.len(), "Vector dimensions must match");
    match metric {
        DistanceMetric::Cosine => cosine_similarity(a, b),
        DistanceMetric::Euclidean => euclidean_distance(a, b),
        DistanceMetric::DotProduct => dot_product(a, b),
    }
}

/// Cosine similarity — returns value in [-1, 1], higher = more similar
/// Used as DEFAULT metric (same as Pinecone default)
#[inline]
pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0f32;
    let mut norm_a = 0.0f32;
    let mut norm_b = 0.0f32;

    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        norm_a += x * x;
        norm_b += y * y;
    }

    let denom = norm_a.sqrt() * norm_b.sqrt();
    if denom < f32::EPSILON {
        return 0.0;
    }
    (dot / denom).clamp(-1.0, 1.0)
}

/// Euclidean distance — returns value in [0, inf), lower = more similar
#[inline]
pub fn euclidean_distance(a: &[f32], b: &[f32]) -> f32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y) * (x - y))
        .sum::<f32>()
        .sqrt()
}

/// Squared euclidean distance — avoids sqrt, used internally for comparisons
#[inline]
pub fn euclidean_distance_squared(a: &[f32], b: &[f32]) -> f32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y) * (x - y))
        .sum()
}

/// Dot product similarity — returns scalar, higher = more similar
/// Best for normalized vectors (OpenAI embeddings are already normalized)
#[inline]
pub fn dot_product(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
}

/// Normalize a vector to unit length (for cosine optimization)
/// Pre-normalizing vectors allows using dot_product instead of cosine (faster)
pub fn normalize(v: &[f32]) -> Vec<f32> {
    let norm: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm < f32::EPSILON {
        return v.to_vec();
    }
    v.iter().map(|x| x / norm).collect()
}

/// Convert distance to similarity score for consistent API output
/// All metrics return higher = more similar after this conversion
pub fn to_similarity_score(distance: f32, metric: DistanceMetric) -> f32 {
    match metric {
        DistanceMetric::Cosine => distance,
        DistanceMetric::DotProduct => distance,
        DistanceMetric::Euclidean => 1.0 / (1.0 + distance),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_identical_vectors() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!((sim - 1.0).abs() < 1e-6, "Identical vectors should have similarity 1.0");
    }

    #[test]
    fn test_cosine_orthogonal_vectors() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![0.0, 1.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!(sim.abs() < 1e-6, "Orthogonal vectors should have similarity ~0.0");
    }

    #[test]
    fn test_cosine_opposite_vectors() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![-1.0, 0.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!((sim + 1.0).abs() < 1e-6, "Opposite vectors should have similarity -1.0");
    }

    #[test]
    fn test_euclidean_same_point() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![1.0, 2.0, 3.0];
        assert!(euclidean_distance(&a, &b).abs() < 1e-6);
    }

    #[test]
    fn test_dot_product_orthogonal() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![0.0, 1.0, 0.0];
        assert!(dot_product(&a, &b).abs() < 1e-6);
    }

    #[test]
    fn test_normalize_unit_vector() {
        let v = vec![3.0, 4.0];
        let norm = normalize(&v);
        let magnitude: f32 = norm.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((magnitude - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_normalize_zero_vector() {
        let v = vec![0.0, 0.0, 0.0];
        let norm = normalize(&v);
        assert_eq!(norm, v);
    }
}
