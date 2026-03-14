import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /solvec_wasm/,
      })
    );
    return config;
  },
};

export default nextConfig;
