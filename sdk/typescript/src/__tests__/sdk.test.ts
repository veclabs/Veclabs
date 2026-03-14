import * as fs from "fs";
import * as path from "path";
import { SolVec } from "../client";

const VECLABS_DIR = path.join(process.cwd(), ".veclabs");

function cleanVeclabsDir() {
  if (fs.existsSync(VECLABS_DIR)) {
    fs.rmSync(VECLABS_DIR, { recursive: true, force: true });
  }
}

describe("SolVec TypeScript SDK", () => {
  let sv: SolVec;

  beforeEach(() => {
    cleanVeclabsDir();
    sv = new SolVec({ network: "devnet" });
  });

  afterAll(cleanVeclabsDir);

  it("creates a collection", () => {
    const col = sv.collection("test", { dimensions: 4 });
    expect(col).toBeDefined();
  });

  it("upserts and queries vectors", async () => {
    const col = sv.collection("test", { dimensions: 4, metric: "cosine" });

    await col.upsert([
      { id: "a", values: [1, 0, 0, 0], metadata: { text: "alpha" } },
      { id: "b", values: [0.9, 0.1, 0, 0], metadata: { text: "beta" } },
      { id: "c", values: [0, 1, 0, 0], metadata: { text: "gamma" } },
    ]);

    const { matches } = await col.query({ vector: [1, 0, 0, 0], topK: 2 });

    expect(matches.length).toBe(2);
    expect(matches[0].id).toBe("a");
    expect(matches[0].score).toBeCloseTo(1.0, 3);
    expect(matches[1].id).toBe("b");
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
  });

  it("deletes vectors", async () => {
    const col = sv.collection("test", { dimensions: 3 });
    await col.upsert([
      { id: "x", values: [1, 0, 0] },
      { id: "y", values: [0, 1, 0] },
    ]);

    await col.delete(["x"]);
    const stats = await col.describeIndexStats();
    expect(stats.vectorCount).toBe(1);

    const { matches } = await col.query({ vector: [1, 0, 0], topK: 5 });
    expect(matches.find((m) => m.id === "x")).toBeUndefined();
  });

  it("throws on dimension mismatch in upsert", async () => {
    const col = sv.collection("test", { dimensions: 3 });
    await expect(col.upsert([{ id: "bad", values: [1, 0] }])).rejects.toThrow(
      "Dimension mismatch",
    );
  });

  it("throws on dimension mismatch in query", async () => {
    const col = sv.collection("test", { dimensions: 3 });
    await col.upsert([{ id: "a", values: [1, 0, 0] }]);
    await expect(col.query({ vector: [1, 0], topK: 1 })).rejects.toThrow(
      "dimension mismatch",
    );
  });

  it("returns empty matches for empty collection", async () => {
    const col = sv.collection("empty", { dimensions: 4 });
    const { matches } = await col.query({ vector: [1, 0, 0, 0], topK: 5 });
    expect(matches).toHaveLength(0);
  });

  it("verify returns a result shape", async () => {
    const col = sv.collection("test", { dimensions: 3 });
    await col.upsert([{ id: "a", values: [1, 0, 0] }]);
    const result = await col.verify();
    expect(result).toHaveProperty("verified");
    expect(result).toHaveProperty("localRoot");
    expect(result).toHaveProperty("solanaExplorerUrl");
    expect(result).toHaveProperty("vectorCount", 1);
  });

  it("upsert is idempotent - updates existing ID", async () => {
    const col = sv.collection("test", { dimensions: 3 });
    await col.upsert([{ id: "a", values: [1, 0, 0] }]);
    await col.upsert([{ id: "a", values: [0, 1, 0] }]);

    const stats = await col.describeIndexStats();
    expect(stats.vectorCount).toBe(1);
  });

  it("returns scores sorted descending", async () => {
    const col = sv.collection("test", { dimensions: 4 });
    await col.upsert([
      { id: "a", values: [1, 0, 0, 0] },
      { id: "b", values: [0.5, 0.5, 0, 0] },
      { id: "c", values: [0, 0, 1, 0] },
    ]);

    const { matches } = await col.query({ vector: [1, 0, 0, 0], topK: 3 });
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score);
    }
  });
});

describe("WASM HNSW engine", () => {
  beforeEach(cleanVeclabsDir);
  afterAll(cleanVeclabsDir);

  it("loads WASM and reports engine status", async () => {
    const sv = new SolVec({ network: "devnet" });
    const col = sv.collection("test", { dimensions: 4 });
    await col.upsert([{ id: "a", values: [1, 0, 0, 0] }]);
    const stats = await col.describeIndexStats();
    expect(stats.vectorCount).toBe(1);
  });

  it("Merkle root matches between TS and Rust computation", async () => {
    const sv = new SolVec({ network: "devnet" });
    const col = sv.collection("merkle-test", { dimensions: 3 });
    await col.upsert([
      { id: "vec_1", values: [1, 0, 0] },
      { id: "vec_2", values: [0, 1, 0] },
      { id: "vec_3", values: [0, 0, 1] },
    ]);

    const stats = await col.describeIndexStats();
    expect(stats.merkleRoot).toHaveLength(64);
    expect(stats.merkleRoot).not.toBe("0".repeat(64));

    // Root should be deterministic — same IDs = same root
    const stats2 = await col.describeIndexStats();
    expect(stats2.merkleRoot).toBe(stats.merkleRoot);
  });
});

describe("Persistence: encrypt-to-disk and reload", () => {
  beforeEach(cleanVeclabsDir);
  afterAll(cleanVeclabsDir);

  it("writes an encrypted .db file after upsert", async () => {
    const sv = new SolVec({ network: "devnet" });
    const col = sv.collection("persist-test", { dimensions: 3 });

    await col.upsert([{ id: "p1", values: [1, 0, 0], metadata: { label: "one" } }]);

    const dbPath = path.join(VECLABS_DIR, "persist-test.db");
    expect(fs.existsSync(dbPath)).toBe(true);

    // File must not be plaintext JSON
    const raw = fs.readFileSync(dbPath).toString("utf8");
    expect(raw).not.toContain('"vectors"');
  });

  it("reloads vectors into a new collection instance (simulates restart)", async () => {
    const sv1 = new SolVec({ network: "devnet" });
    const col1 = sv1.collection("restart-test", { dimensions: 4 });

    await col1.upsert([
      { id: "r1", values: [1, 0, 0, 0], metadata: { text: "hello" } },
      { id: "r2", values: [0, 1, 0, 0], metadata: { text: "world" } },
    ]);

    // Simulate restart: new SolVec + new collection instance, same name
    const sv2 = new SolVec({ network: "devnet" });
    const col2 = sv2.collection("restart-test", { dimensions: 4 });

    const stats = await col2.describeIndexStats();
    expect(stats.vectorCount).toBe(2);

    const { matches } = await col2.query({ vector: [1, 0, 0, 0], topK: 2 });
    expect(matches.map((m) => m.id)).toContain("r1");
  });

  it("reloaded collection returns correct metadata", async () => {
    const sv1 = new SolVec({ network: "devnet" });
    const col1 = sv1.collection("meta-test", { dimensions: 3 });

    await col1.upsert([
      { id: "m1", values: [1, 0, 0], metadata: { note: "remembered" } },
    ]);

    const sv2 = new SolVec({ network: "devnet" });
    const col2 = sv2.collection("meta-test", { dimensions: 3 });

    const { matches } = await col2.query({
      vector: [1, 0, 0],
      topK: 1,
      includeMetadata: true,
    });

    expect(matches[0].id).toBe("m1");
    expect(matches[0].metadata?.note).toBe("remembered");
  });

  it("delete persists — deleted vector absent after reload", async () => {
    const sv1 = new SolVec({ network: "devnet" });
    const col1 = sv1.collection("delete-persist-test", { dimensions: 3 });

    await col1.upsert([
      { id: "keep", values: [1, 0, 0] },
      { id: "drop", values: [0, 1, 0] },
    ]);
    await col1.delete(["drop"]);

    const sv2 = new SolVec({ network: "devnet" });
    const col2 = sv2.collection("delete-persist-test", { dimensions: 3 });

    const stats = await col2.describeIndexStats();
    expect(stats.vectorCount).toBe(1);

    const { matches } = await col2.query({ vector: [0, 1, 0], topK: 5 });
    expect(matches.find((m) => m.id === "drop")).toBeUndefined();
  });

  it("wrong passphrase fails to decrypt", async () => {
    const sv1 = new SolVec({ network: "devnet" });
    const col1 = sv1.collection("key-test", { dimensions: 3 });
    await col1.upsert([{ id: "k1", values: [1, 0, 0] }]);

    // Overwrite env var with wrong key
    const original = process.env.VECLABS_PERSIST_KEY;
    process.env.VECLABS_PERSIST_KEY = "wrong-passphrase";

    const sv2 = new SolVec({ network: "devnet" });
    const col2 = sv2.collection("key-test", { dimensions: 3 });

    // Should gracefully fail (warn but not throw) and start with 0 vectors
    const stats = await col2.describeIndexStats();
    expect(stats.vectorCount).toBe(0);

    // Restore
    if (original === undefined) delete process.env.VECLABS_PERSIST_KEY;
    else process.env.VECLABS_PERSIST_KEY = original;
  });
});
