import { mockEmbed } from './MockEmbedder';
import { AGENT_EVENTS } from './events';

export interface SimpleMemory {
  id: string;
  text: string;
  vector: number[];
  metadata: Record<string, unknown>;
  writtenAt: number;
}

export interface SimpleStore {
  insert(id: string, vector: number[], metadata: Record<string, unknown>): void;
  query(vector: number[], topK: number): Array<{ id: string; score: number; metadata: Record<string, unknown> }>;
  delete(id: string): void;
  getVector(id: string): number[] | undefined;
  setVector(id: string, values: number[]): void;
  getAllIds(): string[];
  size(): number;
}

export class AgentLoop {
  private running = false;
  private intervalMs = 1200;
  private eventIdx = 0;
  private memoryCount = 0;
  private store: SimpleStore;
  private onWrite: (m: SimpleMemory) => void;
  private onStats: () => void;
  private memories: Map<string, SimpleMemory> = new Map();

  constructor(store: SimpleStore, onWrite: (m: SimpleMemory) => void, onStats: () => void) {
    this.store = store;
    this.onWrite = onWrite;
    this.onStats = onStats;
  }

  start() {
    this.running = true;
    this.tick();
  }

  pause() {
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  setSpeed(ms: number) {
    this.intervalMs = Math.max(200, ms);
  }

  private async tick() {
    if (!this.running) return;

    const event = AGENT_EVENTS[this.eventIdx % AGENT_EVENTS.length];
    this.eventIdx++;
    this.memoryCount++;

    const id = `mem_${String(this.memoryCount).padStart(4, '0')}`;
    const vector = mockEmbed(event.text);
    const metadata: Record<string, unknown> = {
      text: event.text,
      category: event.category,
    };

    this.store.insert(id, vector, metadata);

    const mem: SimpleMemory = {
      id,
      text: event.text,
      vector,
      metadata,
      writtenAt: Date.now(),
    };
    this.memories.set(id, mem);
    this.onWrite(mem);
    this.onStats();

    setTimeout(() => this.tick(), this.intervalMs);
  }

  async addCustomMemory(text: string): Promise<SimpleMemory> {
    this.memoryCount++;
    const id = `user_${String(this.memoryCount).padStart(4, '0')}`;
    const vector = mockEmbed(text);
    const metadata: Record<string, unknown> = {
      text,
      category: 'user_input',
    };

    this.store.insert(id, vector, metadata);

    const mem: SimpleMemory = {
      id,
      text,
      vector,
      metadata,
      writtenAt: Date.now(),
    };
    this.memories.set(id, mem);
    this.onWrite(mem);
    this.onStats();
    return mem;
  }

  queryMemories(text: string, topK = 5): Array<{ id: string; score: number; text: string }> {
    const qVec = mockEmbed(text);
    const results = this.store.query(qVec, topK);
    return results.map((r) => ({
      id: r.id,
      score: r.score,
      text: (r.metadata?.text as string) ?? r.id,
    }));
  }

  tamperMemory(id: string): boolean {
    const orig = this.store.getVector(id);
    if (!orig) return false;
    const corrupted = orig.map(() => 999.0);
    this.store.setVector(id, corrupted);
    this.onStats();
    return true;
  }

  restoreMemory(id: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    this.store.setVector(id, mem.vector);
    this.onStats();
    return true;
  }

  getMemories(): SimpleMemory[] {
    return Array.from(this.memories.values()).reverse();
  }
}
