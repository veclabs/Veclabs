"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Brand tokens (globals.css) ─────────────────────────────────────────────── */
const V = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  border: "var(--border)",
  borderLight: "var(--border-light)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  textDim: "var(--text-dim)",
  green: "var(--green)",
  greenLight: "var(--green-light)",
  brown: "var(--brown)",
  mono: "var(--font-geist-mono), 'Geist Mono', 'Courier New', monospace",
} as const;

/** Material Dark syntax helpers (homepage CodeBlock only — IDE theme, no brand accents) */
const CODE_KEYWORDS =
  "import|export|from|const|let|var|await|async|function|return|new|typeof|instanceof|class|extends|interface|type|enum|namespace|readonly|public|private|protected|static|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|void|delete|yield|as|in|of|this|super|true|false|null|undefined|fn|pub|use|mut|impl|trait|struct|crate|mod|Self|where|match|move|ref|dyn|unsafe|extern|keyof|assert";
const CODE_TOKEN_RE = new RegExp(
  [
    "'(?:[^'\\\\]|\\\\.)*'",
    '"(?:[^"\\\\]|\\\\.)*"',
    "`(?:[^`\\\\]|\\\\.)*`",
    `\\b(?:${CODE_KEYWORDS})\\b`,
    "\\b\\d+\\.?\\d*\\b",
  ].join("|"),
  "g"
);
const CODE_KW_TEST = new RegExp(`^(?:${CODE_KEYWORDS})$`);

function splitPascalSpans(
  s: string,
  keyPrefix: string,
  defC: string,
  typeC: string
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\b[A-Z][a-zA-Z0-9]*\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`${keyPrefix}d${last}`} style={{ color: defC }}>
          {s.slice(last, m.index)}
        </span>
      );
    }
    parts.push(
      <span key={`${keyPrefix}t${m.index}`} style={{ color: typeC }}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    parts.push(
      <span key={`${keyPrefix}end`} style={{ color: defC }}>
        {s.slice(last)}
      </span>
    );
  }
  return parts.length ? parts : [<span key={`${keyPrefix}all`} style={{ color: defC }}>{s}</span>];
}

function paintCodeNormText(text: string): React.ReactNode {
  const def = "var(--code-md-default)";
  const numC = "var(--code-md-number)";
  const typeC = "var(--code-md-type)";
  if (!text) return null;
  const nodes: React.ReactNode[] = [];
  const numRe = /\b\d+\.?\d*\b/g;
  let last = 0;
  let nm: RegExpExecArray | null;
  while ((nm = numRe.exec(text)) !== null) {
    if (nm.index > last) {
      nodes.push(...splitPascalSpans(text.slice(last, nm.index), `${last}-`, def, typeC));
    }
    nodes.push(
      <span key={`n${nm.index}`} style={{ color: numC }}>
        {nm[0]}
      </span>
    );
    last = nm.index + nm[0].length;
  }
  if (last < text.length) {
    nodes.push(...splitPascalSpans(text.slice(last), `e${last}-`, def, typeC));
  }
  return nodes.length ? nodes : <span style={{ color: def }}>{text}</span>;
}

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
        color: V.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
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
    color: V.textMuted,
    textDecoration: "none",
    transition: "color 150ms",
  };
  const linkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = V.text;
  };
  const linkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = V.textMuted;
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
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 14,
                color: V.text,
                letterSpacing: "-0.02em",
              }}
            >
              Recall
            </span>
            <span
              style={{
                fontFamily: V.mono,
                fontSize: 11,
                fontWeight: 500,
                color: V.textMuted,
              }}
            >
              by VecLabs
            </span>
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
              onMouseEnter={linkHover}
              onMouseLeave={linkLeave}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={handleCopy}
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              background: copied ? V.borderLight : V.green,
              border: `1px solid ${V.borderLight}`,
              color: V.text,
              padding: "6px 14px",
              borderRadius: 2,
              cursor: "pointer",
              transition: "border-color 150ms, color 150ms, background 150ms",
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
            color: V.textMuted,
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
          <a href="https://docs.veclabs.xyz" style={linkStyle} onMouseEnter={linkHover} onMouseLeave={linkLeave}>Docs</a>
          <a href="https://github.com/veclabs/veclabs" style={linkStyle} onMouseEnter={linkHover} onMouseLeave={linkLeave}>GitHub</a>
          <a href="/blog" style={linkStyle} onMouseEnter={linkHover} onMouseLeave={linkLeave}>Blog</a>
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
              color: V.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 28,
            }}
          >
            VECLABS / RECALL / ALPHA
          </div>

          {/* Typewriter headline */}
          <h1
            style={{
              fontFamily: V.mono,
              fontWeight: 800,
              fontSize: "clamp(40px, 6vw, 72px)",
              letterSpacing: "-0.02em",
              color: V.text,
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
                background: V.greenLight,
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
              fontSize: 16,
              fontWeight: 400,
              color: V.textMuted,
              lineHeight: 1.5,
              maxWidth: 560,
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
              color: V.textMuted,
              lineHeight: 1.7,
              maxWidth: 560,
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
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                background: V.surface,
                border: `1px solid ${V.border}`,
                borderRadius: 2,
                padding: "10px 14px",
                marginBottom: 8,
                maxWidth: 420,
                color: V.text,
              }}
            >
              <span style={{ color: V.textMuted }}>$</span> npm install @veclabs/solvec
            </div>
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
                <span style={{ color: item.live ? V.text : V.textMuted, minWidth: 160 }}>
                  {item.pkg}
                </span>
                <span style={{ color: V.textMuted }}>{item.desc}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 7px",
                    borderRadius: 2,
                    background: item.live ? V.green : "transparent",
                    border: `1px solid ${item.live ? V.borderLight : V.border}`,
                    color: item.live ? V.text : V.textMuted,
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
                color: V.text,
                border: `1px solid ${V.borderLight}`,
                padding: "10px 24px",
                borderRadius: 2,
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
                border: `1px solid ${V.border}`,
                color: V.textMuted,
                padding: "10px 24px",
                borderRadius: 2,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Source
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 48,
          borderTop: `1px solid ${V.border}`,
          height: 0,
        }}
      />
    </section>
  );
}

function StatsBar() {
  const items = [
    { num: "4.7ms", unit: "p99", label: "LATENCY" },
    { num: "100K", unit: "", label: "VECTORS" },
    { num: "26/26", unit: "", label: "TESTS" },
  ];
  return (
    <section
      style={{
        background: V.surface,
        borderTop: `1px solid ${V.border}`,
        borderBottom: `1px solid ${V.border}`,
        padding: "28px 0",
      }}
    >
      <div
        className="content-width"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {items.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "0 16px",
              borderLeft: i > 0 ? `1px solid ${V.border}` : undefined,
            }}
          >
            <div
              style={{
                fontFamily: V.mono,
                fontWeight: 700,
                fontSize: 28,
                color: V.text,
                lineHeight: 1.1,
              }}
            >
              {s.num}
              {s.unit ? (
                <span style={{ fontSize: 24, marginLeft: 2 }}>{s.unit}</span>
              ) : null}
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                fontWeight: 500,
                color: V.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 8,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
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
              color: V.text,
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
              color: V.textMuted,
              lineHeight: 1.7,
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
                color: V.text,
                borderLeft: `4px solid ${V.greenLight}`,
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

/* ── Architecture (three layers) ─────────────────────────────────────────────── */
const ARCH_LAYERS = [
  {
    badge: "LAYER 1",
    title: "Rust HNSW engine",
    sub: "In-process vector search. No network round-trip on the query path. 4.7ms p99 at 100K vectors.",
    phase: "SHIPPED",
    solana: false,
  },
  {
    badge: "LAYER 2",
    title: "SDK & client-side encryption",
    sub: "AES-256-GCM before anything leaves the SDK. The key is derived from your credentials.",
    phase: "ALPHA",
    solana: false,
  },
  {
    badge: "LAYER 3",
    title: "Solana — cryptographic proof",
    sub: "A Merkle root of your collection state is recorded on-chain after every write. Verifiable by anyone.",
    phase: "LIVE",
    solana: true,
  },
];

function ArchitectureSection() {
  return (
    <section className="section" style={{ background: V.bg }}>
      <div className="content-width" style={{ maxWidth: 860, margin: "0 auto" }}>
        <FadeUp>
          <SectionLabel>ARCHITECTURE</SectionLabel>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {ARCH_LAYERS.map((layer, idx) => (
            <div key={layer.badge} style={{ width: "100%", position: "relative" }}>
              {idx > 0 && (
                <div
                  style={{
                    height: 24,
                    marginLeft: 24,
                    borderLeft: `1px dashed ${V.border}`,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  background: V.surface,
                  border: `1px solid ${V.border}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: 4,
                    flexShrink: 0,
                    background: layer.solana ? V.brown : V.greenLight,
                  }}
                />
                <div style={{ flex: 1, padding: "24px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: V.mono,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          background: V.green,
                          color: V.text,
                          padding: "4px 10px",
                          borderRadius: 2,
                          display: "inline-block",
                          marginBottom: 12,
                        }}
                      >
                        {layer.badge}
                      </span>
                      <h3
                        style={{
                          fontFamily: V.mono,
                          fontWeight: 700,
                          fontSize: 18,
                          color: V.text,
                          margin: "0 0 8px",
                          lineHeight: 1.3,
                        }}
                      >
                        {layer.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: V.mono,
                          fontSize: 13,
                          color: V.textMuted,
                          lineHeight: 1.6,
                          margin: 0,
                          maxWidth: 560,
                        }}
                      >
                        {layer.sub}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: V.mono,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: V.bg,
                        border: `1px solid ${V.border}`,
                        color: V.textMuted,
                        padding: "6px 10px",
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      {layer.phase}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Code block (Material Dark — tokens in globals.css) ─────────────────────── */
function CodeBlock({ code, dimmed = false }: { code: string; dimmed?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const colorizeLine = (line: string): React.ReactNode => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      return <span style={{ color: "var(--code-md-comment)" }}>{line}</span>;
    }
    const segments: Array<{ text: string; t: "kw" | "str" | "num" | "norm" }> = [];
    let pos = 0;
    let m: RegExpExecArray | null;
    const tokenRe = new RegExp(CODE_TOKEN_RE.source, "g");
    while ((m = tokenRe.exec(line)) !== null) {
      if (m.index > pos) {
        segments.push({ text: line.slice(pos, m.index), t: "norm" });
      }
      const tok = m[0];
      const isKw = CODE_KW_TEST.test(tok);
      const isNum = /^\d/.test(tok);
      if (isKw) segments.push({ text: tok, t: "kw" });
      else if (isNum) segments.push({ text: tok, t: "num" });
      else if (/^['"`]/.test(tok)) segments.push({ text: tok, t: "str" });
      else segments.push({ text: tok, t: "norm" });
      pos = m.index + tok.length;
    }
    if (pos < line.length) segments.push({ text: line.slice(pos), t: "norm" });

    return (
      <>
        {segments.map((seg, j) => {
          if (seg.t === "kw")
            return (
              <span key={j} style={{ color: "var(--code-md-keyword)" }}>
                {seg.text}
              </span>
            );
          if (seg.t === "str")
            return (
              <span key={j} style={{ color: "var(--code-md-string)" }}>
                {seg.text}
              </span>
            );
          if (seg.t === "num")
            return (
              <span key={j} style={{ color: "var(--code-md-number)" }}>
                {seg.text}
              </span>
            );
          return <span key={j}>{paintCodeNormText(seg.text)}</span>;
        })}
      </>
    );
  };

  const lines = code.split("\n");
  const codeFont = "var(--font-code)";

  return (
    <div
      className="code-block-mdl"
      style={{
        background: "var(--code-md-bg)",
        border: "1px solid var(--code-md-border)",
        borderRadius: 4,
        position: "relative",
        opacity: dimmed ? 0.55 : 1,
        overflow: "hidden",
        fontFamily: codeFont,
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "var(--code-md-topbar-bg)",
          borderBottom: "1px solid var(--code-md-topbar-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["var(--code-md-dots)", "var(--code-md-dots)", "var(--code-md-dots)"].map(
            (c, idx) => (
              <div
                key={idx}
                style={{ width: 8, height: 8, borderRadius: "50%", background: c }}
              />
            )
          )}
        </div>
        <span style={{ fontFamily: codeFont, fontSize: 12, color: "var(--code-md-label)" }}>
          snippet.ts
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            fontFamily: codeFont,
            fontSize: 10,
            color: copied ? "var(--code-md-string)" : "var(--code-md-label)",
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div
          style={{
            padding: "20px 16px 20px 24px",
            borderRight: "1px solid var(--code-md-border)",
            textAlign: "right",
            userSelect: "none",
            flexShrink: 0,
            minWidth: 32,
            boxSizing: "content-box",
          }}
        >
          {lines.map((_, i) => (
            <div
              key={i}
              style={{
                fontFamily: codeFont,
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--code-md-line-num)",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <pre
          style={{
            margin: 0,
            padding: "20px 24px 20px 0",
            flex: 1,
            minWidth: 0,
            fontFamily: codeFont,
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ flex: 1 }}>{colorizeLine(line)}</span>
              {i === lines.length - 1 && !dimmed ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1.1em",
                    background: "var(--code-md-cursor)",
                    opacity: 0.8,
                    marginLeft: 4,
                    flexShrink: 0,
                    animation: "code-cursor-blink 1s ease-in-out infinite",
                  }}
                />
              ) : null}
            </div>
          ))}
        </pre>
      </div>
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
                  color: V.text,
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
                  background: V.green,
                  border: `1px solid ${V.borderLight}`,
                  color: V.text,
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
                color: V.text,
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
                color: V.textMuted,
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
                color: V.textMuted,
                marginTop: 16,
              }}
            >
              <span style={{ color: V.textMuted }}>$</span> npm install @veclabs/solvec
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
                  color: V.textMuted,
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
                  background: V.surface,
                  border: `1px solid ${V.border}`,
                  color: V.textMuted,
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
                color: V.text,
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
                color: V.textMuted,
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
            borderRadius: 2,
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
              color: V.text,
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
                background: V.greenLight,
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
                    background: V.greenLight,
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
                      color: V.text,
                    }}
                  >
                    [{step.label}]
                  </span>
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize: 12,
                      color: V.textMuted,
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
                        color: V.greenLight,
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
                        color: V.textDim,
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
                color: V.textDim,
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
                color: V.text,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: V.textMuted }}>query()</span>
              <span style={{ color: V.textDim }}>→</span>
              <span>[HNSW search in RAM]</span>
              <span style={{ color: V.textDim }}>→</span>
              <span style={{ color: V.text }}>4.7ms p99</span>
              <span style={{ color: V.textDim }}>→</span>
              <span>returns</span>
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                color: V.textDim,
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
function BenchSection() {
  const cols = [
    { big: "4.7", unit: "ms", label: "P99 LATENCY", sub: "Recall (in-process)" },
    { big: "~30", unit: "ms", label: "P99 LATENCY", sub: "Pinecone" },
    { big: "~15", unit: "ms", label: "P99 LATENCY", sub: "Qdrant" },
  ];
  return (
    <section className="section" style={{ background: V.surface, borderTop: `1px solid ${V.border}` }}>
      <div className="content-width">
        <FadeUp>
          <SectionLabel>PERFORMANCE</SectionLabel>
        </FadeUp>
        <FadeUp delay={40}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              maxWidth: 900,
              margin: "0 auto 24px",
            }}
          >
            {cols.map((c, i) => (
              <div
                key={c.sub}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "24px 16px",
                  borderLeft: i > 0 ? `1px solid ${V.border}` : undefined,
                }}
              >
                <div
                  style={{
                    fontFamily: V.mono,
                    fontWeight: 700,
                    fontSize: 80,
                    color: V.text,
                    lineHeight: 1,
                  }}
                >
                  {c.big}
                  <span style={{ fontSize: 24, marginLeft: 4 }}>{c.unit}</span>
                </div>
                <div
                  style={{
                    height: 1,
                    background: V.border,
                    margin: "16px auto",
                    maxWidth: 120,
                  }}
                />
                <div style={{ fontFamily: V.mono, fontSize: 14, color: V.text, marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: V.mono, fontSize: 11, color: V.textMuted }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: `1px solid ${V.border}`,
              paddingTop: 16,
              fontFamily: V.mono,
              fontSize: 12,
              color: V.textMuted,
              lineHeight: 1.6,
              textAlign: "center",
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

const COMP_ROWS: { feature: string; recall: string; pinecone: string; qdrant: string }[] = [
  { feature: "P99 query latency", recall: "4.7ms", pinecone: "~30ms", qdrant: "~15ms" },
  { feature: "Architecture", recall: "in-process", pinecone: "managed API", qdrant: "server" },
  { feature: "Cryptographic proof", recall: "✓", pinecone: "\u2014", qdrant: "\u2014" },
  { feature: "Client-side encryption", recall: "✓", pinecone: "\u2014", qdrant: "\u2014" },
];

function ComparisonSection() {
  return (
    <section className="section" style={{ background: V.bg }}>
      <div className="content-width">
        <FadeUp>
          <SectionLabel>COMPARISON</SectionLabel>
        </FadeUp>
        <FadeUp delay={40}>
          <div
            style={{
              border: `1px solid ${V.border}`,
              borderRadius: 2,
              overflow: "hidden",
              fontFamily: V.mono,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                background: V.surface,
                borderBottom: `1px solid ${V.border}`,
              }}
            >
              <div style={{ padding: "12px 14px", color: V.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Feature
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  fontWeight: 700,
                  color: V.text,
                  textAlign: "center",
                  borderLeft: `1px solid ${V.borderLight}`,
                  borderRight: `1px solid ${V.borderLight}`,
                  background: "color-mix(in srgb, var(--green) 35%, transparent)",
                }}
              >
                RECALL
              </div>
              <div style={{ padding: "12px 14px", color: V.textMuted, textAlign: "center" }}>Pinecone</div>
              <div style={{ padding: "12px 14px", color: V.textMuted, textAlign: "center" }}>Qdrant</div>
            </div>
            {COMP_ROWS.map((row, ri) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                  borderTop: `1px solid ${V.surface}`,
                  background: ri % 2 === 0 ? V.bg : "transparent",
                }}
              >
                <div style={{ padding: "12px 14px", color: V.text, borderRight: `1px solid ${V.border}` }}>{row.feature}</div>
                <div
                  style={{
                    padding: "12px 14px",
                    color: V.text,
                    textAlign: "center",
                    borderLeft: `1px solid ${V.borderLight}`,
                    borderRight: `1px solid ${V.borderLight}`,
                    background: "color-mix(in srgb, var(--green) 20%, transparent)",
                  }}
                >
                  {row.recall}
                </div>
                <div style={{ padding: "12px 14px", color: "var(--code-line)", textAlign: "center" }}>{row.pinecone}</div>
                <div style={{ padding: "12px 14px", color: "var(--code-line)", textAlign: "center" }}>{row.qdrant}</div>
              </div>
            ))}
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

  const isShipped = (s: string) => s === "SHIPPED" || s === "IN PROGRESS";

  return (
    <section className="section">
      <div className="content-width">
        <FadeUp>
          <SectionLabel>ROADMAP</SectionLabel>
        </FadeUp>

        <div ref={containerRef} style={{ position: "relative", paddingLeft: 28 }}>
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 6,
              width: 1,
              height: lineHeight,
              background: V.border,
              transition: "height 0.1s linear",
            }}
          />

          {PHASES.map((phase, i) => {
            const shipped = isShipped(phase.status);
            const upcoming = phase.status === "PLANNED";
            return (
              <div
                key={phase.num}
                style={{
                  position: "relative",
                  paddingBottom: i < PHASES.length - 1 ? 40 : 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -28 + 4,
                    top: 4,
                    width: 10,
                    height: 10,
                    marginLeft: -5,
                    borderRadius: "50%",
                    background: shipped ? V.green : V.surface,
                    border: `1px solid ${V.border}`,
                    animation:
                      phase.status === "IN PROGRESS"
                        ? "pulse-dot 2s ease-in-out infinite"
                        : "none",
                  }}
                />

                <div
                  style={{
                    opacity: lineHeight > (i / PHASES.length) * 1000 ? 1 : 0,
                    transform:
                      lineHeight > (i / PHASES.length) * 1000
                        ? "none"
                        : "translateY(8px)",
                    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                    paddingLeft: 12,
                    borderLeft: shipped ? `4px solid ${V.greenLight}` : "4px solid transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: V.mono,
                        fontSize: 11,
                        fontWeight: 500,
                        color: V.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {phase.num}
                    </span>
                    <span
                      style={{
                        fontFamily: V.mono,
                        fontSize: 10,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "4px 10px",
                        borderRadius: 2,
                        background: shipped ? V.green : V.surface,
                        border: `1px solid ${V.border}`,
                        color: shipped ? V.text : V.textMuted,
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
                      color: upcoming ? V.textMuted : V.text,
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
                      color: upcoming ? V.textDim : V.textMuted,
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {phase.desc}
                  </div>
                </div>
              </div>
            );
          })}
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
                    color: V.greenLight,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
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
                    color: V.textMuted,
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
                  color: V.text,
                  border: `1px solid ${V.borderLight}`,
                  padding: "10px 24px",
                  borderRadius: 2,
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

  const linkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = V.text;
  };
  const linkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = V.textMuted;
  };

  return (
    <footer
      style={{
        position: "relative",
        background: V.bg,
        borderTop: `1px solid ${V.border}`,
        padding: "40px 0",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 48,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: V.brown,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -2,
          right: 48,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: V.brown,
        }}
      />
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
              <span
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 14,
                  color: V.text,
                }}
              >
                Recall
              </span>
            </div>
            <div
              style={{
                fontFamily: V.mono,
                fontSize: 12,
                color: V.textDim,
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
                  color: V.textMuted,
                  textDecoration: "none",
                  transition: "color 150ms",
                }}
                onMouseEnter={linkHover}
                onMouseLeave={linkLeave}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                fontFamily: V.mono,
                fontSize: 11,
                background: copied ? V.borderLight : V.green,
                border: `1px solid ${V.borderLight}`,
                color: V.text,
                padding: "6px 14px",
                borderRadius: 2,
                cursor: "pointer",
                transition: "border-color 150ms, color 150ms, background 150ms",
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
              color: V.textDim,
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
        <StatsBar />
        <ProblemSection />
        <ArchitectureSection />
        <StackSection />
        <ArchSection />
        <BenchSection />
        <ComparisonSection />
        <RoadmapSection />
        <PrinciplesSection />
        <QuickStartSection />
      </main>
      <Footer />
    </>
  );
}
