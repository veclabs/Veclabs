"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const T = {
  surface: "#FFFFFF",
  ink: "#0A0A0A",
  muted: "#6B7280",
  border: "#E5E7EB",
  accent: "#E8930A",
  codeBg: "#F9FAFB",
} as const;

const SANS = "var(--font-sans), sans-serif";
const MONO = "var(--font-mono), monospace";

/* ─── Scroll fade-in hook ───────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(12px)",
        transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Code block ────────────────────────────────────────────────────────────── */
function CodeBlock({
  code,
  dimmed = false,
}: {
  code: string;
  dimmed?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div
      style={{
        background: T.codeBg,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: "16px 20px",
        position: "relative",
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: MONO,
          fontSize: 10,
          color: T.muted,
          padding: "2px 6px",
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.7,
          color: T.ink,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

/* ─── Section 1: Nav ────────────────────────────────────────────────────────── */
function Nav() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        height: 56,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 48px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 16,
                color: T.ink,
                letterSpacing: "-0.02em",
              }}
            >
              veclabs
            </span>
            <span style={{ color: T.accent, fontWeight: 700, fontSize: 18 }}>
              .
            </span>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: T.muted,
              marginTop: 1,
            }}
          >
            by VecLabs
          </div>
        </div>

        {/* Desktop links */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 32 }}
        >
          <a
            href="https://docs.veclabs.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            Docs
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
          <a
            href="/blog"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            Blog
          </a>
          <button
            onClick={handleCopy}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              background: T.ink,
              color: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              transition: "background 150ms",
            }}
          >
            {copied ? "Copied!" : "npm install @veclabs/solvec"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: T.ink,
          }}
          aria-label="Toggle menu"
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <>
                <line
                  x1="4"
                  y1="4"
                  x2="16"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
                <line
                  x1="16"
                  y1="4"
                  x2="4"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              </>
            ) : (
              <>
                <line
                  x1="3"
                  y1="6"
                  x2="17"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
                <line
                  x1="3"
                  y1="10"
                  x2="17"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
                <line
                  x1="3"
                  y1="14"
                  x2="17"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: T.surface,
            borderBottom: `1px solid ${T.border}`,
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <a
            href="https://docs.veclabs.xyz"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            Docs
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
          <a
            href="/blog"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: T.muted,
              textDecoration: "none",
            }}
          >
            Blog
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─── Section 2: Hero ───────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      style={{
        paddingTop: 128,
        paddingBottom: 96,
        background: T.surface,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 48px",
        }}
      >
        <div
          style={{
            maxWidth: 720,
          }}
        >
          {/* Headline */}
          <h1
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: "clamp(56px, 8vw, 96px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: T.ink,
              margin: "0 0 16px",
            }}
          >
            Recall.
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: "clamp(20px, 3vw, 28px)",
              lineHeight: 1.3,
              color: T.ink,
              margin: "0 0 16px",
            }}
          >
            The complete memory layer for AI agents.
          </p>

          {/* Body */}
          <p
            style={{
              fontFamily: SANS,
              fontSize: 16,
              lineHeight: 1.7,
              color: T.muted,
              margin: "0 0 32px",
              maxWidth: 560,
            }}
          >
            Two packages. One system. Store, encrypt, verify — and assemble
            exactly the right context for every agent decision.
          </p>

          {/* Package pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: T.codeBg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "8px 16px",
              }}
            >
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: T.ink,
                  fontWeight: 500,
                }}
              >
                @veclabs/solvec
              </code>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: T.muted,
                }}
              >
                Store. Encrypt. Verify.
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: T.codeBg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "8px 16px",
                opacity: 0.7,
              }}
            >
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: T.ink,
                  fontWeight: 500,
                }}
              >
                @veclabs/recall
              </code>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: T.muted,
                }}
              >
                Retrieve. Assemble. Audit.
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: T.accent,
                  background: "#FFF7ED",
                  border: `1px solid #FED7AA`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                coming soon
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 64,
            }}
          >
            <a
              href="https://docs.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 15,
                color: "#FFFFFF",
                background: T.ink,
                padding: "10px 24px",
                borderRadius: 6,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Get Started →
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: T.muted,
                textDecoration: "none",
              }}
            >
              View on GitHub
            </a>
          </div>

          {/* Hero stat */}
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 500,
                fontSize: "clamp(48px, 6vw, 72px)",
                color: T.accent,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              4.7ms
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: T.muted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              P99 · 100K VECTORS · 1536 DIMS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Two Packages ───────────────────────────────────────────────── */
function PackagesSection() {
  const solvecCode = `import { SolVec } from '@veclabs/solvec'
const sv = new SolVec({ network: 'devnet' })
const col = sv.collection('agent-memory', { dimensions: 1536 })
await col.upsert([{ id: 'mem_1', values: embedding, metadata: { text: '...' } }])
const proof = await col.verify()
// proof.match === true — on-chain verified`;

  const recallCode = `import { Recall } from '@veclabs/recall'
const recall = new Recall(collection)
const context = await recall.getContext({
  task: queryEmbedding,
  strategy: 'balanced',
  maxTokens: 2000
})
// { persistent, recent, relevant, novel, conflicts, tokenCount }`;

  return (
    <section style={{ background: "#FAFAFA", borderTop: `1px solid ${T.border}` }}>
      <div className="section-container">
        <FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {/* Card 1: solvec */}
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.accent,
                    background: "#FFF7ED",
                    border: `1px solid #FED7AA`,
                    borderRadius: 4,
                    padding: "3px 8px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  AVAILABLE NOW — alpha.6
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 22,
                    color: T.ink,
                    margin: "0 0 12px",
                  }}
                >
                  The storage engine.
                </h2>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: T.muted,
                    margin: 0,
                  }}
                >
                  Rust HNSW in-process search. AES-256-GCM client-side
                  encryption. SHA-256 Merkle root on Solana after every write.
                  Answers: &ldquo;what is similar to this?&rdquo;
                </p>
              </div>
              <CodeBlock code={solvecCode} />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: T.muted,
                  padding: "8px 12px",
                  background: T.codeBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                }}
              >
                npm install @veclabs/solvec
              </div>
            </div>

            {/* Card 2: recall */}
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                opacity: 0.8,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: T.muted,
                    background: T.codeBg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 4,
                    padding: "3px 8px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  COMING SOON — Phase 7
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 22,
                    color: T.ink,
                    margin: "0 0 12px",
                  }}
                >
                  The intelligence layer.
                </h2>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: T.muted,
                    margin: 0,
                  }}
                >
                  Sits on top of solvec. Assembles structured context from
                  multiple retrieval strategies simultaneously. Memory Inspector
                  + Context Retrieval. Answers: &ldquo;what should this agent
                  know right now?&rdquo;
                </p>
              </div>
              <CodeBlock code={recallCode} dimmed />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Section 4: How the Full Stack Works ───────────────────────────────────── */
function StackSection() {
  const rows = [
    {
      label: "upsert()",
      steps: [
        "HNSW insert (2ms)",
        "AES-256-GCM encrypt",
        "disk persist",
        "Shadow Drive upload (async)",
        "Solana Merkle root (async)",
      ],
      package: "@veclabs/solvec",
    },
    {
      label: "query()",
      steps: ["HNSW search (4.7ms p99) — pure RAM, nothing else touched"],
      package: "@veclabs/solvec",
    },
    {
      label: "verify()",
      steps: [
        "fetch on-chain root",
        "compare local root",
        "cryptographic proof",
      ],
      package: "@veclabs/solvec",
    },
    {
      label: "getContext()",
      steps: [
        "reads solvec using 5 strategies simultaneously",
        "assembles structured context object",
        "logs every operation for Memory Inspector",
        "returns token-budget-aware context package",
      ],
      package: "@veclabs/recall",
      coming: true,
    },
  ];

  return (
    <section style={{ borderTop: `1px solid ${T.border}` }}>
      <div className="section-container">
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: T.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Architecture
            </p>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "clamp(24px, 3vw, 36px)",
                color: T.ink,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              How the full stack works.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map((row, i) => (
            <FadeIn key={row.label} delay={i * 60}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr auto",
                  gap: 24,
                  alignItems: "start",
                  padding: "20px 24px",
                  background: T.codeBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  opacity: row.coming ? 0.65 : 1,
                }}
              >
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.ink,
                  }}
                >
                  {row.label}
                </code>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: T.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {row.steps.map((s, j) => (
                    <span key={j}>
                      {j > 0 && (
                        <span style={{ color: T.border, padding: "0 6px" }}>
                          →
                        </span>
                      )}
                      {s}
                    </span>
                  ))}
                </div>
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: row.coming ? T.muted : T.accent,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.package}
                  {row.coming && " (coming)"}
                </code>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 5: Benchmarks ─────────────────────────────────────────────────── */
function BenchmarksSection() {
  const rows = [
    { name: "VecLabs", latency: "4.7ms p99", highlight: true },
    { name: "Pinecone", latency: "~30ms p99", highlight: false },
    { name: "Qdrant", latency: "~15ms p99", highlight: false },
    { name: "Weaviate", latency: "~20ms p99", highlight: false },
  ];

  return (
    <section
      style={{
        background: "#FAFAFA",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div className="section-container">
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: T.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Performance
            </p>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "clamp(24px, 3vw, 36px)",
                color: T.ink,
                margin: 0,
                letterSpacing: "-0.02em",
                maxWidth: 640,
              }}
            >
              Built on Rust. No garbage collector. No network round-trip.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              overflow: "hidden",
              background: T.surface,
            }}
          >
            {rows.map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  padding: "16px 24px",
                  borderBottom:
                    i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                  background: row.highlight ? "#FFF7ED" : T.surface,
                  borderLeft: row.highlight
                    ? `3px solid ${T.accent}`
                    : "3px solid transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 15,
                    fontWeight: row.highlight ? 600 : 400,
                    color: row.highlight ? T.ink : T.muted,
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: row.highlight ? 600 : 400,
                    color: row.highlight ? T.accent : T.muted,
                  }}
                >
                  {row.latency}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: T.muted,
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Apple M3 · 100K vectors · 1536 dims · cosine similarity
            <br />
            Reproduce:{" "}
            <code style={{ fontFamily: MONO }}>
              cargo run --release --example percentile_bench
            </code>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Section 6: Phases Shipped ─────────────────────────────────────────────── */
function PhasesSection() {
  const phases = [
    {
      phase: "Phase 1",
      icon: "✅",
      label: "Rust HNSW core — 31 tests, 4.7ms p99",
    },
    {
      phase: "Phase 2",
      icon: "✅",
      label: "Solana Anchor program — devnet live",
    },
    { phase: "Phase 3", icon: "✅", label: "WASM bridge — real Rust in Node.js" },
    {
      phase: "Phase 4",
      icon: "✅",
      label: "AES-256-GCM encrypted disk persistence",
    },
    {
      phase: "Phase 5",
      icon: "✅",
      label: "Shadow Drive decentralized storage",
    },
    {
      phase: "Phase 6",
      icon: "🔄",
      label: "Memory Inspector — @veclabs/solvec",
    },
    {
      phase: "Phase 7",
      icon: "📋",
      label: "Context Retrieval — @veclabs/recall",
    },
  ];

  return (
    <section style={{ borderTop: `1px solid ${T.border}` }}>
      <div className="section-container">
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: T.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Status
            </p>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "clamp(24px, 3vw, 36px)",
                color: T.ink,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              What&apos;s been built.
            </h2>
          </div>
        </FadeIn>

        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            overflow: "hidden",
            background: T.surface,
          }}
        >
          {phases.map((p, i) => (
            <FadeIn key={p.phase} delay={i * 40}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 28px 1fr",
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 24px",
                  borderBottom:
                    i < phases.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: T.muted,
                  }}
                >
                  {p.phase}
                </span>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    color: T.ink,
                  }}
                >
                  {p.label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 7: What Makes This Different ──────────────────────────────────── */
function DifferentSection() {
  const cols = [
    {
      title: "Speed",
      stat: "4.7ms p99",
      points: [
        "In-process. No server.",
        "Queries run against in-memory HNSW.",
        "Zero network round-trip on the query path.",
        "Rust: no GC, no pauses, no surprises at p99.",
      ],
    },
    {
      title: "Privacy",
      stat: "AES-256-GCM",
      points: [
        "Client-side before anything leaves the SDK.",
        "Key derived from your Solana wallet.",
        "VecLabs cannot read your vectors.",
        "This is architecture, not a policy.",
      ],
    },
    {
      title: "Proof",
      stat: "$0.00025/write",
      points: [
        "SHA-256 Merkle root on Solana after every write.",
        "$0.00025 per transaction. 400ms finality. Permanent.",
        "Anyone can verify your collection's integrity.",
        "No other vector database has this.",
      ],
    },
  ];

  return (
    <section
      style={{
        background: "#FAFAFA",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div className="section-container">
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: T.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Why VecLabs
            </p>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "clamp(24px, 3vw, 36px)",
                color: T.ink,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              What makes this different.
            </h2>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {cols.map((col, i) => (
            <FadeIn key={col.title} delay={i * 80}>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: 28,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 20,
                    fontWeight: 500,
                    color: T.accent,
                    marginBottom: 4,
                  }}
                >
                  {col.stat}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 16,
                    color: T.ink,
                    marginBottom: 16,
                  }}
                >
                  {col.title}
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {col.points.map((pt) => (
                    <li
                      key={pt}
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        color: T.muted,
                        lineHeight: 1.6,
                        paddingLeft: 12,
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          color: T.border,
                        }}
                      >
                        —
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 8: Quick Install ──────────────────────────────────────────────── */
function InstallSection() {
  const code = `// Install
npm install @veclabs/solvec

// Store + verify
import { SolVec } from '@veclabs/solvec'

const sv = new SolVec({ network: 'devnet' })
const memory = sv.collection('agent-memory', { dimensions: 1536 })

await memory.upsert([{
  id: 'mem_001',
  values: embedding,
  metadata: { content: 'User prefers dark mode' }
}])
// → encrypted to disk
// → Merkle root posted to Solana

const results = await memory.query({ vector: queryEmbedding, topK: 5 })
const proof   = await memory.verify()
// proof.match === true`;

  return (
    <section style={{ borderTop: `1px solid ${T.border}` }}>
      <div className="section-container">
        <FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 48,
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: T.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}
              >
                Get started
              </p>
              <h2
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: "clamp(24px, 3vw, 36px)",
                  color: T.ink,
                  margin: "0 0 16px",
                  letterSpacing: "-0.02em",
                }}
              >
                Up and running in minutes.
              </h2>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: T.muted,
                  margin: "0 0 24px",
                }}
              >
                One package. Full API. Store, query, and verify — with
                cryptographic proof on Solana after every write.
              </p>
              <a
                href="https://docs.veclabs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#FFFFFF",
                  background: T.ink,
                  padding: "10px 24px",
                  borderRadius: 6,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Read the docs →
              </a>
            </div>

            <CodeBlock code={code} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Section 9: Footer ─────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
        padding: "48px 48px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 32,
          marginBottom: 40,
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 16,
                color: T.ink,
                letterSpacing: "-0.02em",
              }}
            >
              veclabs
            </span>
            <span style={{ color: T.accent, fontWeight: 700, fontSize: 18 }}>
              .
            </span>
          </div>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: T.muted,
              margin: "6px 0 0",
            }}
          >
            Memory that thinks.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "GitHub", href: "https://github.com/veclabs/veclabs" },
            {
              label: "npm",
              href: "https://www.npmjs.com/package/@veclabs/solvec",
            },
            { label: "PyPI", href: "https://pypi.org/project/solvec" },
            { label: "Docs", href: "https://docs.veclabs.xyz" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: T.muted,
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          paddingTop: 24,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: T.muted,
            margin: 0,
          }}
        >
          MIT Licensed · Built with Rust + Solana
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 56 }}>
        <HeroSection />
        <PackagesSection />
        <StackSection />
        <BenchmarksSection />
        <PhasesSection />
        <DifferentSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}
