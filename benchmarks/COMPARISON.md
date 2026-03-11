# VecLabs Benchmark Methodology

## Environment

|         |                                     |
| ------- | ----------------------------------- |
| Machine | Apple M3                            |
| OS      | macOS                               |
| Rust    | 1.85.0                              |
| Dataset | 100,000 vectors, 384 dimensions     |
| Query   | top-10 approximate nearest neighbor |
| Metric  | cosine similarity                   |
| Samples | 1,000 queries per measurement       |
| Build   | release profile (`--release`)       |

## Results

### Query Latency - 100K vectors · 384 dimensions · top-10

|       | VecLabs     | Pinecone s1 | Qdrant | Weaviate |
| ----- | ----------- | ----------- | ------ | -------- |
| p50   | **1.271ms** | ~8ms        | ~4ms   | ~12ms    |
| p95   | **1.715ms** | ~15ms       | ~9ms   | ~25ms    |
| p99   | **2.011ms** | ~25ms       | ~15ms  | ~40ms    |
| p99.9 | **2.512ms** | ~40ms       | ~28ms  | ~60ms    |

### Query Latency - 100K vectors · 1536 dimensions · top-10

_(OpenAI text-embedding-ada-002 output size)_

|       | VecLabs |
| ----- | ------- |
| p50   | 2.995ms |
| p95   | 3.854ms |
| p99   | 4.688ms |
| p99.9 | 5.674ms |

### Query Latency - 10K vectors · 384 dimensions · top-10

|       | VecLabs |
| ----- | ------- |
| p50   | 773µs   |
| p95   | 1.014ms |
| p99   | 1.276ms |
| p99.9 | 2.150ms |

### Distance Computation - raw · 384 dimensions · Apple M3

| Operation          | Time   |
| ------------------ | ------ |
| Cosine similarity  | ~303ns |
| Euclidean distance | ~212ns |
| Dot product        | ~196ns |

### Cost Comparison - 1M vectors/month

|                | Monthly cost |
| -------------- | ------------ |
| VecLabs        | ~$20         |
| Pinecone s1    | $70          |
| Qdrant Cloud   | $25+         |
| Weaviate Cloud | $25+         |

VecLabs cost estimate based on Shadow Drive storage at
$0.05/GB/year for AES-256-GCM encrypted 384-dimension vectors.

## How to Reproduce

```bash
git clone https://github.com/veclabs/veclabs
cd veclabs
cargo run --release --example percentile_bench -p solvec-core
```

## Notes on Competitor Numbers

Pinecone, Qdrant, and Weaviate numbers are from their hosted
services measured over the network from a US-East client.
VecLabs numbers are in-process with no network overhead -
this is by design. The VecLabs SDK runs the query engine
in the same process as your application, eliminating the
network round-trip entirely.

For isolated distance computation benchmarks:

```bash
cargo bench -p solvec-core --bench distance_bench
```
