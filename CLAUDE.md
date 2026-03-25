# VecLabs - Claude Code Instructions

## Token Optimization Rules

- Read only files explicitly listed in the prompt
- Do not re-read files already read this session
- Write code directly - no preamble before doing it
- No summary after doing it - just show the result
- Skip comments unless they explain non-obvious logic
- When running tests, show only failures
- Do not ask clarifying questions - decide and state it in one line

## Project Context

- Monorepo: Rust core, TypeScript SDK, Python SDK, Next.js demo, Solana Anchor program
- Always branch from develop, never from main
- Commit after each small feature, not at the end
- Run npm test in sdk/typescript after any SDK change - must stay at 16/16

## Stack

- Rust: crates/solvec-core, crates/solvec-wasm
- TypeScript SDK: sdk/typescript/src/
- Demo: demo/agent-memory/src/
- Anchor program: programs/solvec/
