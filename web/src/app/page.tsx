"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Design tokens ────────────────────────────────────────────────────── */
const BG = "#ffffff";
const SURFACE = "#f9f9f9";
const BORDER = "#e5e5e5";
const TEXT = "#111111";
const MUTED = "#666666";
const DIM = "#999999";
const SANS = "var(--font-sans)";
const MONO = "var(--font-code)";

/* ── Syntax highlighting ─────────────────────────────────────────────── */
const CODE_KEYWORDS =
  "import|export|from|const|let|var|await|async|function|return|new|typeof|instanceof|class|extends|interface|type|enum|readonly|public|private|protected|static|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|void|delete|yield|as|in|of|this|super|true|false|null|undefined|fn|pub|use|mut|impl|trait|struct|crate|mod|match|move|ref|dyn|unsafe";
const CODE_TOKEN_RE = new RegExp(
  [
    "'(?:[^'\\\\]|\\\\.)*'",
    '"(?:[^"\\\\]|\\\\.)*"',
    "`(?:[^`\\\\]|\\\\.)*`",
    `\\b(?:${CODE_KEYWORDS})\\b`,
    "\\b\\d+\\.?\\d*\\b",
  ].join("|"),
  "g",
);
const CODE_KW_TEST = new RegExp(`^(?:${CODE_KEYWORDS})$`);

function paintLine(line: string): React.ReactNode {
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span style={{ color: "var(--code-md-comment)" }}>{line}</span>;
  }
  const segs: Array<{ text: string; t: "kw" | "str" | "num" | "norm" }> = [];
  let pos = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(CODE_TOKEN_RE.source, "g");
  while ((m = re.exec(line)) !== null) {
    if (m.index > pos) segs.push({ text: line.slice(pos, m.index), t: "norm" });
    const tok = m[0];
    if (CODE_KW_TEST.test(tok)) segs.push({ text: tok, t: "kw" });
    else if (/^\d/.test(tok)) segs.push({ text: tok, t: "num" });
    else if (/^['"`]/.test(tok)) segs.push({ text: tok, t: "str" });
    else segs.push({ text: tok, t: "norm" });
    pos = m.index + tok.length;
  }
  if (pos < line.length) segs.push({ text: line.slice(pos), t: "norm" });
  return (
    <>
      {segs.map((s, j) => {
        if (s.t === "kw")
          return (
            <span key={j} style={{ color: "var(--code-md-keyword)" }}>
              {s.text}
            </span>
          );
        if (s.t === "str")
          return (
            <span key={j} style={{ color: "var(--code-md-string)" }}>
              {s.text}
            </span>
          );
        if (s.t === "num")
          return (
            <span key={j} style={{ color: "var(--code-md-number)" }}>
              {s.text}
            </span>
          );
        return (
          <span key={j} style={{ color: "var(--code-md-default)" }}>
            {s.text}
          </span>
        );
      })}
    </>
  );
}

/* ── Scroll fade-in hook ─────────────────────────────────────────────── */
function useFadeIn(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 500,
        color: DIM,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        marginBottom: 32,
      }}
    >
      {children}
    </div>
  );
}

/* ── Full code block (Material Dark, with copy + line numbers) ───────── */
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

  const lines = code.split("\n");

  return (
    <div
      className="code-block-mdl"
      style={{
        background: "var(--code-md-bg)",
        border: "1px solid var(--code-md-border)",
        borderRadius: 6,
        position: "relative",
        opacity: dimmed ? 0.55 : 1,
        overflow: "hidden",
        fontFamily: MONO,
        fontSize: 13,
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
          {[
            "var(--code-md-dots)",
            "var(--code-md-dots)",
            "var(--code-md-dots)",
          ].map((c, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: "var(--code-md-label)",
          }}
        >
          snippet.ts
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            fontFamily: MONO,
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
            padding: "16px 12px 16px 20px",
            borderRight: "1px solid var(--code-md-border)",
            textAlign: "right",
            userSelect: "none",
            flexShrink: 0,
            minWidth: 28,
          }}
        >
          {lines.map((_, i) => (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: 13,
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
            padding: "16px 20px 16px 0",
            paddingLeft: 16,
            flex: 1,
            minWidth: 0,
            fontFamily: MONO,
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ flex: 1 }}>{paintLine(line)}</span>
              {i === lines.length - 1 && !dimmed && (
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
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ── Simple dark install block ───────────────────────────────────────── */
function InstallBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div
      style={{
        background: "#111111",
        borderRadius: 6,
        padding: "14px 18px",
        fontFamily: MONO,
        fontSize: 13,
        color: "#d4d4d4",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <pre
        style={{ margin: 0, whiteSpace: "pre-wrap", flex: 1, lineHeight: 1.6 }}
      >
        {code}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          background: "none",
          border: "none",
          color: copied ? "#ce9178" : "#666666",
          fontFamily: MONO,
          fontSize: 11,
          cursor: "pointer",
          padding: "2px 0",
          flexShrink: 0,
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

/* ── Tabbed code block ───────────────────────────────────────────────── */
function TabbedCode({
  tabs,
}: {
  tabs: Array<{ label: string; code: string }>;
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            style={{
              fontFamily: SANS,
              fontSize: 13,
              padding: "8px 16px",
              background: "none",
              border: "none",
              borderBottom:
                active === i ? `2px solid ${TEXT}` : "2px solid transparent",
              color: active === i ? TEXT : MUTED,
              cursor: "pointer",
              marginBottom: -1,
              transition: "color 150ms",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        style={{
          background: "#111111",
          borderRadius: "0 0 6px 6px",
          padding: "20px 24px",
          fontFamily: MONO,
          fontSize: 13,
          color: "#d4d4d4",
          overflow: "hidden",
        }}
      >
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
            overflowX: "auto",
          }}
        >
          {tabs[active].code.split("\n").map((line, i) => (
            <div key={i}>{paintLine(line)}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════════════════ */
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Docs", href: "https://docs.veclabs.xyz", external: true },
    { label: "Pricing", href: "#pricing", external: false },
    { label: "Demo", href: "https://demo.veclabs.xyz", external: true },
    {
      label: "GitHub",
      href: "https://github.com/veclabs/veclabs",
      external: true,
    },
  ];

  const linkStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 14,
    color: MUTED,
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
        background: BG,
        borderBottom: `1px solid ${BORDER}`,
        height: 56,
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
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 15,
                color: TEXT,
                letterSpacing: "-0.02em",
              }}
            >
              VecLabs
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: DIM,
                letterSpacing: "0.05em",
              }}
            >
              memory layer
            </span>
          </div>
        </a>

        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 28 }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = TEXT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = MUTED;
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://app.veclabs.xyz/register"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 500,
              background: TEXT,
              color: "#ffffff",
              padding: "7px 16px",
              borderRadius: 4,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Get API Key
          </a>
        </div>

        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: MUTED,
            cursor: "pointer",
            padding: 8,
          }}
          aria-label="Menu"
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <line
              x1="2"
              y1="5"
              x2="16"
              y2="5"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <line
              x1="2"
              y1="9"
              x2="16"
              y2="9"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <line
              x1="2"
              y1="13"
              x2="16"
              y2="13"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              style={linkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://app.veclabs.xyz/register"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 500,
              background: TEXT,
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 4,
              textDecoration: "none",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Get API Key
          </a>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════════ */
const HERO_INSTALL = `npm install @veclabs/solvec
# or
pip install solvec --pre`;

function HeroSection() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "none" : "translateY(12px)",
    transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
  });

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: BG,
        paddingTop: 56,
      }}
    >
      <div
        className="content-width"
        style={{ width: "100%", paddingTop: 64, paddingBottom: 80 }}
      >
        <div style={{ maxWidth: 700 }}>
          <div style={fade(0)}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 500,
                color: DIM,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 28,
              }}
            >
              VECLABS / RECALL / ALPHA
            </div>
          </div>

          <div style={fade(40)}>
            <h1
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: "clamp(36px, 5.5vw, 64px)",
                letterSpacing: "-0.03em",
                color: TEXT,
                lineHeight: 1.1,
                margin: "0 0 20px",
              }}
            >
              Memory layer for AI agents.
            </h1>
          </div>

          <div style={fade(100)}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 18,
                color: MUTED,
                lineHeight: 1.6,
                margin: "0 0 12px",
                maxWidth: 560,
              }}
            >
              The complete memory layer for AI agents.
            </p>
          </div>

          <div style={fade(140)}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: MUTED,
                lineHeight: 1.7,
                margin: "0 0 32px",
                maxWidth: 560,
              }}
            >
              Two packages. Store, encrypt, verify - then assemble exactly the
              right context for every agent decision.
            </p>
          </div>

          {/* Package indicators */}
          <div
            style={{
              ...fade(180),
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 36,
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
                  fontFamily: MONO,
                  fontSize: 12,
                }}
              >
                <span
                  style={{ color: item.live ? TEXT : MUTED, minWidth: 160 }}
                >
                  {item.pkg}
                </span>
                <span style={{ color: MUTED }}>{item.desc}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 7px",
                    borderRadius: 3,
                    background: item.live ? TEXT : SURFACE,
                    border: `1px solid ${item.live ? TEXT : BORDER}`,
                    color: item.live ? "#ffffff" : MUTED,
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
              ...fade(220),
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            <a
              href="https://app.veclabs.xyz/register"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 14,
                background: TEXT,
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Get API Key
            </a>
            <a
              href="https://docs.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 14,
                background: BG,
                color: TEXT,
                border: `1px solid ${BORDER}`,
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              Read the docs
            </a>
            <a
              href="https://demo.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 14,
                background: BG,
                color: TEXT,
                border: `1px solid ${BORDER}`,
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              View Demo
            </a>
          </div>

          {/* Install block */}
          <div style={{ ...fade(260), maxWidth: 400, marginBottom: 16 }}>
            <InstallBlock code={HERO_INSTALL} />
          </div>

          <div style={fade(300)}>
            <p
              style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: 0 }}
            >
              Free tier includes 100K vectors. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════════════════ */
const STATS = [
  { value: "4.7ms", label: "p99 latency" },
  { value: "AES-256-GCM", label: "encrypted" },
  { value: "On-chain", label: "Merkle proofs" },
  { value: "88%", label: "cheaper than Pinecone" },
];

function StatsBar() {
  return (
    <div
      style={{
        background: SURFACE,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "24px 0",
      }}
    >
      <div className="content-width">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: 860,
            margin: "0 auto",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 160px",
                textAlign: "center",
                padding: "8px 20px",
                borderLeft: i > 0 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 17,
                  color: TEXT,
                  lineHeight: 1.2,
                  marginBottom: 3,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PROBLEM
══════════════════════════════════════════════════════════════════════ */
function ProblemSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>THE PROBLEM</SectionLabel>
        </FadeIn>
        <FadeIn delay={40}>
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 28,
              color: TEXT,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "0 0 32px",
            }}
          >
            AI agents forget. But forgetting is not the problem.
          </h2>
        </FadeIn>
        <FadeIn delay={80}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 15,
              color: MUTED,
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
              makes a wrong decision - a medical recommendation, a financial
              call, a customer-facing action - you need to answer one question.
            </p>
            <blockquote
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 18,
                color: TEXT,
                borderLeft: `4px solid ${BORDER}`,
                paddingLeft: 20,
                margin: "8px 0",
              }}
            >
              What did this agent know when it made that decision?
            </blockquote>
            <p style={{ margin: 0 }}>
              No current vector database can answer this. You can see what is in
              the database today. You cannot prove what was in it at any
              specific moment. You cannot audit what was retrieved for a given
              query. You cannot verify that nothing changed between then and
              now.
            </p>
            <p style={{ margin: 0 }}>
              This is not a theoretical concern. Regulators are already asking
              this question. Most companies cannot answer it. VecLabs is built
              so you can.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ARCHITECTURE (THREE LAYERS)
══════════════════════════════════════════════════════════════════════ */
const ARCH_LAYERS = [
  {
    badge: "LAYER 1",
    title: "Rust HNSW engine",
    sub: "In-process vector search. No network round-trip on the query path. 4.7ms p99 at 100K vectors.",
    phase: "SHIPPED",
    accent: TEXT,
  },
  {
    badge: "LAYER 2",
    title: "SDK & client-side encryption",
    sub: "AES-256-GCM before anything leaves the SDK. The key is derived from your credentials.",
    phase: "ALPHA",
    accent: TEXT,
  },
  {
    badge: "LAYER 3",
    title: "Solana - cryptographic proof",
    sub: "A Merkle root of your collection state is recorded on-chain after every write. Verifiable by anyone.",
    phase: "LIVE",
    accent: MUTED,
  },
];

function ArchitectureSection() {
  return (
    <section className="section" style={{ background: SURFACE }}>
      <div
        className="content-width"
        style={{ maxWidth: 860, margin: "0 auto" }}
      >
        <FadeIn>
          <SectionLabel>ARCHITECTURE</SectionLabel>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ARCH_LAYERS.map((layer, idx) => (
            <div
              key={layer.badge}
              style={{ width: "100%", position: "relative" }}
            >
              {idx > 0 && (
                <div
                  style={{
                    height: 20,
                    marginLeft: 24,
                    borderLeft: `1px dashed ${BORDER}`,
                  }}
                />
              )}
              <FadeIn delay={idx * 60}>
                <div
                  style={{
                    display: "flex",
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ width: 4, flexShrink: 0, background: BORDER }}
                  />
                  <div style={{ flex: 1, padding: "20px 20px" }}>
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
                            fontFamily: MONO,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            background: SURFACE,
                            color: MUTED,
                            border: `1px solid ${BORDER}`,
                            padding: "3px 8px",
                            borderRadius: 3,
                            display: "inline-block",
                            marginBottom: 10,
                          }}
                        >
                          {layer.badge}
                        </span>
                        <h3
                          style={{
                            fontFamily: SANS,
                            fontWeight: 600,
                            fontSize: 17,
                            color: TEXT,
                            margin: "0 0 6px",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {layer.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: SANS,
                            fontSize: 13,
                            color: MUTED,
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
                          fontFamily: MONO,
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                          color: MUTED,
                          padding: "5px 10px",
                          borderRadius: 3,
                          flexShrink: 0,
                        }}
                      >
                        {layer.phase}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STACK (@veclabs/solvec + @veclabs/recall)
══════════════════════════════════════════════════════════════════════ */
const solvecCode = `import { SolVec } from '@veclabs/solvec'

const sv  = new SolVec({ apiKey: 'vl_live_...' })
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
// proof.verified === true`;

const recallCode = `// coming in phase 7
import { Recall } from '@veclabs/recall'

const recall = new Recall(collection)

const context = await recall.getContext({
  task:      queryEmbedding,
  strategy:  'balanced',
  maxTokens: 2000
})
// context.persistent  - always-relevant memories
// context.recent      - recency weighted
// context.relevant    - semantically close
// context.novel       - unseen recently
// context.conflicts   - contradicts current task
// context.tokenCount  - 1847`;

function StackSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>THE STACK</SectionLabel>
        </FadeIn>

        <FadeIn delay={40}>
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
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 13,
                  color: TEXT,
                }}
              >
                @veclabs/solvec
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 3,
                  background: TEXT,
                  color: "#ffffff",
                  border: `1px solid ${TEXT}`,
                }}
              >
                LIVE
              </span>
            </div>
            <h3
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 22,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              The storage engine.
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: MUTED,
                lineHeight: 1.7,
                margin: "0 0 24px",
                maxWidth: 560,
              }}
            >
              Rust HNSW in-process vector search. AES-256-GCM client-side
              encryption. Cryptographic proof posted after every write. Answers:
              what is similar to this?
            </p>
            <CodeBlock code={solvecCode} />
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: MUTED,
                marginTop: 14,
              }}
            >
              $ npm install @veclabs/solvec
            </div>
          </div>
        </FadeIn>

        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${BORDER}`,
            margin: "0 0 48px",
          }}
        />

        <FadeIn delay={80}>
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
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                @veclabs/recall
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 3,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  color: MUTED,
                }}
              >
                PHASE 7
              </span>
            </div>
            <h3
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 22,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              The intelligence layer.
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: MUTED,
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
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   WRITE PATH
══════════════════════════════════════════════════════════════════════ */
const PIPELINE_STEPS = [
  {
    label: "HNSW insert",
    timing: "~2ms",
    returnsHere: true,
    fireForget: false,
  },
  {
    label: "AES-256-GCM encrypt",
    timing: "~1ms",
    returnsHere: false,
    fireForget: false,
  },
  {
    label: "disk persist",
    timing: "~1ms",
    returnsHere: false,
    fireForget: false,
  },
  {
    label: "Shadow Drive upload",
    timing: "~500ms–2s",
    returnsHere: false,
    fireForget: true,
  },
  {
    label: "cryptographic proof",
    timing: "~400ms",
    returnsHere: false,
    fireForget: true,
  },
];

function WritePathSection() {
  const { ref, visible } = useFadeIn(0.1);

  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>WRITE PATH</SectionLabel>
        </FadeIn>

        <div
          ref={ref}
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "36px 40px",
            maxWidth: 640,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              marginBottom: 20,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          >
            upsert() called
          </div>

          <div style={{ paddingLeft: 16, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 1,
                background: BORDER,
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
                <div
                  style={{
                    position: "absolute",
                    left: -3,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: step.returnsHere ? TEXT : BORDER,
                    border: `1px solid ${BORDER}`,
                    flexShrink: 0,
                  }}
                />

                <div style={{ paddingLeft: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: TEXT }}>
                    [{step.label}]
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: MUTED,
                      marginLeft: 12,
                    }}
                  >
                    {step.timing}
                  </span>
                  {step.returnsHere && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: TEXT,
                        marginLeft: 12,
                        fontWeight: 600,
                      }}
                    >
                      ← returns here
                    </span>
                  )}
                  {step.fireForget && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: DIM,
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

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: `1px solid ${BORDER}`,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease-out 1.2s",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 500,
                color: DIM,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              QUERY PATH
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: TEXT,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: MUTED }}>query()</span>
              <span style={{ color: DIM }}>→</span>
              <span>[HNSW search in RAM]</span>
              <span style={{ color: DIM }}>→</span>
              <span style={{ fontWeight: 600 }}>4.7ms p99</span>
              <span style={{ color: DIM }}>→</span>
              <span>returns</span>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: DIM,
                marginTop: 6,
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

/* ══════════════════════════════════════════════════════════════════════
   PERFORMANCE
══════════════════════════════════════════════════════════════════════ */
function BenchSection() {
  const cols = [
    {
      big: "4.7",
      unit: "ms",
      label: "P99 LATENCY",
      sub: "VecLabs (in-process)",
    },
    { big: "~30", unit: "ms", label: "P99 LATENCY", sub: "Pinecone" },
    { big: "~15", unit: "ms", label: "P99 LATENCY", sub: "Qdrant" },
  ];
  return (
    <section className="section" style={{ background: SURFACE }}>
      <div className="content-width">
        <FadeIn>
          <SectionLabel>PERFORMANCE</SectionLabel>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              maxWidth: 900,
              margin: "0 auto 24px",
              flexWrap: "wrap",
            }}
          >
            {cols.map((c, i) => (
              <div
                key={c.sub}
                style={{
                  flex: "1 1 200px",
                  textAlign: "center",
                  padding: "24px 16px",
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : undefined,
                }}
              >
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 72,
                    color: TEXT,
                    lineHeight: 1,
                  }}
                >
                  {c.big}
                  <span style={{ fontSize: 24, marginLeft: 4 }}>{c.unit}</span>
                </div>
                <div
                  style={{
                    height: 1,
                    background: BORDER,
                    margin: "16px auto",
                    maxWidth: 120,
                  }}
                />
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: TEXT,
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
                  {c.sub}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 16,
              fontFamily: MONO,
              fontSize: 12,
              color: MUTED,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Apple M3 · 100K vectors · 1536 dimensions · cosine similarity
            <br />
            Reproduce:{" "}
            <span style={{ color: TEXT }}>
              cargo run --release --example percentile_bench
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   COMPARISON TABLE
══════════════════════════════════════════════════════════════════════ */
const COMP_ROWS = [
  {
    feature: "P99 query latency",
    recall: "4.7ms",
    pinecone: "~30ms",
    qdrant: "~15ms",
  },
  {
    feature: "Architecture",
    recall: "in-process",
    pinecone: "managed API",
    qdrant: "server",
  },
  { feature: "Cryptographic proof", recall: "✓", pinecone: "-", qdrant: "-" },
  {
    feature: "Client-side encryption",
    recall: "✓",
    pinecone: "-",
    qdrant: "-",
  },
  { feature: "Memory Inspector", recall: "✓", pinecone: "-", qdrant: "-" },
  { feature: "Open source", recall: "MIT", pinecone: "-", qdrant: "Apache 2" },
];

function ComparisonSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>COMPARISON</SectionLabel>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              overflow: "hidden",
              fontFamily: SANS,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                background: SURFACE,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  color: DIM,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Feature
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  fontWeight: 600,
                  color: TEXT,
                  textAlign: "center",
                  borderLeft: `1px solid ${BORDER}`,
                  borderRight: `1px solid ${BORDER}`,
                  background: "#f5f5f5",
                }}
              >
                VecLabs
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                Pinecone
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                Qdrant
              </div>
            </div>
            {COMP_ROWS.map((row, ri) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                  borderTop: `1px solid ${BORDER}`,
                  background: ri % 2 === 0 ? BG : SURFACE,
                }}
              >
                <div
                  style={{
                    padding: "11px 14px",
                    color: TEXT,
                    borderRight: `1px solid ${BORDER}`,
                  }}
                >
                  {row.feature}
                </div>
                <div
                  style={{
                    padding: "11px 14px",
                    color: TEXT,
                    textAlign: "center",
                    fontWeight: 500,
                    borderLeft: `1px solid ${BORDER}`,
                    borderRight: `1px solid ${BORDER}`,
                    background: "#f5f5f5",
                  }}
                >
                  {row.recall}
                </div>
                <div
                  style={{
                    padding: "11px 14px",
                    color: MUTED,
                    textAlign: "center",
                  }}
                >
                  {row.pinecone}
                </div>
                <div
                  style={{
                    padding: "11px 14px",
                    color: MUTED,
                    textAlign: "center",
                  }}
                >
                  {row.qdrant}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ROADMAP
══════════════════════════════════════════════════════════════════════ */
const PHASES = [
  {
    num: "PHASE 1",
    status: "SHIPPED",
    name: "Rust HNSW Core",
    desc: "57 tests. 4.7ms p99 at 100K vectors. In-process.\nNo network round-trip on the query path.",
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
    desc: "Rust core compiled to WebAssembly. TypeScript SDK runs\nreal Rust - not a JavaScript fallback.",
  },
  {
    num: "PHASE 4",
    status: "SHIPPED",
    name: "Encrypted Disk Persistence",
    desc: "AES-256-GCM. Key derived from your credentials.\nCollection survives server restarts.",
  },
  {
    num: "PHASE 5",
    status: "SHIPPED",
    name: "Decentralized Storage",
    desc: "Encrypted collection backed up automatically after every write.\nFire-and-forget. Never blocks upsert().",
  },
  {
    num: "PHASE 6",
    status: "SHIPPED",
    name: "Memory Inspector",
    desc: "Full audit trail of every memory operation. What the agent\nstored, retrieved, and deleted - with timestamps and proof.",
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
  const [lineH, setLineH] = useState(0);

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
            setLineH(h);
            if (h >= totalH) clearInterval(id);
          }, 16);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section" style={{ background: SURFACE }}>
      <div className="content-width">
        <FadeIn>
          <SectionLabel>ROADMAP</SectionLabel>
        </FadeIn>

        <div
          ref={containerRef}
          style={{ position: "relative", paddingLeft: 28 }}
        >
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 6,
              width: 1,
              height: lineH,
              background: BORDER,
              transition: "height 0.1s linear",
            }}
          />

          {PHASES.map((phase, i) => {
            const shipped = phase.status === "SHIPPED";
            const inProgress = phase.status === "IN PROGRESS";
            const planned = phase.status === "PLANNED";
            return (
              <div
                key={phase.num}
                style={{
                  position: "relative",
                  paddingBottom: i < PHASES.length - 1 ? 36 : 0,
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
                    background: shipped ? TEXT : SURFACE,
                    border: `1px solid ${shipped ? TEXT : BORDER}`,
                  }}
                />

                <div
                  style={{
                    opacity: lineH > (i / PHASES.length) * 1000 ? 1 : 0,
                    transform:
                      lineH > (i / PHASES.length) * 1000
                        ? "none"
                        : "translateY(8px)",
                    transition:
                      "opacity 0.4s ease-out, transform 0.4s ease-out",
                    paddingLeft: 12,
                    borderLeft: shipped
                      ? `3px solid ${TEXT}`
                      : inProgress
                        ? `3px solid ${MUTED}`
                        : "3px solid transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 5,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        fontWeight: 500,
                        color: DIM,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {phase.num}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "3px 8px",
                        borderRadius: 3,
                        background: shipped ? TEXT : SURFACE,
                        border: `1px solid ${shipped ? TEXT : BORDER}`,
                        color: shipped ? "#ffffff" : MUTED,
                      }}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 15,
                      color: planned ? MUTED : TEXT,
                      marginBottom: 5,
                    }}
                  >
                    {phase.name}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      color: planned ? DIM : MUTED,
                      lineHeight: 1.65,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {phase.desc}
                  </div>
                </div>
              </div>
            );
          })}

          {/* GraphRAG teaser */}
          <div style={{ marginTop: 40, paddingLeft: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: `1px dashed ${BORDER}`,
                borderRadius: 6,
                padding: "14px 20px",
                background: SURFACE,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: DIM,
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 500,
                    color: DIM,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 5,
                  }}
                >
                  In research
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: MUTED,
                    lineHeight: 1.5,
                    maxWidth: 480,
                  }}
                >
                  Something at the intersection of vector search and graph
                  structures - not RAG on top of a graph, but a fundamentally
                  different architecture where the graph <em>is</em> the index.
                  Very early. Nothing to ship yet.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DESIGN DECISIONS
══════════════════════════════════════════════════════════════════════ */
const PRINCIPLES = [
  {
    label: "SPEED",
    body: "No network round-trip on the query path. The HNSW index lives in RAM. Every query is pure memory access. Rust means no garbage collector - no pause spikes at p99. The gap between p50 and p99.9 is 2.7ms. That gap is the whole story.",
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
        <FadeIn>
          <SectionLabel>DESIGN DECISIONS</SectionLabel>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {PRINCIPLES.map((p, i) => (
            <FadeIn key={p.label} delay={i * 80}>
              <div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 11,
                    color: TEXT,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: 10,
                  }}
                >
                  {p.label}
                </div>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 15,
                    color: MUTED,
                    lineHeight: 1.8,
                    margin: 0,
                    maxWidth: 600,
                  }}
                >
                  {p.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CODE EXAMPLE (tabbed TypeScript / Python)
══════════════════════════════════════════════════════════════════════ */
const TS_CODE = `import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ apiKey: 'vl_live_...' });
const collection = sv.collection('agent-memory', { dimensions: 1536 });

await collection.upsert([{
  id: 'mem_001',
  values: embedding,
  metadata: { text: 'User prefers dark mode' }
}]);

const results = await collection.query({ vector: queryEmbedding, topK: 5 });
const proof = await collection.verify(); // on-chain Merkle proof`;

const PY_CODE = `from solvec import SolVec

sv = SolVec(api_key='vl_live_...')
collection = sv.collection('agent-memory', dimensions=1536)

collection.upsert([{
    'id': 'mem_001',
    'values': embedding,
    'metadata': {'text': 'User prefers dark mode'}
}])

results = collection.query(vector=query_embedding, top_k=5)
proof = collection.verify()  # on-chain Merkle proof`;

function CodeExampleSection() {
  return (
    <section className="section" style={{ background: SURFACE }}>
      <div className="content-width">
        <FadeIn>
          <div style={{ marginBottom: 40 }}>
            <SectionLabel>PINECONE-COMPATIBLE API</SectionLabel>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 28,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 10px",
              }}
            >
              Migrate in 3 lines.
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: MUTED,
                margin: 0,
              }}
            >
              Everything else stays identical.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              overflow: "hidden",
              maxWidth: 720,
            }}
          >
            <TabbedCode
              tabs={[
                { label: "TypeScript", code: TS_CODE },
                { label: "Python", code: PY_CODE },
              ]}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PRICING TABLE
══════════════════════════════════════════════════════════════════════ */
const PRICING_FEATURES = [
  {
    label: "Vectors",
    free: "100K",
    pro: "2M",
    business: "20M",
    enterprise: "Unlimited",
  },
  {
    label: "Writes / month",
    free: "10K",
    pro: "500K",
    business: "5M",
    enterprise: "Unlimited",
  },
  {
    label: "Queries / month",
    free: "50K",
    pro: "1M",
    business: "10M",
    enterprise: "Unlimited",
  },
  {
    label: "Collections",
    free: "3",
    pro: "25",
    business: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "Merkle proofs",
    free: "✓",
    pro: "✓",
    business: "✓",
    enterprise: "✓",
  },
  {
    label: "Memory Inspector",
    free: "✓",
    pro: "✓",
    business: "✓",
    enterprise: "✓",
  },
  {
    label: "Shadow Drive",
    free: "-",
    pro: "✓",
    business: "✓",
    enterprise: "✓",
  },
  {
    label: "Email support",
    free: "-",
    pro: "✓",
    business: "✓",
    enterprise: "✓",
  },
  {
    label: "Priority support",
    free: "-",
    pro: "-",
    business: "✓",
    enterprise: "✓",
  },
  { label: "99.9% SLA", free: "-", pro: "-", business: "✓", enterprise: "✓" },
  {
    label: "Dedicated Slack",
    free: "-",
    pro: "-",
    business: "-",
    enterprise: "✓",
  },
  {
    label: "On-premise option",
    free: "-",
    pro: "-",
    business: "-",
    enterprise: "✓",
  },
  {
    label: "Custom contract",
    free: "-",
    pro: "-",
    business: "-",
    enterprise: "✓",
  },
];

function PricingSection() {
  const cols = [
    {
      key: "free" as const,
      name: "Free",
      price: "$0",
      period: "/mo",
      cta: "Get started",
      href: "https://app.veclabs.xyz/register",
      highlight: false,
    },
    {
      key: "pro" as const,
      name: "Pro",
      price: "$25",
      period: "/mo",
      cta: "Start Pro",
      href: "https://app.veclabs.xyz/register",
      highlight: true,
    },
    {
      key: "business" as const,
      name: "Business",
      price: "$199",
      period: "/mo",
      cta: "Start Business",
      href: "https://app.veclabs.xyz/register",
      highlight: false,
    },
    {
      key: "enterprise" as const,
      name: "Enterprise",
      price: "Custom",
      period: "",
      cta: "Contact us",
      href: "mailto:hello@veclabs.xyz",
      highlight: false,
    },
  ];

  const cellStyle = (highlight: boolean): React.CSSProperties => ({
    padding: "11px 16px",
    textAlign: "center",
    fontFamily: SANS,
    fontSize: 13,
    color: TEXT,
    background: highlight ? "#f5f5f5" : "transparent",
    borderLeft: `1px solid ${BORDER}`,
  });

  return (
    <section className="section" id="pricing">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>PRICING</SectionLabel>
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 28,
              color: TEXT,
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 15,
              color: MUTED,
              margin: "0 0 36px",
            }}
          >
            Pay for what you use. No hidden fees. No vendor lock-in.
          </p>
        </FadeIn>

        <FadeIn delay={40}>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              overflow: "hidden",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 600,
              }}
            >
              {/* Header: plan names + prices */}
              <thead>
                <tr
                  style={{
                    background: SURFACE,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 500,
                      color: DIM,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      width: "28%",
                    }}
                  >
                    Features
                  </th>
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        borderLeft: `1px solid ${BORDER}`,
                        background: col.highlight ? "#f0f0f0" : "transparent",
                        width: "18%",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: SANS,
                          fontWeight: 600,
                          fontSize: 14,
                          color: TEXT,
                          marginBottom: 4,
                        }}
                      >
                        {col.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: SANS,
                            fontWeight: 700,
                            fontSize: 22,
                            color: TEXT,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {col.price}
                        </span>
                        {col.period && (
                          <span
                            style={{
                              fontFamily: SANS,
                              fontSize: 12,
                              color: MUTED,
                            }}
                          >
                            {col.period}
                          </span>
                        )}
                      </div>
                      {col.highlight && (
                        <div
                          style={{
                            fontFamily: SANS,
                            fontSize: 10,
                            fontWeight: 500,
                            color: MUTED,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginTop: 4,
                          }}
                        >
                          Most popular
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Feature rows */}
              <tbody>
                {PRICING_FEATURES.map((row, ri) => (
                  <tr
                    key={row.label}
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      background: ri % 2 === 0 ? BG : SURFACE,
                    }}
                  >
                    <td
                      style={{
                        padding: "11px 16px",
                        fontFamily: SANS,
                        fontSize: 13,
                        color: MUTED,
                      }}
                    >
                      {row.label}
                    </td>
                    {cols.map((col) => (
                      <td key={col.key} style={cellStyle(col.highlight)}>
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              {/* CTA row */}
              <tfoot>
                <tr
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    background: SURFACE,
                  }}
                >
                  <td style={{ padding: "16px" }} />
                  {cols.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        borderLeft: `1px solid ${BORDER}`,
                        background: col.highlight ? "#f0f0f0" : "transparent",
                      }}
                    >
                      <a
                        href={col.href}
                        target={
                          col.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          col.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        style={{
                          display: "inline-block",
                          fontFamily: SANS,
                          fontSize: 13,
                          fontWeight: 500,
                          padding: "8px 16px",
                          borderRadius: 4,
                          textDecoration: "none",
                          background: col.highlight ? TEXT : "transparent",
                          color: col.highlight ? "#fff" : TEXT,
                          border: `1px solid ${col.highlight ? TEXT : BORDER}`,
                          transition: "opacity 150ms",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "0.8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      >
                        {col.cta}
                      </a>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════════════ */
function CTABanner() {
  return (
    <section style={{ background: "#111111", padding: "72px 0" }}>
      <div className="content-width">
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 28,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Start building in 2 minutes
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: "#888888",
                margin: "0 0 32px",
              }}
            >
              Free tier. No credit card. Get your API key and ship.
            </p>
            <a
              href="https://app.veclabs.xyz/register"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 14,
                background: "#ffffff",
                color: "#111111",
                padding: "10px 24px",
                borderRadius: 4,
                textDecoration: "none",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Get API Key
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   QUICK START
══════════════════════════════════════════════════════════════════════ */
const QS_CODE = `import { SolVec } from '@veclabs/solvec'

const sv     = new SolVec({ apiKey: 'vl_live_...' })
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
// proof.verified === true`;

function QuickStartSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <SectionLabel>QUICK START</SectionLabel>
        </FadeIn>
        <FadeIn delay={40}>
          <div style={{ maxWidth: 660 }}>
            <CodeBlock code={QS_CODE} />
            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <a
                href="https://docs.veclabs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 13,
                  background: TEXT,
                  color: "#fff",
                  border: `1px solid ${TEXT}`,
                  padding: "10px 24px",
                  borderRadius: 4,
                  textDecoration: "none",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Read the docs
              </a>
              <a
                href="https://app.veclabs.xyz/register"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 13,
                  background: "transparent",
                  color: TEXT,
                  border: `1px solid ${BORDER}`,
                  padding: "10px 24px",
                  borderRadius: 4,
                  textDecoration: "none",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                }}
              >
                Get API Key
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════ */
function Footer() {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const links = [
    { label: "GitHub", href: "https://github.com/veclabs/veclabs" },
    { label: "npm", href: "https://www.npmjs.com/package/@veclabs/solvec" },
    { label: "PyPI", href: "https://pypi.org/project/solvec" },
    { label: "Docs", href: "https://docs.veclabs.xyz" },
    { label: "Blog", href: "/blog" },
    { label: "@veclabss", href: "https://twitter.com/veclabss" },
  ];

  return (
    <footer
      style={{
        background: BG,
        borderTop: `1px solid ${BORDER}`,
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
          <div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 14,
                color: TEXT,
                marginBottom: 6,
              }}
            >
              VecLabs
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>
              MIT Licensed. Built for AI agents.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 24px",
              alignItems: "flex-start",
            }}
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  l.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: MUTED,
                  textDecoration: "none",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = TEXT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = MUTED;
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                background: copied ? SURFACE : BG,
                border: `1px solid ${BORDER}`,
                color: MUTED,
                padding: "6px 14px",
                borderRadius: 4,
                cursor: "pointer",
                transition: "background 150ms",
              }}
            >
              {copied ? "copied!" : "npm install @veclabs/solvec"}
            </button>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 16,
            textAlign: "center",
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>
            © 2026 VecLabs. MIT Licensed.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════ */
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 56, background: BG }}>
        <HeroSection />
        <StatsBar />
        <ProblemSection />
        <ArchitectureSection />
        <StackSection />
        <WritePathSection />
        <BenchSection />
        <ComparisonSection />
        <RoadmapSection />
        <PrinciplesSection />
        <CodeExampleSection />
        <PricingSection />
        <CTABanner />
        <QuickStartSection />
      </main>
      <Footer />
    </>
  );
}
