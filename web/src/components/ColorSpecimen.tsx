import React from "react";
import { MONO } from "./Logo";

const B = {
  white: "#0A0A0A",
  black: "#FFFFFF",
  secondary: "#67E8F9",
  border: "#1D2E28",
  accent: "#2D4A3E",
} as const;
const SANS = MONO;

// ─── Helper ─────────────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 10,
      color: B.secondary,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      display: "block",
    }}
  >
    {children}
  </span>
);

/** Material Dark specimen - same source text, IDE colors only */
const SPECIMEN_CODE = `const results = await veclabs.query({
  vector: embedding,        // float32[]
  topK: 10,
  filter: { ns: "prod" },
  index: "cosine",
});
// → p99: 4.3ms · 100K vectors`;

function renderMaterialLine(line: string) {
  const m = line.match(/^(.*?)(\/\/.*)$/);
  if (m && m[1].trim().length > 0) {
    return (
      <>
        <span style={{ color: "var(--code-md-default)" }}>{m[1]}</span>
        <span style={{ color: "var(--code-md-comment)" }}>{m[2]}</span>
      </>
    );
  }
  if (line.trim().startsWith("//")) {
    return <span style={{ color: "var(--code-md-comment)" }}>{line}</span>;
  }
  return <span style={{ color: "var(--code-md-default)" }}>{line}</span>;
}

function renderSpecimenCode(src: string) {
  const lines = src.split("\n");
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {renderMaterialLine(line)}
      {i < lines.length - 1 ? "\n" : null}
    </React.Fragment>
  ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Color Specimen
// ═══════════════════════════════════════════════════════════════════════════════
const SWATCHES = [
  {
    hex: B.white,
    name: "Surface",
    role: "Dominant background surface",
    token: "--color-surface",
  },
  {
    hex: B.black,
    name: "Ink",
    role: "All primary text & marks",
    token: "--color-ink",
  },
  {
    hex: B.secondary,
    name: "Muted",
    role: "Secondary text, labels, metadata",
    token: "--color-muted",
  },
  {
    hex: B.border,
    name: "Border",
    role: "Dividers, outlines, ghost elements",
    token: "--color-border",
  },
  {
    hex: B.accent,
    name: "Amber",
    role: "Single accent - use sparingly",
    token: "--color-accent",
  },
];

export const ColorSpecimen = () => (
  <div style={{ display: "flex", gap: 0, width: "100%" }}>
    {SWATCHES.map(({ hex, name, role, token }, i) => (
      <div
        key={hex}
        style={{
          flex: 1,
          borderLeft: i === 0 ? `1px solid ${B.border}` : "none",
          borderRight: `1px solid ${B.border}`,
          borderTop: `1px solid ${B.border}`,
          borderBottom: `1px solid ${B.border}`,
          overflow: "hidden",
        }}
      >
        {/* Swatch */}
        <div
          style={{
            height: 120,
            backgroundColor: hex,
            borderBottom: `1px solid ${B.border}`,
            position: "relative",
          }}
        >
          {/* White gets a faint inner border so it's visible */}
          {hex === B.white && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "16px 18px 20px", backgroundColor: B.white }}>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 14,
              color: B.black,
              letterSpacing: "-0.01em",
              display: "block",
              marginBottom: 4,
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: B.accent,
              display: "block",
              marginBottom: 8,
            }}
          >
            {hex}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 12,
              color: B.secondary,
              display: "block",
              lineHeight: 1.4,
              marginBottom: 12,
            }}
          >
            {role}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: B.border,
              display: "block",
              letterSpacing: "0.04em",
            }}
          >
            {token}
          </span>
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Type Specimen
// ═══════════════════════════════════════════════════════════════════════════════
export const TypeSpecimen = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    {/* ── Geist Semibold: headings ─────────────────────────────────────────── */}
    <div
      style={{ padding: "40px 0 36px", borderBottom: `1px solid ${B.border}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 20,
        }}
      >
        <Label>Geist Semibold · Headings · tracking −0.02em</Label>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: B.border,
            letterSpacing: "0.04em",
          }}
        >
          weight 600
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "Display", size: 56 },
          { label: "Heading 1", size: 40 },
          { label: "Heading 2", size: 28 },
          { label: "Heading 3", size: 20 },
        ].map(({ label, size }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "baseline", gap: 24 }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: B.border,
                width: 72,
                flexShrink: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              {size}px
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: size,
                color: B.black,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Vector Database for AI Agents
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* ── Geist Regular: body ──────────────────────────────────────────────── */}
    <div
      style={{ padding: "40px 0 36px", borderBottom: `1px solid ${B.border}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 20,
        }}
      >
        <Label>Geist Regular · Body · tracking 0</Label>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: B.border,
            letterSpacing: "0.04em",
          }}
        >
          weight 400
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          {
            label: "Body LG",
            size: 18,
            text: "VecLabs gives AI agents instant access to semantic memory. Store billions of vectors, query at sub-5ms p99 latency, and scale horizontally without configuration.",
          },
          {
            label: "Body",
            size: 15,
            text: "VecLabs gives AI agents instant access to semantic memory. Store billions of vectors, query at sub-5ms p99 latency, and scale horizontally without configuration.",
          },
          {
            label: "Caption",
            size: 12,
            text: "Distributed HNSW index · ANN search · 768d dense embeddings · cosine similarity · dot product · Euclidean distance",
          },
        ].map(({ label, size, text }) => (
          <div
            key={label}
            style={{ display: "flex", gap: 24, alignItems: "flex-start" }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: B.border,
                width: 72,
                flexShrink: 0,
                paddingTop: 2,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              {size}px
            </span>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: size,
                color: B.black,
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 680,
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* ── Geist Mono: numbers & code ───────────────────────────────────────── */}
    <div style={{ padding: "40px 0 36px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 20,
        }}
      >
        <Label>Geist Mono · Numbers &amp; Code · tracking 0</Label>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: B.border,
            letterSpacing: "0.04em",
          }}
        >
          weight 400
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Large numeral */}
        <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: B.border,
              width: 72,
              flexShrink: 0,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            96px
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 96,
              color: B.accent,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            4.3ms
          </span>
        </div>

        {/* Metric row */}
        <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: B.border,
              width: 72,
              flexShrink: 0,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            32px
          </span>
          <div style={{ display: "flex", gap: 48 }}>
            {["0.8ms", "2.1ms", "4.3ms", "9.6ms"].map((v) => (
              <span
                key={v}
                style={{
                  fontFamily: MONO,
                  fontSize: 32,
                  color: B.black,
                  letterSpacing: "-0.03em",
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Code sample */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: B.border,
              width: 72,
              flexShrink: 0,
              paddingTop: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            13px
          </span>
          <div
            style={{
              backgroundColor: "var(--code-md-bg)",
              border: "1px solid var(--code-md-border)",
              padding: "20px 24px",
              borderRadius: 4,
              flex: 1,
              maxWidth: 640,
            }}
          >
            <pre
              style={{
                fontFamily: "var(--font-code)",
                fontSize: 14,
                margin: 0,
                lineHeight: 1.6,
                letterSpacing: "0.01em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {renderSpecimenCode(SPECIMEN_CODE)}
            </pre>
          </div>
        </div>

        {/* Alphabet / numeral specimen */}
        <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: B.border,
              width: 72,
              flexShrink: 0,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            14px
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                color: B.secondary,
                letterSpacing: "0.12em",
              }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                color: B.secondary,
                letterSpacing: "0.12em",
              }}
            >
              abcdefghijklmnopqrstuvwxyz
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                color: B.secondary,
                letterSpacing: "0.12em",
              }}
            >
              0123456789 · .,;:!? ()[]{} /+-=&lt;&gt;
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
