import type { WasmHNSWIndex as WasmIndexType } from '../../../crates/solvec-wasm/pkg-node/solvec_wasm';
import * as nodePath from 'path';

type WasmModule = typeof import('../../../crates/solvec-wasm/pkg-node/solvec_wasm');

let wasmModule: WasmModule | null = null;
let wasmLoadAttempted = false;

export async function loadWasm(): Promise<WasmModule | null> {
  if (wasmLoadAttempted) return wasmModule;
  wasmLoadAttempted = true;

  // Browser / client-component context: nodejs-target WASM cannot run here.
  const isBrowser = typeof (globalThis as { window?: unknown }).window !== 'undefined';
  if (isBrowser) {
    console.warn('[SolVec] WASM unavailable in browser context, using JS fallback');
    return null;
  }

  // Vercel production: NEXT_PUBLIC_VERCEL_URL is injected at build time.
  // Load the nodejs-target WASM module from public/wasm/, which Vercel makes
  // available on the serverless-function filesystem alongside static assets.
  // The path is built at runtime so Turbopack cannot trace it at build time.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    try {
      const wasmJsPath = nodePath.join(process.cwd(), 'public', 'wasm', 'solvec_wasm');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(wasmJsPath) as WasmModule;
      console.log('[SolVec] Rust HNSW engine loaded from /public/wasm (Vercel)');
    } catch (e) {
      console.warn('[SolVec] WASM unavailable from public/wasm, using JS fallback:', e);
      wasmModule = null;
    }
    return wasmModule;
  }

  // Local Node.js: tests and local dev (no NEXT_PUBLIC_VERCEL_URL).
  // Path is constructed at runtime via array-join so bundlers (Turbopack/webpack)
  // cannot statically resolve it and will not fail the build if pkg-node is absent.
  try {
    const segments = ['..', '..', '..', 'crates', 'solvec-wasm', 'pkg-node', 'solvec_wasm'];
    const pkgPath = segments.join('/');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    wasmModule = require(pkgPath) as WasmModule;
    console.log('[SolVec] Rust HNSW engine loaded via WASM (local Node.js)');
  } catch (e) {
    console.warn('[SolVec] WASM unavailable, using JS fallback:', e);
    wasmModule = null;
  }

  return wasmModule;
}

export function getWasm(): WasmModule | null {
  return wasmModule;
}

export type { WasmIndexType };
