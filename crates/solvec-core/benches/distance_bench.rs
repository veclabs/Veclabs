use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use rand::Rng;
use solvec_core::distance;

fn random_vector(dim: usize) -> Vec<f32> {
    let mut rng = rand::thread_rng();
    (0..dim).map(|_| rng.gen::<f32>()).collect()
}

fn bench_distance_functions(c: &mut Criterion) {
    let mut group = c.benchmark_group("distance");

    for &dim in &[128usize, 384, 768, 1536] {
        let a = random_vector(dim);
        let b = random_vector(dim);

        group.bench_with_input(BenchmarkId::new("cosine", dim), &dim, |bench, _| {
            bench.iter(|| black_box(distance::cosine_similarity(&a, &b)));
        });

        group.bench_with_input(BenchmarkId::new("euclidean", dim), &dim, |bench, _| {
            bench.iter(|| black_box(distance::euclidean_distance(&a, &b)));
        });

        group.bench_with_input(BenchmarkId::new("dot_product", dim), &dim, |bench, _| {
            bench.iter(|| black_box(distance::dot_product(&a, &b)));
        });
    }
    group.finish();
}

criterion_group!(benches, bench_distance_functions);
criterion_main!(benches);
