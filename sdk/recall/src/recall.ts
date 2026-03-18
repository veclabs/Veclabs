import type { SolVecCollection } from '@veclabs/solvec'
import type { GetContextOptions, ContextResult, RecallConfig } from './types'

export class Recall {
  private collection: SolVecCollection
  private config:     RecallConfig

  constructor(collection: SolVecCollection, config: RecallConfig = {}) {
    this.collection = collection
    this.config = {
      defaultStrategy:  'balanced',
      defaultMaxTokens: 2000,
      enableInspector:  true,
      ...config,
    }
  }

  async getContext(options: GetContextOptions): Promise<ContextResult> {
    throw new Error(
      '@veclabs/recall is not yet implemented. ' +
      'Phase 6 (Memory Inspector) and Phase 7 (Context Retrieval) ' +
      'are in development. See github.com/veclabs/veclabs for updates.'
    )
  }
}
