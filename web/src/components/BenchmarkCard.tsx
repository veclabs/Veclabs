import React from "react";
import { LogoLockup, MONO } from "./Logo";

/** OG / share card — 1200 × 630 */
const BC = {
  bg: "#0A0A0A",
  text: "#FFFFFF",
  muted: "#C9B99A",
  border: "#1D2E28",
  accent: "#2D4A3E",
} as const;

export const BenchmarkCard = () => (
  <div
    style={{
      width: 1200,
      height: 630,
      backgroundColor: BC.bg,
      display: "flex",
      flexDirection: "column",
      padding: "56px 80px 52px",
      boxSizing: "border-box",
      fontFamily: MONO,
      position: "relative",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <LogoLockup markSize={36} dark uid="bench-full" />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: BC.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginTop: 10,
        }}
      >
        Performance Report
      </span>
    </div>

    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: BC.muted,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: 20,
        }}
      >
        Benchmark
      </span>

      <span
        style={{
          fontFamily: MONO,
          fontSize: 128,
          fontWeight: 400,
          color: BC.text,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        4.3ms
      </span>

      <span
        style={{
          fontFamily: MONO,
          fontWeight: 400,
          fontSize: 20,
          color: BC.muted,
          letterSpacing: "-0.01em",
          marginTop: 20,
        }}
      >
        p99 query latency&nbsp;·&nbsp;100K vectors
      </span>

      <div
        style={{
          display: "flex",
          gap: 64,
          marginTop: 48,
          paddingTop: 36,
          borderTop: `1px solid ${BC.border}`,
          width: 640,
          justifyContent: "space-between",
        }}
      >
        {[
          { v: "0.8ms", l: "p50" },
          { v: "2.1ms", l: "p90" },
          { v: "4.3ms", l: "p99" },
          { v: "9.6ms", l: "p99.9" },
        ].map(({ v, l }) => (
          <div
            key={l}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 22,
                color: BC.text,
                letterSpacing: "-0.02em",
              }}
            >
              {v}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: BC.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div
      style={{
        borderTop: `1px solid ${BC.border}`,
        paddingTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: BC.muted,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        VecLabs Engine v1.0&nbsp;&nbsp;·&nbsp;&nbsp;HNSW Index&nbsp;&nbsp;·&nbsp;&nbsp;768d embeddings
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: BC.border,
          letterSpacing: "0.04em",
        }}
      >
        veclabs.xyz
      </span>
    </div>
  </div>
);
