import * as fs from 'fs';
import * as path from 'path';
import { SolVec } from '../client';
import { MemoryInspector } from '../inspector';

const VECLABS_DIR = path.join(process.cwd(), '.veclabs');

function cleanVeclabsDir() {
  if (fs.existsSync(VECLABS_DIR)) {
    fs.rmSync(VECLABS_DIR, { recursive: true, force: true });
  }
}

describe('MemoryInspector', () => {
  beforeEach(cleanVeclabsDir);
  afterAll(cleanVeclabsDir);

  function makeCollection(name: string, dims = 4) {
    const sv = new SolVec({ network: 'devnet' });
    return sv.collection(name, { dimensions: dims });
  }

  it('stats() returns correct memory count', async () => {
    const col = makeCollection('inspect-stats');
    await col.upsert([
      { id: 'a', values: [1, 0, 0, 0] },
      { id: 'b', values: [0, 1, 0, 0] },
      { id: 'c', values: [0, 0, 1, 0] },
    ]);
    const inspector = col.inspector();
    const stats = await inspector.stats();
    expect(stats.totalMemories).toBe(3);
    expect(stats.dimensions).toBe(4);
  });

  it('stats() encrypted flag reflects store config', async () => {
    const col = makeCollection('inspect-enc');
    await col.upsert([{ id: 'a', values: [1, 0, 0, 0] }]);
    const stats = await col.inspector().stats();
    expect(typeof stats.encrypted).toBe('boolean');
  });

  it('inspect() returns all memories with no filter', async () => {
    const col = makeCollection('inspect-all');
    await col.upsert([
      { id: 'a', values: [1, 0, 0, 0] },
      { id: 'b', values: [0, 1, 0, 0] },
    ]);
    const result = await col.inspector().inspect();
    expect(result.totalMatching).toBe(2);
    expect(result.memories).toHaveLength(2);
  });

  it('inspect() limit works', async () => {
    const col = makeCollection('inspect-limit');
    await col.upsert([
      { id: 'a', values: [1, 0, 0, 0] },
      { id: 'b', values: [0, 1, 0, 0] },
      { id: 'c', values: [0, 0, 1, 0] },
    ]);
    const result = await col.inspector().inspect({ limit: 2 });
    expect(result.memories).toHaveLength(2);
    expect(result.totalMatching).toBe(3);
  });

  it('inspect() writtenAfter filters correctly', async () => {
    const col = makeCollection('inspect-time');
    const insp = col.inspector();
    await col.upsert([{ id: 'early', values: [1, 0, 0, 0] }]);
    const midpoint = Date.now();
    await new Promise((r) => setTimeout(r, 20));
    await col.upsert([{ id: 'late', values: [0, 1, 0, 0] }]);

    const result = await insp.inspect({ writtenAfter: midpoint });
    expect(result.totalMatching).toBeGreaterThanOrEqual(1);
    expect(result.memories.every((m) => m.writtenAt >= midpoint)).toBe(true);
  });

  it('get() returns memory by id', async () => {
    const col = makeCollection('inspect-get');
    await col.upsert([
      { id: 'target', values: [1, 0, 0, 0], metadata: { tag: 'found' } },
    ]);
    const mem = await col.inspector().get('target');
    expect(mem).not.toBeNull();
    expect(mem!.id).toBe('target');
    expect(mem!.metadata.tag).toBe('found');
  });

  it('get() returns null for unknown id', async () => {
    const col = makeCollection('inspect-get-null');
    await col.upsert([{ id: 'a', values: [1, 0, 0, 0] }]);
    const mem = await col.inspector().get('nonexistent');
    expect(mem).toBeNull();
  });

  it('searchWithRecords() returns scores and records', async () => {
    const col = makeCollection('inspect-search');
    await col.upsert([
      { id: 'a', values: [1, 0, 0, 0] },
      { id: 'b', values: [0.9, 0.1, 0, 0] },
      { id: 'c', values: [0, 0, 0, 1] },
    ]);
    const results = await col.inspector().searchWithRecords([1, 0, 0, 0], 2);
    expect(results).toHaveLength(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].memory.id).toBeDefined();
  });

  it('merkleHistory() grows on each write', async () => {
    const col = makeCollection('inspect-merkle');
    const insp = col.inspector();
    await col.upsert([{ id: 'a', values: [1, 0, 0, 0] }]);
    await col.upsert([{ id: 'b', values: [0, 1, 0, 0] }]);
    const history = await insp.merkleHistory();
    expect(history.length).toBe(2);
    expect(history[0].trigger).toBe('write');
  });

  it('verify() returns match property', async () => {
    const col = makeCollection('inspect-verify');
    await col.upsert([{ id: 'a', values: [1, 0, 0, 0] }]);
    const v = await col.inspector().verify();
    expect(typeof v.match).toBe('boolean');
    expect(v.localRoot).toHaveLength(64);
  });

  it('store.inspector() returns MemoryInspector instance', () => {
    const col = makeCollection('inspect-factory');
    const insp = col.inspector();
    expect(insp).toBeInstanceOf(MemoryInspector);
    expect(col.inspector()).toBe(insp);
  });
});
