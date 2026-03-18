# @veclabs/recall

The intelligence layer for VecLabs. Memory Inspector + Context Retrieval for AI agents.

> **Status:** In development — Phase 7. API types are published for preview.
> Implementation ships after Memory Inspector (Phase 6).

---

## What this does

`@veclabs/recall` wraps `@veclabs/solvec` collections and answers a different question.

`@veclabs/solvec` answers: **"what is similar to this?"**
`@veclabs/recall` answers: **"what should this agent know right now?"**

These are different. Semantic similarity ≠ contextual relevance.

---

## Preview API

```typescript
import { SolVec } from '@veclabs/solvec'
import { Recall } from '@veclabs/recall'

const sv = new SolVec({ network: 'devnet' })
const memory = sv.collection('agent-memory', { dimensions: 1536 })
const recall = new Recall(memory)

const context = await recall.getContext({
  task: queryEmbedding,          // what the agent is doing now
  strategy: 'balanced',          // how to weight and select memories
  maxTokens: 2000                // fit the LLM context window
})

// {
//   persistent: [...],   always-relevant memories
//   recent: [...],       recency-weighted
//   relevant: [...],     similarity-weighted
//   novel: [...],        things agent hasn't seen recently
//   conflicts: [...],    memories that may contradict current task
//   tokenCount: 1847
// }
```

---

## Installation (preview)

```bash
npm install @veclabs/recall
```

Requires `@veclabs/solvec@>=0.1.0-alpha.6` as a peer dependency.

---

## Links

- Homepage: [veclabs.xyz](https://veclabs.xyz)
- GitHub: [github.com/veclabs/veclabs](https://github.com/veclabs/veclabs)
- Storage package: [@veclabs/solvec](https://www.npmjs.com/package/@veclabs/solvec)
