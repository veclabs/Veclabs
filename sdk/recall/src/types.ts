import type { QueryMatch } from '@veclabs/solvec'

export type RetrievalStrategy =
  | 'balanced'
  | 'recency'
  | 'similarity'
  | 'diverse'
  | 'precise'

export interface GetContextOptions {
  task:            number[]
  sessionHistory?: number[][]
  persistent?:     string[]
  maxTokens?:      number
  strategy?:       RetrievalStrategy
  minScore?:       number
}

export interface ContextResult {
  persistent:  QueryMatch[]
  recent:      QueryMatch[]
  relevant:    QueryMatch[]
  novel:       QueryMatch[]
  conflicts:   QueryMatch[]
  tokenCount:  number
  strategy:    RetrievalStrategy
}

export interface RecallConfig {
  defaultStrategy?:  RetrievalStrategy
  defaultMaxTokens?: number
  enableInspector?:  boolean
}
