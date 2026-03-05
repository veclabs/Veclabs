use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use rand::Rng;
use solvec_core::{
    hnsw::HNSWIndex,
    types::{DistanceMetric, Vector},
};

fn random_vector(dim: usize) -> Vec<f32> {
    let mut rng = rand::thread_rng();
    (0..dim).map(|_| rng.gen::<f32>()).collect()
}

fn build_index(size: usize, dim: usize) -> HNSWIndex {
    let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
    for i in 0..size {
        index
            .insert(Vector::new(format!("v{}", i), random_vector(dim)))
            .unwrap();
    }
    index
}

fn bench_insert(c: &mut Criterion) {
    let mut group = c.benchmark_group("hnsw_insert");

    for &size in &[1_000usize, 10_000] {
        group.bench_with_input(BenchmarkId::new("size", size), &size, |b, &size| {
            b.iter(|| {
                let mut index = HNSWIndex::new(16, 200, DistanceMetric::Cosine);
                for i in 0..size {
                    index
                        .insert(Vector::new(format!("v{}", i), random_vector(384)))
                        .unwrap();
                }
                black_box(index.len())
            });
        });
    }
    group.finish();
}

fn bench_query(c: &mut Criterion) {
    let mut group = c.benchmark_group("hnsw_query");

    for &index_size in &[10_000usize] {
        let index = build_index(index_size, 384);
        let query = random_vector(384);

        for &top_k in &[1usize, 10, 100] {
            group.bench_with_input(
                BenchmarkId::new(format!("index_{}_topk", index_size), top_k),
                &top_k,
                |b, &top_k| {
                    b.iter(|| black_box(index.query(&query, top_k).unwrap()));
                },
            );
        }
    }
    group.finish();
}

fn bench_query_dimensions(c: &mut Criterion) {
    let mut group = c.benchmark_group("hnsw_query_by_dimension");

    for &dim in &[128usize, 384, 768, 1536] {
        let index = build_index(10_000, dim);
        let query = random_vector(dim);
        group.bench_with_input(BenchmarkId::new("dim", dim), &dim, |b, _| {
            b.iter(|| black_box(index.query(&query, 10).unwrap()));
        });
    }
    group.finish();
}

criterion_group!(benches, bench_insert, bench_query, bench_query_dimensions);
criterion_main!(benches);
