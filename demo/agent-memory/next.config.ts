import type { NextConfig } from "next";

const nextConfig = {
  turbopack: {
    resolveAlias: {
      '../../../crates/solvec-wasm/pkg-node/solvec_wasm': './src/wasm-stub.ts',
    },
  },
};

export default nextConfig;
