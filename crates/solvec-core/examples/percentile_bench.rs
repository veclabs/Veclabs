// benchmarks/percentile_bench.rs
// Run with: cargo run --release --example percentile_bench
// This measures real p50/p95/p99/p99.9 with 1000 samples

use rand::Rng;
use solvec_core::{
    hnsw::HNSWIndex,
    types::{DistanceMetric, Vector},
};
use std::time::{Duration, Instant};

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

fn percentile(sorted: &[Duration], p: f64) -> Duration {
    let idx = ((p / 100.0) * (sorted.len() - 1) as f64).round() as usize;
    sorted[idx.min(sorted.len() - 1)]
}

fn format_duration(d: Duration) -> String {
    let nanos = d.as_nanos();
    if nanos < 1_000 {
        format!("{}ns", nanos)
    } else if nanos < 1_000_000 {
        format!("{:.2}µs", nanos as f64 / 1_000.0)
    } else {
        format!("{:.3}ms", nanos as f64 / 1_000_000.0)
    }
}

fn run_benchmark(label: &str, index: &HNSWIndex, dim: usize, top_k: usize, samples: usize) {
    // warmup
    for _ in 0..50 {
        let q = random_vector(dim);
        let _ = index.query(&q, top_k).unwrap();
    }

    // collect samples
    let mut timings: Vec<Duration> = Vec::with_capacity(samples);
    for _ in 0..samples {
        let q = random_vector(dim);
        let start = Instant::now();
        let _ = index.query(&q, top_k).unwrap();
        timings.push(start.elapsed());
    }

    timings.sort_unstable();

    let p50 = percentile(&timings, 50.0);
    let p95 = percentile(&timings, 95.0);
    let p99 = percentile(&timings, 99.0);
    let p999 = percentile(&timings, 99.9);
    let min = timings[0];
    let max = timings[timings.len() - 1];
    let mean = Duration::from_nanos(
        (timings.iter().map(|d| d.as_nanos()).sum::<u128>() / samples as u128) as u64,
    );

    println!("  {}", label);
    println!("  ├─ samples : {}", samples);
    println!("  ├─ min     : {}", format_duration(min));
    println!("  ├─ mean    : {}", format_duration(mean));
    println!("  ├─ p50     : {}", format_duration(p50));
    println!("  ├─ p95     : {}", format_duration(p95));
    println!("  ├─ p99     : {}", format_duration(p99));
    println!("  ├─ p99.9   : {}", format_duration(p999));
    println!("  └─ max     : {}", format_duration(max));
    println!();
}

fn main() {
    let samples = 1000;

    println!();
    println!("╔══════════════════════════════════════════════════════╗");
    println!("║           VecLabs HNSW Benchmark                     ║");
    println!(
        "║  Rust HNSW · cosine similarity · {} samples        ║",
        samples
    );
    println!("╚══════════════════════════════════════════════════════╝");
    println!();

    // ── 100K vectors, 384 dims (primary claim) ──────────────────
    println!("► Building 100K index (384 dims) - please wait...");
    let index_100k_384 = build_index(100_000, 384);
    println!("  Done.\n");

    println!("▸ 100K vectors · 384 dimensions");
    println!("─────────────────────────────────────────────────────");
    run_benchmark("top-1  query", &index_100k_384, 384, 1, samples);
    run_benchmark("top-10 query", &index_100k_384, 384, 10, samples);
    run_benchmark("top-100 query", &index_100k_384, 384, 100, samples);

    // ── 100K vectors, 1536 dims (OpenAI embedding size) ─────────
    println!("► Building 100K index (1536 dims) - please wait...");
    let index_100k_1536 = build_index(100_000, 1536);
    println!("  Done.\n");

    println!("▸ 100K vectors · 1536 dimensions (OpenAI ada-002 size)");
    println!("─────────────────────────────────────────────────────");
    run_benchmark("top-10 query", &index_100k_1536, 1536, 10, samples);

    // ── 10K vectors for comparison ───────────────────────────────
    println!("► Building 10K index (384 dims)...");
    let index_10k = build_index(10_000, 384);
    println!("  Done.\n");

    println!("▸ 10K vectors · 384 dimensions");
    println!("─────────────────────────────────────────────────────");
    run_benchmark("top-10 query", &index_10k, 384, 10, samples);

    // ── Summary table ────────────────────────────────────────────
    println!("╔══════════════════════════════════════════════════════╗");
    println!("║                 Summary                              ║");
    println!("║  100K vectors · 384 dims · top-10 · 1000 samples     ║");
    println!("╠══════════════════════════════════════════════════════╣");
    println!("║  Run the benchmark to see your numbers here.         ║");
    println!("║  Apple M3 · macOS 26 · Rust 1.85 · release build     ║");
    println!("╚══════════════════════════════════════════════════════╝");
    println!();
}
