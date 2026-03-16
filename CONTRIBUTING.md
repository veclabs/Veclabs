# Contributing to VecLabs

Thanks for your interest in contributing. VecLabs is a vector database for AI agents with cryptographic memory proof — Rust HNSW core, WASM bridge, AES-256-GCM encryption, and SHA-256 Merkle roots posted to Solana after every write.

All contributions go through a review and approval process before anything is merged or deployed. This document explains how that works.

---

## How Contributions Work

1. You open an issue describing what you want to change and why
2. I review it and let you know if it's something I want in the project
3. If approved, you fork the repo and open a PR
4. I review the PR, request changes if needed, and merge when it's ready
5. I handle all deployments — nothing goes live without my sign-off

This is intentional. VecLabs is pre-seed infrastructure software. Every change to the Rust core, the Merkle tree implementation, or the Anchor program has to be reviewed carefully because the correctness of these components is the product.

---

## Before You Write Any Code

**Open an issue first.**

Describe:

- What you want to change or add
- Why it improves VecLabs
- Your rough approach

I'll respond within 48 hours. If I say yes — go build it. If I say no, I'll explain why. This saves everyone time.

Issues labeled `good first issue` are pre-approved — you can start immediately without waiting.

---

## What I'm Looking For

### Things I actively want help with

- **Performance improvements** to the Rust HNSW core — better ef values, smarter graph construction, faster distance computation
- **Python SDK parity** — the Python SDK is behind the TypeScript SDK by several phases
- **LangChain integration** — a `VecLabsMemory` class extending `BaseChatMemory`
- **LlamaIndex integration** — same idea, different framework
- **Bug fixes** — especially anything affecting Merkle root correctness or AES-256-GCM key derivation
- **Documentation** — improving any page in `web/docs/`
- **Test coverage** — adding tests for edge cases in `sdk/typescript/src/__tests__/` or `crates/solvec-core/src/`

### Things I will not merge

- Changes that break the cryptographic verification guarantees — the Merkle root must always reflect the true collection state
- Changes to the Solana Anchor program without a very strong reason — the on-chain program is the trust layer
- New dependencies added to the Rust core without discussion — every dependency adds attack surface
- Anything that adds a server requirement to the query path — queries must stay in-process
- Code that doesn't have tests

---

## Project Structure

```
veclabs/
├── crates/
│   ├── solvec-core/        Rust HNSW implementation, Merkle tree, AES-256-GCM
│   └── solvec-wasm/        WASM bridge — compiles solvec-core to WebAssembly
├── sdk/
│   ├── typescript/         TypeScript SDK — @veclabs/solvec on npm
│   └── python/             Python SDK — solvec on PyPI
├── programs/
│   └── solvec/             Solana Anchor program
├── demo/
│   └── agent-memory/       Next.js demo — demo.veclabs.xyz
└── web/                    Landing page + docs — veclabs.xyz
```

---

## Development Setup

### Requirements

- Rust 1.85+ with `wasm-pack`
- Node.js 20+
- Solana CLI + Anchor CLI (for program changes only)
- Python 3.9+ (for Python SDK changes)

### Setup

```bash
git clone https://github.com/veclabs/veclabs
cd veclabs

# Rust core
cd crates/solvec-core
cargo test

# WASM bridge
cd ../solvec-wasm
wasm-pack build --target nodejs --out-dir pkg-node --release

# TypeScript SDK
cd ../../sdk/typescript
npm install
npm test

# Demo
cd ../../demo/agent-memory
cp .env.local.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm install
npm run dev
```

---

## Making a Change

### Branch naming

```
feat/short-description       New feature
fix/short-description        Bug fix
docs/short-description       Documentation only
perf/short-description       Performance improvement
test/short-description       Tests only
```

Always branch from `develop`, never from `main`.

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

### Commits

Small, focused commits. One thing per commit. Descriptive messages:

```
feat(sdk): add getHistory() method to collection
fix(core): correct odd-leaf duplication in Merkle tree
perf(hnsw): reduce allocations in inner search loop
docs(typescript): add Shadow Drive configuration example
test(sdk): add persistence reload edge case tests
```

### Before opening a PR

```bash
# Rust — all tests must pass
cd crates/solvec-core && cargo test
cd ../solvec-wasm && cargo test --lib

# TypeScript — all tests must pass, currently 26/26
cd sdk/typescript && npm test

# If you touched the demo
cd demo/agent-memory && npm run build
```

All existing tests must keep passing. If your change requires updating a test, explain why in the PR description.

---

## The One Rule That Cannot Be Broken

**The Merkle root must always accurately reflect the collection state.**

`computeMerkleRootFromIds` in `sdk/typescript/src/merkle.ts` and `MerkleTree::new()` in `crates/solvec-core/src/merkle.rs` must produce identical outputs for identical inputs. If you change either implementation, you must change both and prove they match.

This is the cryptographic guarantee that VecLabs is built on. Breaking it silently would be a serious bug.

---

## Opening a PR

- Title: same format as commit messages
- Description: what changed, why, how you tested it
- Link the issue it closes: `Closes #123`
- Make sure CI passes before asking for review

I review PRs within 48 hours. I'll either merge it, request changes, or close it with an explanation.

---

## Questions

Open an issue or find me on X at [@veclabss](https://x.com/veclabss).

---

## License

VecLabs is MIT licensed. By contributing, you agree your contributions will be licensed under the same terms.
