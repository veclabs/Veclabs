"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── CSS variable shortcuts ──────────────────────────────────────────────────── */
const V = {
  bg:        "var(--bg)",
  surface:   "var(--surface)",
  surface2:  "var(--surface-2)",
  border:    "var(--border)",
  border2:   "var(--border-2)",
  ink:       "var(--ink)",
  inkMuted:  "var(--ink-muted)",
  inkDim:    "var(--ink-dim)",
  green:     "var(--green)",
  greenDim:  "var(--green-dim)",
  greenMid:  "var(--green-mid)",
  codeBg:    "var(--code-bg)",
  mono:      "var(--font-geist-mono), 'Geist Mono', monospace",
} as const;

/* ── Scroll fade-up hook ─────────────────────────────────────────────────────── */
function useFadeUp(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useFadeUp();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(16px)",
        transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: V.mono,
        fontSize: 11,
        fontWeight: 500,
        color: V.inkDim,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 32,
      }}
    >
      {children}
    </div>
  );
}

/* ── Nav ─────────────────────────────────────────────────────────────────────── */
function Nav() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const linkStyle: React.CSSProperties = {
    fontFamily: V.mono,
    fontSize: 13,
    color: V.inkMuted,
    textDecoration: "none",
    transition: "color 150ms",
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: V.bg,
        borderBottom: `1px solid ${V.border}`,
        height: 52,
      }}
    >
      <div
        className="content-width"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: V.green,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 14,
                color: V.ink,
                letterSpacing: "-0.02em",
              }}
            >
              veclabs
            </span>
          </div>
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              fontWeight: 500,
              color: V.green,
              marginTop: 1,
              paddingLeft: 12,
            }}
          >
            recall
          </div>
        </div>

        {/* Desktop nav */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 32 }}
        >
          {[
            { label: "Docs", href: "https://docs.veclabs.xyz" },
            { label: "GitHub", href: "https://github.com/veclabs/veclabs" },
            { label: "Blog", href: "/blog" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={linkStyle}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={handleCopy}
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              background: "transparent",
              border: `1px solid ${copied ? V.green : V.border2}`,
              color: copied ? V.green : V.inkMuted,
              padding: "6px 14px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "border-color 150ms, color 150ms",
            }}
          >
            {copied ? "copied" : "npm install @veclabs/solvec"}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: V.inkMuted,
            cursor: "pointer",
            padding: 8,
          }}
          aria-label="Menu"
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth={1.5} />
            <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth={1.5} />
            <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: V.bg,
            borderBottom: `1px solid ${V.border}`,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <a href="https://docs.veclabs.xyz" style={linkStyle}>Docs</a>
          <a href="https://github.com/veclabs/veclabs" style={linkStyle}>GitHub</a>
          <a href="/blog" style={linkStyle}>Blog</a>
        </div>
      )}
    </nav>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────────── */
const HEADLINE = "Memory that thinks.";

function HeroSection() {
  const [charCount, setCharCount] = useState(0);
  const [afterType, setAfterType] = useState(false);

  useEffect(() => {
    if (charCount < HEADLINE.length) {
      const t = setTimeout(() => setCharCount((c) => c + 1), 30);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setAfterType(true), 200);
      return () => clearTimeout(t);
    }
  }, [charCount]);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: V.bg,
      }}
    >
      <div className="content-width" style={{ paddingTop: 52, width: "100%" }}>
        <div style={{ maxWidth: 680 }}>
          {/* Top label */}
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              fontWeight: 500,
              color: V.inkDim,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 28,
            }}
          >
            VECLABS / RECALL / ALPHA
          </div>

          {/* Typewriter headline */}
          <h1
            style={{
              fontFamily: V.mono,
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 72px)",
              letterSpacing: "-0.02em",
              color: V.ink,
              lineHeight: 1.1,
              margin: "0 0 24px",
            }}
          >
            {HEADLINE.slice(0, charCount)}
            <span
              style={{
                display: "inline-block",
                width: "0.08em",
                height: "0.85em",
                background: V.green,
                verticalAlign: "text-bottom",
                marginLeft: 2,
                opacity: charCount < HEADLINE.length ? 1 : 0,
                transition: "opacity 150ms",
              }}
            />
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontFamily: V.mono,
              fontSize: "clamp(16px, 2.5vw, 22px)",
              fontWeight: 400,
              color: V.inkMuted,
              lineHeight: 1.5,
              margin: "0 0 20px",
              opacity: afterType ? 1 : 0,
              transform: afterType ? "none" : "translateY(16px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
            }}
          >
            The complete memory layer for AI agents.
          </p>

          {/* Body */}
          <p
            style={{
              fontFamily: V.mono,
              fontSize: 15,
              fontWeight: 400,
              color: V.inkMuted,
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 0 32px",
              opacity: afterType ? 1 : 0,
              transform: afterType ? "none" : "translateY(16px)",
              transition: "opacity 0.5s ease-out 80ms, transform 0.5s ease-out 80ms",
            }}
          >
            Two packages. Store, encrypt, verify — then assemble exactly the
            right context for every agent decision.
          </p>

          {/* Package indicators */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 36,
              opacity: afterType ? 1 : 0,
              transform: afterType ? "none" : "translateY(16px)",
              transition: "opacity 0.5s ease-out 160ms, transform 0.5s ease-out 160ms",
            }}
          >
            {[
              {
                pkg: "@veclabs/solvec",
                desc: "Store. Encrypt. Verify.",
                badge: "LIVE",
                live: true,
              },
              {
                pkg: "@veclabs/recall",
                desc: "Retrieve. Assemble. Audit.",
                badge: "PHASE 7",
                live: false,
              },
            ].map((item) => (
              <div
                key={item.pkg}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontFamily: V.mono,
                  fontSize: 12,
                }}
              >
                <span style={{ color: item.live ? V.green : V.inkMuted, minWidth: 160 }}>
                  {item.pkg}
                </span>
                <span style={{ color: V.inkDim }}>{item.desc}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 7px",
                    borderRadius: 2,
                    background: item.live ? V.greenDim : "transparent",
                    border: `1px solid ${item.live ? V.green : V.border2}`,
                    color: item.live ? V.green : V.inkMuted,
                  }}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 64,
              opacity: afterType ? 1 : 0,
              transform: afterType ? "none" : "translateY(16px)",
              transition: "opacity 0.5s ease-out 240ms, transform 0.5s ease-out 240ms",
            }}
          >
            <a
              href="https://docs.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 13,
                background: V.green,
                color: V.bg,
                padding: "10px 24px",
                borderRadius: 3,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Get Started
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: V.mono,
                fontSize: 13,
                background: "transparent",
                border: `1px solid ${V.border2}`,
                color: V.inkMuted,
                padding: "10px 24px",
                borderRadius: 3,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Source
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 48,
              flexWrap: "wrap",
              opacity: afterType ? 1 : 0,
              transition: "opacity 0.5s ease-out 320ms",
            }}
          >
            {[
              { num: "4.7ms", label: "P99 LATENCY" },
              { num: "26 / 26", label: "TESTS PASSING" },
              { num: "5", label: "PHASES SHIPPED" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: V.mono,
                    fontWeight: 700,
                    fontSize: 24,
                    color: V.green,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontFamily: V.mono,
                    fontSize: 10,
                    fontWeight: 500,
                    color: V.inkDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Problem ─────────────────────────────────────────────────────────────────── */
function ProblemSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>THE PROBLEM</SectionLabel>
        </FadeUp>
        <FadeUp delay={40}>
          <h2
            style={{
              fontFamily: V.mono,
              fontWeight: 700,
              fontSize: 28,
              color: V.ink,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "0 0 32px",
            }}
          >
            AI agents forget. But forgetting is not the problem.
          </h2>
        </FadeUp>

        <FadeUp delay={80}>
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 15,
              fontWeight: 400,
              color: V.inkMuted,
              lineHeight: 1.8,
              maxWidth: 640,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <p style={{ margin: 0 }}>
              Every AI agent framework gives you a memory module. Store vectors.
              Retrieve the top-K most similar results. Inject them into the
              context window. This works. Most of the time.
            </p>
            <p style={{ margin: 0 }}>
              The problem is what happens when it does not work. When your agent
              makes a wrong decision — a medical recommendation, a financial
              call, a customer-facing action — you need to answer one question.
            </p>

            <blockquote
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 18,
                color: V.ink,
                borderLeft: `2px solid ${V.green}`,
                paddingLeft: 20,
                margin: "12px 0",
              }}
            >
              What did this agent know when it made that decision?
            </blockquote>

            <p style={{ margin: 0 }}>
              No current vector database can answer this. You can see what is in
              the database today. You cannot prove what was in it at any specific
              moment. You cannot audit what was retrieved for a given query. You
              cannot verify that nothing changed between then and now.
            </p>
            <p style={{ margin: 0 }}>
              This is not a theoretical concern. Regulators are already asking
              this question. Most companies cannot answer it. VecLabs is built
              so you can.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Code block ──────────────────────────────────────────────────────────────── */
function CodeBlock({ code, dimmed = false }: { code: string; dimmed?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const colorize = (line: string, i: number) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      return (
        <span key={i} style={{ color: V.inkDim }}>
          {line}
        </span>
      );
    }
    const parts: React.ReactNode[] = [];
    const importRe = /\b(import|const|await|from|new|async|function|return|type|interface|export)\b/g;
    const stringRe = /'[^']*'|"[^"]*"`[^`]*`/g;
    let last = 0;
    const combined = line.replace(importRe, (m, _kw, offset) => {
      parts.push(
        <span key={`p${offset}`} style={{ color: V.inkMuted }}>
          {m}
        </span>
      );
      return m;
    });
    void combined;
    void last;

    const segments: Array<{ text: string; type: "kw" | "str" | "normal" }> = [];
    let pos = 0;
    const fullRe = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(import|const|await|from|new|async|function|return|type|interface|export)\b)/g;
    let m: RegExpExecArray | null;
    while ((m = fullRe.exec(line)) !== null) {
      if (m.index > pos) {
        segments.push({ text: line.slice(pos, m.index), type: "normal" });
      }
      const isKw = /^(import|const|await|from|new|async|function|return|type|interface|export)$/.test(m[0]);
      segments.push({ text: m[0], type: isKw ? "kw" : "str" });
      pos = m.index + m[0].length;
    }
    if (pos < line.length) segments.push({ text: line.slice(pos), type: "normal" });

    return (
      <span key={i}>
        {segments.map((seg, j) => (
          <span
            key={j}
            style={{
              color:
                seg.type === "kw"
                  ? V.inkMuted
                  : seg.type === "str"
                  ? V.green
                  : V.ink,
            }}
          >
            {seg.text}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div
      style={{
        background: V.codeBg,
        border: `1px solid ${V.border}`,
        borderRadius: 4,
        padding: "24px",
        position: "relative",
        opacity: dimmed ? 0.55 : 1,
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
          fontFamily: V.mono,
          fontSize: 10,
          color: copied ? V.green : V.inkDim,
          cursor: "pointer",
          padding: "2px 4px",
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre
        style={{
          margin: 0,
          fontFamily: V.mono,
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code.split("\n").map((line, i) => (
          <div key={i}>{colorize(line, i)}</div>
        ))}
      </pre>
    </div>
  );
}

/* ── Stack ───────────────────────────────────────────────────────────────────── */
const solvecCode = `import { SolVec } from '@veclabs/solvec'

const sv  = new SolVec({ network: 'devnet' })
const col = sv.collection('agent-memory', { dimensions: 1536 })

await col.upsert([{
  id:       'mem_001',
  values:   embedding,
  metadata: { content: 'User prefers dark mode' }
}])
// encrypted to disk
// cryptographic proof recorded

const { matches } = await col.query({ vector: query, topK: 5 })
const proof = await col.verify()
// proof.match === true`;

const recallCode = `// coming in phase 7
import { Recall } from '@veclabs/recall'

const recall = new Recall(collection)

const context = await recall.getContext({
  task:      queryEmbedding,
  strategy:  'balanced',
  maxTokens: 2000
})
// context.persistent  — always-relevant memories
// context.recent      — recency weighted
// context.relevant    — semantically close
// context.novel       — unseen recently
// context.conflicts   — contradicts current task
// context.tokenCount  — 1847`;

function StackSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>THE STACK</SectionLabel>
        </FadeUp>

        {/* Block 1: solvec */}
        <FadeUp delay={40}>
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 13,
                  color: V.green,
                }}
              >
                @veclabs/solvec
              </span>
              <span
                style={{
                  fontFamily: V.mono,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 2,
                  background: V.greenDim,
                  border: `1px solid ${V.green}`,
                  color: V.green,
                }}
              >
                LIVE — ALPHA
              </span>
            </div>
            <h3
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 22,
                color: V.ink,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              The storage engine.
            </h3>
            <p
              style={{
                fontFamily: V.mono,
                fontSize: 15,
                fontWeight: 400,
                color: V.inkMuted,
                lineHeight: 1.7,
                margin: "0 0 24px",
                maxWidth: 560,
              }}
            >
              Rust HNSW in-process vector search. AES-256-GCM client-side
              encryption. Cryptographic proof posted after every write.
              Answers: what is similar to this?
            </p>
            <CodeBlock code={solvecCode} />
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 13,
                color: V.inkMuted,
                marginTop: 16,
              }}
            >
              $ npm install @veclabs/solvec
            </div>
          </div>
        </FadeUp>

        <hr style={{ border: "none", borderTop: `1px solid ${V.border}`, margin: "0 0 48px" }} />

        {/* Block 2: recall */}
        <FadeUp delay={80}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 13,
                  color: V.inkMuted,
                }}
              >
                @veclabs/recall
              </span>
              <span
                style={{
                  fontFamily: V.mono,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 2,
                  background: "transparent",
                  border: `1px solid ${V.border2}`,
                  color: V.inkMuted,
                }}
              >
                PHASE 7
              </span>
            </div>
            <h3
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 22,
                color: V.ink,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              The intelligence layer.
            </h3>
            <p
              style={{
                fontFamily: V.mono,
                fontSize: 15,
                fontWeight: 400,
                color: V.inkMuted,
                lineHeight: 1.7,
                margin: "0 0 24px",
                maxWidth: 560,
              }}
            >
              Wraps solvec. Assembles structured context from five retrieval
              strategies simultaneously. Answers: what should this agent know
              right now?
            </p>
            <CodeBlock code={recallCode} dimmed />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Architecture ────────────────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  { label: "HNSW insert",         timing: "~2ms",       note: "returns here",    returnsHere: true,  fireForget: false },
  { label: "AES-256-GCM encrypt", timing: "~1ms",       note: "",                returnsHere: false, fireForget: false },
  { label: "disk persist",        timing: "~1ms",       note: "",                returnsHere: false, fireForget: false },
  { label: "Shadow Drive upload", timing: "~500ms–2s",  note: "",                returnsHere: false, fireForget: true  },
  { label: "cryptographic proof", timing: "~400ms",     note: "",                returnsHere: false, fireForget: true  },
];

function ArchSection() {
  const { ref, visible } = useFadeUp(0.1);

  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>WRITE PATH</SectionLabel>
        </FadeUp>

        <div
          ref={ref}
          style={{
            background: V.surface,
            border: `1px solid ${V.border}`,
            borderRadius: 4,
            padding: "40px",
            maxWidth: 640,
          }}
        >
          {/* upsert() label */}
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 13,
              fontWeight: 600,
              color: V.ink,
              marginBottom: 20,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          >
            upsert() called
          </div>

          {/* Pipeline steps */}
          <div style={{ paddingLeft: 16, position: "relative" }}>
            {/* Animated vertical line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 1,
                background: V.green,
                transformOrigin: "top",
                transform: visible ? "scaleY(1)" : "scaleY(0)",
                transition: "transform 1.2s ease-out 0.2s",
              }}
            />

            {PIPELINE_STEPS.map((step, i) => (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: i < PIPELINE_STEPS.length - 1 ? 16 : 0,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateX(8px)",
                  transition: `opacity 0.4s ease-out ${0.3 + i * 0.15}s, transform 0.4s ease-out ${0.3 + i * 0.15}s`,
                }}
              >
                {/* Dot on line */}
                <div
                  style={{
                    position: "absolute",
                    left: -3,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: V.green,
                    flexShrink: 0,
                    animation: step.returnsHere && visible
                      ? "pulse-dot 2s ease-in-out infinite"
                      : "none",
                  }}
                />

                <div style={{ paddingLeft: 8 }}>
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize: 13,
                      color: V.ink,
                    }}
                  >
                    [{step.label}]
                  </span>
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize: 12,
                      color: V.inkMuted,
                      marginLeft: 12,
                    }}
                  >
                    {step.timing}
                  </span>
                  {step.returnsHere && (
                    <span
                      style={{
                        fontFamily: V.mono,
                        fontSize: 11,
                        color: V.green,
                        marginLeft: 12,
                      }}
                    >
                      returns here
                    </span>
                  )}
                  {step.fireForget && (
                    <span
                      style={{
                        fontFamily: V.mono,
                        fontSize: 11,
                        color: V.inkDim,
                        marginLeft: 12,
                      }}
                    >
                      fire and forget
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Query path */}
          <div
            style={{
              marginTop: 36,
              paddingTop: 24,
              borderTop: `1px solid ${V.border}`,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease-out 1.2s",
            }}
          >
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 11,
                fontWeight: 500,
                color: V.inkDim,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              QUERY PATH
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 13,
                color: V.ink,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: V.inkMuted }}>query()</span>
              <span style={{ color: V.inkDim }}>→</span>
              <span>[HNSW search in RAM]</span>
              <span style={{ color: V.inkDim }}>→</span>
              <span style={{ color: V.green }}>4.7ms p99</span>
              <span style={{ color: V.inkDim }}>→</span>
              <span>returns</span>
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                color: V.inkDim,
                marginTop: 8,
              }}
            >
              Verification layer never touched on query path.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Benchmarks ──────────────────────────────────────────────────────────────── */
const BENCH = [
  { name: "VecLabs",  p99: "4.7ms",  arch: "in-process", proof: "yes", highlight: true  },
  { name: "Pinecone", p99: "~30ms",  arch: "managed API", proof: "no",  highlight: false },
  { name: "Qdrant",   p99: "~15ms",  arch: "server",      proof: "no",  highlight: false },
  { name: "Weaviate", p99: "~20ms",  arch: "server",      proof: "no",  highlight: false },
];

function BenchSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>PERFORMANCE</SectionLabel>
        </FadeUp>
        <FadeUp delay={40}>
          <table
            style={{
              width: "100%",
              maxWidth: 640,
              borderCollapse: "collapse",
              fontFamily: V.mono,
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {["DATABASE", "P99", "ARCHITECTURE", "PROOF"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontFamily: V.mono,
                      fontSize: 10,
                      fontWeight: 500,
                      color: V.inkDim,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      paddingBottom: 12,
                      borderBottom: `1px solid ${V.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BENCH.map((row) => (
                <tr
                  key={row.name}
                  style={{
                    background: row.highlight ? V.surface2 : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 0",
                      borderBottom: `1px solid ${V.border}`,
                      color: V.ink,
                      fontWeight: row.highlight ? 600 : 400,
                    }}
                  >
                    {row.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 0",
                      borderBottom: `1px solid ${V.border}`,
                      color: row.highlight ? V.green : V.inkMuted,
                      fontWeight: row.highlight ? 600 : 400,
                    }}
                  >
                    {row.p99}
                  </td>
                  <td
                    style={{
                      padding: "14px 0",
                      borderBottom: `1px solid ${V.border}`,
                      color: V.inkMuted,
                    }}
                  >
                    {row.arch}
                  </td>
                  <td
                    style={{
                      padding: "14px 0",
                      borderBottom: `1px solid ${V.border}`,
                      color: row.proof === "yes" ? V.green : V.inkDim,
                    }}
                  >
                    {row.proof}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 12,
              color: V.inkDim,
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Apple M3 · 100K vectors · 1536 dimensions · cosine similarity
            <br />
            Reproduce: cargo run --release --example percentile_bench
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Roadmap ─────────────────────────────────────────────────────────────────── */
const PHASES = [
  {
    num: "PHASE 1",
    status: "SHIPPED",
    name: "Rust HNSW Core",
    desc: "31 tests. 4.7ms p99 at 100K vectors. In-process.\nNo network round-trip on the query path.",
  },
  {
    num: "PHASE 2",
    status: "SHIPPED",
    name: "Anchor Program",
    desc: "Cryptographic proof of collection state after every write.\nOne transaction. $0.00025. Permanent.",
  },
  {
    num: "PHASE 3",
    status: "SHIPPED",
    name: "WASM Bridge",
    desc: "Rust core compiled to WebAssembly. TypeScript SDK runs\nreal Rust — not a JavaScript fallback.",
  },
  {
    num: "PHASE 4",
    status: "SHIPPED",
    name: "Encrypted Disk Persistence",
    desc: "AES-256-GCM. Key derived from your credentials.\nCollection survives server restarts. 26/26 tests.",
  },
  {
    num: "PHASE 5",
    status: "SHIPPED",
    name: "Decentralized Storage",
    desc: "Encrypted collection backed up automatically after every write.\nFire-and-forget. Never blocks upsert(). 26/26 tests.",
  },
  {
    num: "PHASE 6",
    status: "IN PROGRESS",
    name: "Memory Inspector",
    desc: "Full audit trail of every memory operation. What the agent\nstored, retrieved, and deleted — with timestamps and proof.",
  },
  {
    num: "PHASE 7",
    status: "PLANNED",
    name: "@veclabs/recall",
    desc: "The intelligence layer. Five retrieval strategies assembled\nsimultaneously. Token-budget-aware context for every decision.",
  },
];

function RoadmapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const totalH = el.scrollHeight;
          let h = 0;
          const step = totalH / 80;
          const id = setInterval(() => {
            h = Math.min(h + step, totalH);
            setLineHeight(h);
            if (h >= totalH) clearInterval(id);
          }, 16);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const statusColor = (s: string) =>
    s === "SHIPPED" ? V.green : s === "IN PROGRESS" ? V.green : V.inkDim;
  const dotColor = (s: string) =>
    s === "SHIPPED" || s === "IN PROGRESS" ? V.green : V.border2;

  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>ROADMAP</SectionLabel>
        </FadeUp>

        <div ref={containerRef} style={{ position: "relative", paddingLeft: 24 }}>
          {/* Animated vertical line */}
          <div
            style={{
              position: "absolute",
              left: 3,
              top: 6,
              width: 1,
              height: lineHeight,
              background: V.border,
              transition: "height 0.1s linear",
            }}
          />

          {PHASES.map((phase, i) => (
            <div
              key={phase.num}
              style={{
                position: "relative",
                paddingBottom: i < PHASES.length - 1 ? 40 : 0,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: -24 + 3,
                  top: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: dotColor(phase.status),
                  border: `1px solid ${dotColor(phase.status)}`,
                  animation:
                    phase.status === "IN PROGRESS"
                      ? "pulse-dot 2s ease-in-out infinite"
                      : "none",
                }}
              />

              {/* Content */}
              <div
                style={{
                  opacity: lineHeight > (i / PHASES.length) * 1000 ? 1 : 0,
                  transform:
                    lineHeight > (i / PHASES.length) * 1000
                      ? "none"
                      : "translateY(8px)",
                  transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize: 11,
                      fontWeight: 500,
                      color: V.inkDim,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {phase.num}
                  </span>
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize: 10,
                      fontWeight: 500,
                      color: statusColor(phase.status),
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {phase.status}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: V.mono,
                    fontWeight: 700,
                    fontSize: 16,
                    color: V.ink,
                    marginBottom: 8,
                  }}
                >
                  {phase.name}
                </div>
                <div
                  style={{
                    fontFamily: V.mono,
                    fontSize: 14,
                    fontWeight: 400,
                    color: V.inkMuted,
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                  }}
                >
                  {phase.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Three Principles ────────────────────────────────────────────────────────── */
const PRINCIPLES = [
  {
    label: "SPEED",
    body: "No network round-trip on the query path. The HNSW index lives in RAM. Every query is pure memory access. Rust means no garbage collector — no pause spikes at p99. The gap between p50 and p99.9 is 2.7ms. That gap is the whole story.",
  },
  {
    label: "PRIVACY",
    body: "AES-256-GCM before anything leaves the SDK. The key is derived from your credentials. VecLabs cannot read your vectors. This is not a privacy policy that could change. It is the encryption architecture. Those are different things.",
  },
  {
    label: "PROOF",
    body: "A cryptographic fingerprint of your collection is recorded after every write. Anyone can verify your collection's integrity without trusting VecLabs. No other vector database gives you this. This is the layer that makes AI agents auditable.",
  },
];

function PrinciplesSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>DESIGN DECISIONS</SectionLabel>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {PRINCIPLES.map((p, i) => (
            <FadeUp key={p.label} delay={i * 80}>
              <div>
                <div
                  style={{
                    fontFamily: V.mono,
                    fontWeight: 700,
                    fontSize: 11,
                    color: V.green,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  {p.label}
                </div>
                <p
                  style={{
                    fontFamily: V.mono,
                    fontSize: 15,
                    fontWeight: 400,
                    color: V.inkMuted,
                    lineHeight: 1.8,
                    margin: 0,
                    maxWidth: 600,
                  }}
                >
                  {p.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Quick Start ─────────────────────────────────────────────────────────────── */
const QS_CODE = `$ npm install @veclabs/solvec

import { SolVec } from '@veclabs/solvec'

const sv     = new SolVec({ network: 'devnet' })
const memory = sv.collection('agent-memory', { dimensions: 1536 })

// store
await memory.upsert([{
  id:       'mem_001',
  values:   embedding,
  metadata: { content: 'User prefers dark mode' }
}])

// retrieve
const { matches } = await memory.query({
  vector: queryEmbedding,
  topK:   5
})

// verify
const proof = await memory.verify()
// proof.match === true`;

function QuickStartSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>QUICK START</SectionLabel>
        </FadeUp>
        <FadeUp delay={40}>
          <div style={{ maxWidth: 640 }}>
            <CodeBlock code={QS_CODE} />
            <div style={{ marginTop: 24 }}>
              <a
                href="https://docs.veclabs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 13,
                  background: V.green,
                  color: V.bg,
                  padding: "10px 24px",
                  borderRadius: 3,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Read the docs
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────────── */
function Footer() {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <footer
      style={{
        background: V.surface,
        borderTop: `1px solid ${V.border}`,
        padding: "40px 0",
      }}
    >
      <div className="content-width">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 32,
          }}
        >
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: V.green,
                }}
              />
              <span
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 14,
                  color: V.ink,
                }}
              >
                veclabs
              </span>
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                color: V.inkDim,
              }}
            >
              MIT Licensed. Built for AI agents.
            </div>
          </div>

          {/* Center */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 24px",
              alignItems: "flex-start",
            }}
          >
            {[
              { label: "GitHub",   href: "https://github.com/veclabs/veclabs" },
              { label: "npm",      href: "https://www.npmjs.com/package/@veclabs/solvec" },
              { label: "PyPI",     href: "https://pypi.org/project/solvec" },
              { label: "Docs",     href: "https://docs.veclabs.xyz" },
              { label: "Blog",     href: "/blog" },
              { label: "@veclabss", href: "https://twitter.com/veclabss" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  fontFamily: V.mono,
                  fontSize: 13,
                  color: V.inkMuted,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div>
            <button
              onClick={handleCopy}
              style={{
                fontFamily: V.mono,
                fontSize: 11,
                background: "transparent",
                border: `1px solid ${copied ? V.green : V.border2}`,
                color: copied ? V.green : V.inkMuted,
                padding: "6px 14px",
                borderRadius: 3,
                cursor: "pointer",
                transition: "border-color 150ms, color 150ms",
              }}
            >
              {copied ? "copied" : "npm install @veclabs/solvec"}
            </button>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${V.border}`,
            paddingTop: 16,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              color: V.inkDim,
            }}
          >
            veclabs 2026
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 52, background: V.bg }}>
        <HeroSection />
        <ProblemSection />
        <StackSection />
        <ArchSection />
        <BenchSection />
        <RoadmapSection />
        <PrinciplesSection />
        <QuickStartSection />
      </main>
      <Footer />
    </>
  );
}
