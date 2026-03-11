import React from "react";
import { LogoLockup } from "./Logo";
import { B, SANS, MONO } from "./Logo";

// 1200 × 630 - open-graph / benchmark share card
export const BenchmarkCard = () => (
  <div
    style={{
      width: 1200,
      height: 630,
      backgroundColor: B.white,
      display: "flex",
      flexDirection: "column",
      padding: "56px 80px 52px",
      boxSizing: "border-box",
      fontFamily: SANS,
      position: "relative",
    }}
  >
    {/* Top row: logo */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <LogoLockup markSize={36} dark={false} uid="bench-full" />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: B.secondary,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginTop: 10,
        }}
      >
        Performance Report
      </span>
    </div>

    {/* Centre: primary metric */}
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
      {/* Eyebrow */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: B.secondary,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: 20,
        }}
      >
        Benchmark
      </span>

      {/* Big number */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 128,
          fontWeight: 400,
          color: B.accent,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        4.3ms
      </span>

      {/* Sub-label */}
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 20,
          color: B.secondary,
          letterSpacing: "-0.01em",
          marginTop: 20,
        }}
      >
        p99 query latency&nbsp;·&nbsp;100K vectors
      </span>

      {/* Secondary metrics row */}
      <div
        style={{
          display: "flex",
          gap: 64,
          marginTop: 48,
          paddingTop: 36,
          borderTop: `1px solid ${B.border}`,
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
                color: B.black,
                letterSpacing: "-0.02em",
              }}
            >
              {v}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: B.secondary,
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

    {/* Footer */}
    <div
      style={{
        borderTop: `1px solid ${B.border}`,
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
          color: B.secondary,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        VecLabs Engine v1.0&nbsp;&nbsp;·&nbsp;&nbsp;HNSW
        Index&nbsp;&nbsp;·&nbsp;&nbsp;768d embeddings
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: B.border,
          letterSpacing: "0.04em",
        }}
      >
        veclabs.xyz
      </span>
    </div>
  </div>
);
