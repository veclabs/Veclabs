# @veclabs/recall

The intelligence layer for VecLabs. Memory Inspector and Context Retrieval
for AI agents.

Status: In development. Phase 7. Types published for preview.

---

## What this does

@veclabs/solvec answers: what is similar to this?
@veclabs/recall answers: what should this agent know right now?

These are different questions. Semantic similarity is not contextual relevance.

---

## Preview API

```typescript
import { SolVec }  from '@veclabs/solvec'
import { Recall }  from '@veclabs/recall'

const sv     = new SolVec({ network: 'devnet' })
const memory = sv.collection('agent-memory', { dimensions: 1536 })
const recall = new Recall(memory)

const context = await recall.getContext({
  task:      queryEmbedding,
  strategy:  'balanced',
  maxTokens: 2000
})

// context.persistent  — always-relevant memories
// context.recent      — recency weighted
// context.relevant    — semantically close
// context.novel       — unseen recently
// context.conflicts   — contradicts current task
// context.tokenCount  — 1847
```

---

## Installation

```bash
npm install @veclabs/recall
```

Requires @veclabs/solvec@>=0.1.0-alpha.6.

---

## Links

Homepage:  https://veclabs.xyz
GitHub:    https://github.com/veclabs/veclabs
Storage:   https://www.npmjs.com/package/@veclabs/solvec
