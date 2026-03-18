import type { SolVecCollection } from '@veclabs/solvec';
import type { GetContextOptions, ContextResult, RecallConfig } from './types';

/**
 * Recall — the intelligence layer for VecLabs
 *
 * Wraps a SolVecCollection and provides structured context assembly
 * for AI agents. Answers: "what should this agent know right now?"
 *
 * @example
 * ```typescript
 * import { Recall } from '@veclabs/recall'
 *
 * const recall = new Recall(collection)
 * const context = await recall.getContext({
 *   task: queryEmbedding,
 *   strategy: 'balanced',
 *   maxTokens: 2000
 * })
 * ```
 */
export class Recall {
  private collection: SolVecCollection;
  private config: RecallConfig;

  constructor(collection: SolVecCollection, config: RecallConfig = {}) {
    this.collection = collection;
    this.config = {
      defaultStrategy: 'balanced',
      defaultMaxTokens: 2000,
      enableInspector: true,
      ...config,
    };
  }

  /**
   * Assemble structured context for an agent decision.
   *
   * Returns memories organized by retrieval strategy:
   * - persistent: always-relevant memories (by ID)
   * - recent: recency-weighted memories
   * - relevant: similarity-weighted memories
   * - novel: memories not retrieved recently
   * - conflicts: memories that may contradict the current task
   *
   * @param options - Context assembly options
   * @returns Structured context object with token count
   */
  async getContext(options: GetContextOptions): Promise<ContextResult> {
    // TODO: implement in Phase 7
    // This is a placeholder that returns the shape
    throw new Error(
      '@veclabs/recall is not yet implemented. ' +
      'Memory Inspector (Phase 6) and Context Retrieval (Phase 7) are in development. ' +
      'Follow https://github.com/veclabs/veclabs for updates.'
    );
  }
}
