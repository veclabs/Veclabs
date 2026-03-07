## Context

You are building the production landing page for **VecLabs** at `veclabs.xyz`.

This is a Next.js App Router project located in the `web/` folder of the monorepo. The current `page.tsx` has a Spline component and very basic content — replace it entirely. Do not use the Spline component anywhere.

**What VecLabs is:** The vector database for AI agents with cryptographic memory proof. Rust HNSW core, 4.3ms p99 query latency, Solana on-chain Merkle proofs after every write.

**Who visits this site:**
- AI engineers evaluating vector databases (primary)
- VCs doing due diligence after seeing a pitch or tweet (secondary)
- Enterprise technical leads in regulated industries (tertiary)

---

## Brand Rules — Follow These Exactly

**Colors — CSS variables, define in globals.css:**

```css
:root {
  --color-surface:  #FFFFFF;
  --color-ink:      #0A0A0A;
  --color-muted:    #6B7280;
  --color-border:   #E5E7EB;
  --color-accent:   #E8930A;
  --color-code-bg:  #F9FAFB;
}
```

**Typography:**
- Load Geist and Geist Mono from `next/font/google` or via `@import` from fonts.google.com
- Headings: Geist Semibold, tracking `-0.02em`
- Body: Geist Regular
- All numbers, code, IDs, hashes: Geist Mono
- Never use Inter, system-ui, or any other font

**Design rules:**
- White dominant surface everywhere
- Amber `#E8930A` on ONE element per section maximum — a number, a button label, a highlighted word
- No gradients on backgrounds
- No shadows deeper than `0 1px 3px rgba(0,0,0,0.06)`
- No rounded corners larger than 6px on interactive elements
- Borders: always `1px solid #E5E7EB`
- Animations: subtle, purposeful — fade-in on scroll, no bouncing or spinning
- Mobile responsive — everything works at 375px width

**Logo component:** Import from `web/components/Logo.tsx` which contains `LogoMark`, `Wordmark`, and `LogoLockup`. Use `LogoLockup` in the nav and footer.

---

## Site Structure

Build all of this in `web/src/app/page.tsx`. The demo route at `/demo` is handled separately — leave `web/src/app/demo/` alone.

```
web/src/app/
├── page.tsx          ← build this (the landing page)
├── layout.tsx        ← update fonts and metadata only
├── globals.css       ← add brand CSS variables
├── demo/
│   └── page.tsx      ← DO NOT TOUCH
└── api/
    └── chat/
        └── route.ts  ← DO NOT TOUCH
```

---

## Section-by-Section Specification

### Section 1 — Navigation

Fixed top nav, white background, 1px bottom border `#E5E7EB`.

Left: `LogoLockup` at `markSize={28}`.

Right: three text links + one button.
- Links: `Docs`, `GitHub` (opens github.com/veclabs/veclabs), `Benchmarks`
- Button: `npm install @veclabs/solvec` — clicking copies to clipboard, button text changes to `Copied` for 2 seconds then reverts
- Button style: black background, white text, Geist Mono 12px, padding 8px 16px, border-radius 4px

On mobile: hamburger menu, links stack vertically.

---

### Section 2 — Hero

Full viewport height. Centered content. White background.

**Eyebrow label** (above headline):

```
Geist Mono · 11px · #6B7280 · tracking 0.12em · uppercase
"Vector Database · Solana Devnet Live · MIT Licensed"
```

**Headline** — two lines, Geist Semibold 72px on desktop / 40px mobile, tracking -0.02em, color `#0A0A0A`:

```
The vector database
for AI agents that proves what it remembers.
```

The word `proves` is colored `#E8930A`. Everything else is `#0A0A0A`.

**Subheadline** — Geist Regular 20px, color `#6B7280`, max-width 560px, centered:

```
Rust HNSW core. Solana on-chain Merkle proof after every write.
4.3ms p99. 88% cheaper than Pinecone.
```

**CTA row** — two elements, centered, gap 16px:
1. Primary button: black bg, white text, `Get Early Access →`, links to `#waitlist`
2. Secondary button: white bg, black border, `View on GitHub →`, links to github.com/veclabs/veclabs

**Stat pills row** — below CTAs, three pills with `1px solid #E5E7EB` border, border-radius 4px, padding 6px 14px:
- `< 5ms p99` in Geist Mono 12px
- `Solana devnet live` in Geist Mono 12px

- `MIT licensed` in Geist Mono 12px

**Scroll animation:** Hero content fades in over 600ms on load, staggered — eyebrow first, then headline, then sub, then CTAs, then pills.

---

### Section 3 — Live Benchmark

Section heading: `Benchmarks` in Geist Mono 11px uppercase tracking 0.12em, color `#6B7280`.

**Latency table** — full width, clean borders, no zebra striping:

|  | VecLabs | Pinecone s1 | Qdrant | Weaviate |
| --- | --- | --- | --- | --- |
| p50 | **1.9ms** | ~8ms | ~4ms | ~12ms |
| p95 | **2.8ms** | ~15ms | ~9ms | ~25ms |
| p99 | **4.3ms** | ~25ms | ~15ms | ~40ms |

VecLabs column: values in Geist Mono, color `#E8930A`. Other columns: `#6B7280`.
Table header row: Geist Mono 11px uppercase. Data rows: Geist Mono 14px.
Bottom footnote: `Geist Regular 12px #6B7280` — “Apple M2 · 16GB RAM · 100K vectors · 384 dimensions · top-10 ANN query · methodology: github.com/veclabs/veclabs/benchmarks”

**Animate on scroll:** The amber numbers count up from 0 when the section enters the viewport. Use IntersectionObserver + a simple counter animation over 800ms.

---

### Section 4 — Code / Migration

Two-column layout on desktop, single column mobile.

**Left column — heading and copy:**

```
Heading: "Migrate from Pinecone in 3 lines."
Body: "The SolVec API is shaped to match Pinecone exactly.
Change the import, the client, and the collection call.
Every other line of your code stays identical."
```

Below the copy, one line in Geist Mono 13px color `#E8930A`:

```
index.verify()  // new — Pinecone has no equivalent
```

**Right column — code tabs:**

Two tabs: `TypeScript` and `Python`. Tab style: Geist Mono 12px, active tab has 1px bottom border in `#0A0A0A`, inactive is `#6B7280`.

TypeScript tab content:

```tsx
// Before — Pinecone
import { Pinecone } from '@pinecone-database/pinecone'
const pc = new Pinecone({ apiKey: 'YOUR_KEY' })
const index = pc.index('my-index')

// After — VecLabs (3 lines changed)
import { SolVec } from '@veclabs/solvec'
const sv = new SolVec({ network: 'mainnet-beta' })
const index = sv.collection('my-index')

// Everything below is identical
await index.upsert([{ id: 'vec_001', values: [...] }])
const results = await index.query({ vector: [...], topK: 10 })

// New — Pinecone has no equivalent
const proof = await index.verify()
console.log(proof.solanaExplorerUrl)
```

Python tab content:

```python
# Before — Pinecone
from pinecone import Pinecone
pc = Pinecone(api_key="YOUR_KEY")
index = pc.Index("my-index")

# After — VecLabs (3 lines changed)
from solvec import SolVec
sv = SolVec(wallet="~/.config/solana/id.json")
index = sv.collection("my-index")

# Everything below is identical
index.upsert([{"id": "vec_001", "values": [...]}])
results = index.query(vector=[...], top_k=10)

# New — Pinecone has no equivalent
proof = index.verify()
print(proof.solana_explorer_url)
```

Code block style: background `#0A0A0A`, Geist Mono 13px, line height 1.7, padding 24px, border-radius 6px. Comments in `#4B5563`. Strings/values in `#E8930A`. Keywords in `#9CA3AF`. Copy button top-right, appears on hover.

---

### Section 5 — Architecture

Section heading: `Architecture`

Three columns, equal width, separated by 1px vertical borders. On mobile: stack vertically.

**Column 1 — Speed Layer:**

```
Label (Geist Mono 10px uppercase #6B7280): "Speed Layer"
Title (Geist Semibold 20px #0A0A0A): "Rust HNSW"
Body (Geist Regular 15px #6B7280):
"No garbage collector. No JVM pauses. No Python GIL.
The query engine is pure Rust — insert, delete, and
search run in the same process with zero serialization overhead."
Stat: "4.3ms" in Geist Mono 48px #E8930A
Stat label: "p99 at 100K vectors" in Geist Mono 11px #6B7280
```

**Column 2 — Storage Layer:**

```
Label: "Storage Layer"
Title: "Shadow Drive"
Body: "Vectors are encrypted with AES-256-GCM using a key
derived from your Solana wallet before leaving the SDK.
VecLabs cannot read your data. Nobody can."
Stat: "AES-256" in Geist Mono 48px #0A0A0A
Stat label: "GCM encryption" in Geist Mono 11px #6B7280
```

**Column 3 — Trust Layer:**

```
Label: "Trust Layer"
Title: "Solana"
Body: "After every write, a 32-byte SHA-256 Merkle root
is posted on-chain. One transaction. $0.00025. 400ms finality.
The root is permanent and public — anyone can verify it."
Stat: "32B" in Geist Mono 48px #0A0A0A
Stat label: "Merkle root, on-chain" in Geist Mono 11px #6B7280
```

Below the three columns, full-width panel with background `#F9FAFB`, border `1px solid #E5E7EB`, padding 24px:

```
Geist Mono 12px #6B7280:
"Live on Solana devnet — Program: 8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP"
```

This is a link that opens the Solana Explorer URL in a new tab.

---

### Section 6 — Comparison Table

Section heading: `How VecLabs compares`

Full-width table. VecLabs column has a subtle `1px solid #E8930A` left border to distinguish it. No colored backgrounds.

|  | VecLabs | Pinecone | Qdrant | Weaviate |
| --- | --- | --- | --- | --- |
| Query latency (p99) | 4.3ms | ~25ms | ~15ms | ~40ms |
| Monthly cost (1M vectors) | ~$8 | $70 | $25+ | $25+ |
| Data ownership | Your wallet | Their servers | Their servers | Their servers |
| On-chain audit trail | Yes | No | No | No |
| Verifiable memory | Yes | No | No | No |
| Open source | Yes (MIT) | No | Yes | Yes |
| Vendor lock-in | None | High | Medium | Medium |

Checkmark style: `#0A0A0A` text “Yes”. X style: `#E5E7EB` text “No”. VecLabs “Yes” values: `#E8930A`.

---

### Section 7 — Use Cases

Three cards, horizontal on desktop, stacked on mobile.
Card style: white bg, `1px solid #E5E7EB` border, border-radius 6px, padding 32px. No shadow.

**Card 1:**

```
Eyebrow: "AI Agents"
Title: "LangChain · AutoGen · CrewAI"
Body: "Drop-in replacement for Pinecone in any agent framework.
Your agent's memory is searchable in milliseconds and
provably unmodified — verifiable by anyone."
```

**Card 2:**

```
Eyebrow: "Enterprise AI"
Title: "Compliance & Auditability"
Body: "Healthcare, legal, and financial AI systems need
proof of what the model knew and when. VecLabs provides
immutable on-chain records that satisfy regulatory audit requirements."
```

**Card 3:**

```
Eyebrow: "RAG Systems"
Title: "Retrieval-Augmented Generation"
Body: "Index your knowledge base once. Query it at Rust speed.
Verify the index hasn't drifted or been tampered with
before every generation call."
```

---

### Section 8 — Waitlist / Early Access

ID: `waitlist` (so the nav CTA can anchor to it)

Background: `#0A0A0A`. Text: `#FFFFFF`. Padding: 96px top/bottom.

**Heading** (Geist Semibold 48px white):

```
Get early access.
```

**Subheading** (Geist Regular 18px `#6B7280`):

```
Free hosted tier for the first 500 developers.
No credit card. No Solana wallet required.
```

**Email input row:**
- Input: white background, `#0A0A0A` border, Geist Regular 15px, placeholder “your@email.com”
- Button: `#E8930A` background, `#0A0A0A` text, Geist Semibold 14px, text “Request Access”
- On submit: POST to `/api/waitlist` (stub the route — just return `{ ok: true }` for now)
- Success state: replace form with “You’re on the list.” in Geist Mono 16px white

**Below the form**, three small stat items in a row:

```
"Solana devnet live"  ·  "@veclabs/solvec on npm"  ·  "MIT licensed"
```

All in Geist Mono 11px `#4B5563`.

---

### Section 9 — Footer

White background. Top border `1px solid #E5E7EB`. Padding 48px top/bottom.

Two rows:

**Row 1:** `LogoLockup` left. Right side: links in Geist Regular 14px `#6B7280`:
`GitHub` · `npm` · `PyPI` · `Discord` · `Twitter`

**Row 2:** Left: `© 2026 VecLabs. MIT Licensed.` in Geist Regular 12px `#6B7280`.
Right: `Built with Rust and Solana.` in Geist Mono 12px `#6B7280`.

---

## Demo Route

Create `web/src/app/demo/page.tsx` that embeds the agent memory demo chat interface. This is a full-page chat UI — move the entire demo from `demo/agent-memory/src/app/page.tsx` into this file. The API route stays at `web/src/app/api/chat/route.ts` — copy it from `demo/agent-memory/src/app/api/chat/route.ts`.

The demo page should have:
- Nav matching the main site nav (same component)
- A heading: “Agent Memory Demo” in Geist Semibold 32px
- Subheading: “Type anything. Watch it become a vector, stored with a Merkle root.” in Geist Regular 16px `#6B7280`
- The full chat interface below
- A footer note: “Memory resets on server restart. Persistent storage via Shadow Drive ships in v0.2.” in Geist Mono 11px `#6B7280`

---

## Waitlist API Route

Create `web/src/app/api/waitlist/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server'

// In production this writes to a database
// For now: log to console and return success
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  console.log(`[VecLabs Waitlist] New signup:${email}`)

  //TODO Phase 4: write to Supabase waitlist table

  return NextResponse.json({ ok: true })
}
```

---

## Execution Order for Cursor

```bash
# 1. Update globals.css with brand tokens
# 2. Update layout.tsx with Geist font loading and metadata
# 3. Build page.tsx section by section
# 4. Create demo/page.tsx
# 5. Create api/waitlist/route.ts
# 6. Copy chat route from demo/agent-memory to api/chat/route.ts
# 7. npm run dev — verify everything works
# 8. npm run build — fix any type errors
# 9. vercel --prod — deploy
```

## Success Criteria

- [ ]  `npm run build` completes with zero errors
- [ ]  Site loads at localhost:3000
- [ ]  Demo works at localhost:3000/demo
- [ ]  Copy button in nav works
- [ ]  Email form submits and shows success state
- [ ]  Benchmark numbers animate on scroll
- [ ]  Code tabs switch correctly
- [ ]  All links open correctly
- [ ]  Mobile layout works at 375px
- [ ]  `vercel --prod` deploys successfully
- [ ]  veclabs.xyz loads the new landing page
- [ ]  veclabs.xyz/demo loads the chat interface