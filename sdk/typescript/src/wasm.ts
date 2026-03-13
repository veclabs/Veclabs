import type { WasmHNSWIndex as WasmIndexType } from '../../../crates/solvec-wasm/pkg-node/solvec_wasm';

let wasmModule: typeof import('../../../crates/solvec-wasm/pkg-node/solvec_wasm') | null = null;
let wasmLoadAttempted = false;

export async function loadWasm() {
  if (wasmLoadAttempted) return wasmModule;
  wasmLoadAttempted = true;

  try {
    wasmModule = await import('../../../crates/solvec-wasm/pkg-node/solvec_wasm');
    console.log('[SolVec] Rust HNSW engine loaded via WASM');
  } catch (e) {
    console.warn('[SolVec] WASM unavailable, using JS fallback:', e);
    wasmModule = null;
  }

  return wasmModule;
}

export function getWasm() {
  return wasmModule;
}

export type { WasmIndexType };
