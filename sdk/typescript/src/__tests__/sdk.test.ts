import { SolVec } from "../client";

describe("SolVec TypeScript SDK", () => {
  let sv: SolVec;

  beforeEach(() => {
    sv = new SolVec({ network: "devnet" });
  });

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
