import type { QueryMatch } from '@veclabs/solvec';

export type RetrievalStrategy =
  | 'balanced'    // mix of all strategies
  | 'recency'     // weight recent memories higher
  | 'similarity'  // pure semantic similarity
  | 'diverse'     // maximize coverage, minimize redundancy
  | 'precise';    // high threshold, few high-quality results

export interface GetContextOptions {
  /** Embedding of what the agent is doing right now */
  task: number[];
  /** Embeddings of recent messages/actions in this session */
  sessionHistory?: number[][];
  /** IDs of memories to always include regardless of query */
  persistent?: string[];
  /** Maximum tokens to include in assembled context */
  maxTokens?: number;
  /** How to weight and select memories */
  strategy?: RetrievalStrategy;
  /** Minimum similarity score (0-1) */
  minScore?: number;
}

export interface ContextResult {
  /** Memories always included (from persistent IDs) */
  persistent: QueryMatch[];
  /** Recently accessed/created memories */
  recent: QueryMatch[];
  /** Semantically most similar to current task */
  relevant: QueryMatch[];
  /** Memories not seen recently — may be novel context */
  novel: QueryMatch[];
  /** Memories that may conflict with current task */
  conflicts: QueryMatch[];
  /** Estimated token count of all memories combined */
  tokenCount: number;
  /** Strategy used */
  strategy: RetrievalStrategy;
}

export interface RecallConfig {
  /** Default strategy if not specified per call */
  defaultStrategy?: RetrievalStrategy;
  /** Default max tokens if not specified per call */
  defaultMaxTokens?: number;
  /** Whether to log operations for Memory Inspector */
  enableInspector?: boolean;
}
