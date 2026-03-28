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

/* ── Fade-in on scroll ────────────────────────────────────────────────── */
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

/* ── Simple dark code block ───────────────────────────────────────────── */
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
        position: "relative",
      }}
    >
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          flex: 1,
          lineHeight: 1.6,
        }}
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

/* ── Tabbed code block ────────────────────────────────────────────────── */
function TabbedCode({
  tabs,
}: {
  tabs: Array<{ label: string; code: string }>;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: 0,
        }}
      >
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
              transition: "color 150ms",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code */}
      <div
        style={{
          background: "#111111",
          borderRadius: "0 0 6px 6px",
          padding: "24px",
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
          <ColorizedCode code={tabs[active].code} />
        </pre>
      </div>
    </div>
  );
}

/* ── Minimal syntax colorizer ─────────────────────────────────────────── */
function ColorizedCode({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>
          <ColorizedLine line={line} />
          {i < lines.length - 1 ? "\n" : null}
        </div>
      ))}
    </>
  );
}

function ColorizedLine({ line }: { line: string }) {
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span style={{ color: "#6a9955" }}>{line}</span>;
  }
  const parts: React.ReactNode[] = [];
  const tokenRe =
    /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|var|await|async|function|return|new|class|if|else|for|while|try|catch|true|false|null|undefined)\b|\b\d+\.?\d*\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(line)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`n${last}`} style={{ color: "#d4d4d4" }}>
          {line.slice(last, m.index)}
        </span>,
      );
    }
    const tok = m[0];
    let color = "#d4d4d4";
    if (/^['"`]/.test(tok)) color = "#ce9178";
    else if (/^\d/.test(tok)) color = "#b5cea8";
    else
      color =
        "#569cd6"; /* keywords */
    parts.push(
      <span key={`t${m.index}`} style={{ color }}>
        {tok}
      </span>,
    );
    last = m.index + tok.length;
  }
  if (last < line.length) {
    parts.push(
      <span key="end" style={{ color: "#d4d4d4" }}>
        {line.slice(last)}
      </span>,
    );
  }
  return <>{parts}</>;
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION 1 — Navigation
══════════════════════════════════════════════════════════════════════ */
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Docs", href: "https://docs.veclabs.xyz", external: true },
    { label: "Pricing", href: "#pricing", external: false },
    { label: "Demo", href: "https://demo.veclabs.xyz", external: true },
    { label: "GitHub", href: "https://github.com/veclabs/veclabs", external: true },
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
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 16,
              color: TEXT,
              letterSpacing: "-0.02em",
            }}
          >
            Recall
          </span>
        </a>

        {/* Desktop nav */}
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
              fontSize: 14,
              fontWeight: 500,
              background: TEXT,
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 4,
              textDecoration: "none",
              transition: "opacity 150ms",
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

        {/* Mobile toggle */}
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
            <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth={1.5} />
            <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth={1.5} />
            <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
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
              color: "#ffffff",
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
   SECTION 2 — Hero
══════════════════════════════════════════════════════════════════════ */
const INSTALL_CODE = `npm install @veclabs/solvec
# or
pip install solvec --pre`;

function HeroSection() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const fadeStyle = (delay = 0): React.CSSProperties => ({
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
      <div className="content-width" style={{ width: "100%", paddingTop: 64, paddingBottom: 80 }}>
        <div style={{ maxWidth: 680 }}>
          <div style={fadeStyle(0)}>
            <h1
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: "clamp(36px, 5vw, 60px)",
                letterSpacing: "-0.03em",
                color: TEXT,
                lineHeight: 1.1,
                margin: "0 0 20px",
              }}
            >
              Cryptographic memory for AI agents.
            </h1>
          </div>

          <div style={fadeStyle(80)}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 18,
                fontWeight: 400,
                color: MUTED,
                lineHeight: 1.6,
                margin: "0 0 36px",
                maxWidth: 560,
              }}
            >
              Vector database with on-chain Merkle proofs. AES-256-GCM
              encryption. 4.7ms p99. One API key.
            </p>
          </div>

          {/* CTAs */}
          <div
            style={{
              ...fadeStyle(160),
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
                fontSize: 15,
                background: TEXT,
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
                transition: "opacity 150ms",
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
              href="https://demo.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 15,
                background: BG,
                color: TEXT,
                border: `1px solid ${BORDER}`,
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#999999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              View Demo
            </a>
          </div>

          {/* Install block */}
          <div style={{ ...fadeStyle(240), maxWidth: 420, marginBottom: 16 }}>
            <InstallBlock code={INSTALL_CODE} />
          </div>

          {/* Free tier note */}
          <div style={fadeStyle(300)}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 13,
                color: DIM,
                margin: 0,
              }}
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
   SECTION 3 — Stats bar
══════════════════════════════════════════════════════════════════════ */
const STATS = [
  { value: "4.7ms", label: "p99 latency" },
  { value: "AES-256", label: "GCM encrypted" },
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
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 160px",
                textAlign: "center",
                padding: "8px 16px",
                borderLeft: i > 0 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 18,
                  color: TEXT,
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: MUTED,
                }}
              >
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
   SECTION 4 — How it works
══════════════════════════════════════════════════════════════════════ */
const HOW_CARDS = [
  {
    icon: "⚡",
    title: "Rust HNSW Core",
    layer: "Speed Layer",
    body: "In-memory vector index compiled to WASM. Runs inside your process. No network round-trip. 4.7ms p99 at 100K vectors.",
  },
  {
    icon: "🔒",
    title: "Shadow Drive",
    layer: "Storage Layer",
    body: "AES-256-GCM encrypted vectors stored on Solana's decentralized storage network. 88% cheaper than centralized alternatives.",
  },
  {
    icon: "⛓",
    title: "Solana On-Chain",
    layer: "Trust Layer",
    body: "SHA-256 Merkle root posted after every write. Immutable, timestamped, publicly verifiable proof of your collection's state.",
  },
];

function HowItWorksSection() {
  return (
    <section className="section">
      <div className="content-width">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 28,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              How Recall works
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 16,
                color: MUTED,
                margin: 0,
              }}
            >
              Three layers. Each doing only what it does best.
            </p>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {HOW_CARDS.map((card, i) => (
            <FadeIn key={card.title} delay={i * 80}>
              <div
                style={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  padding: 24,
                  background: BG,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 500,
                    color: DIM,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  {card.layer}
                </div>
                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 17,
                    color: TEXT,
                    margin: "0 0 10px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    color: MUTED,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {card.body}
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
   SECTION 5 — Code example
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
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 28,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Pinecone-compatible API
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 16,
                color: MUTED,
                margin: 0,
              }}
            >
              Migrate in 3 lines. Everything else stays identical.
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
   SECTION 6 — Pricing
══════════════════════════════════════════════════════════════════════ */
interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

const PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: [
      "100K vectors",
      "10K writes/month",
      "50K queries/month",
      "3 collections",
      "Merkle proofs ✓",
      "Memory Inspector ✓",
    ],
    cta: "Get started free",
    ctaHref: "https://app.veclabs.xyz/register",
  },
  {
    name: "Pro",
    price: "$25",
    period: "/mo",
    highlight: true,
    badge: "Most popular",
    features: [
      "2M vectors",
      "500K writes/month",
      "1M queries/month",
      "25 collections",
      "Everything in Free ✓",
      "Shadow Drive ✓",
      "Email support ✓",
    ],
    cta: "Start Pro",
    ctaHref: "https://app.veclabs.xyz/register",
  },
  {
    name: "Business",
    price: "$199",
    period: "/mo",
    features: [
      "20M vectors",
      "5M writes/month",
      "10M queries/month",
      "Unlimited collections",
      "Everything in Pro ✓",
      "Priority support ✓",
      "99.9% SLA ✓",
    ],
    cta: "Start Business",
    ctaHref: "https://app.veclabs.xyz/register",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited everything",
      "Dedicated Slack",
      "Custom contract",
      "On-premise option",
    ],
    cta: "Contact us",
    ctaHref: "mailto:hello@veclabs.xyz",
  },
];

function PricingSection() {
  return (
    <section className="section" id="pricing">
      <div className="content-width">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 28,
                color: TEXT,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 16,
                color: MUTED,
                margin: 0,
              }}
            >
              Pay for what you use. No hidden fees. No vendor lock-in.
            </p>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 60}>
              <div
                style={{
                  border: `1px solid ${plan.highlight ? TEXT : BORDER}`,
                  borderRadius: 6,
                  padding: 28,
                  background: BG,
                  position: "relative",
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: TEXT,
                      color: "#ffffff",
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: "0 0 4px 4px",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 20, marginTop: plan.badge ? 12 : 0 }}>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 15,
                      color: TEXT,
                      marginBottom: 8,
                    }}
                  >
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: 32,
                        color: TEXT,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: 14,
                          color: MUTED,
                        }}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    margin: "0 0 24px",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        color: MUTED,
                        lineHeight: 1.4,
                      }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
                  rel={
                    plan.ctaHref.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "9px 0",
                    borderRadius: 4,
                    textDecoration: "none",
                    background: plan.highlight ? TEXT : "transparent",
                    color: plan.highlight ? "#ffffff" : TEXT,
                    border: `1px solid ${plan.highlight ? TEXT : BORDER}`,
                    transition: "opacity 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION 7 — CTA Banner
══════════════════════════════════════════════════════════════════════ */
function CTABanner() {
  return (
    <section
      style={{
        background: "#111111",
        padding: "72px 0",
      }}
    >
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
                fontSize: 16,
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
                fontSize: 15,
                background: "#ffffff",
                color: "#111111",
                padding: "10px 24px",
                borderRadius: 4,
                textDecoration: "none",
                display: "inline-block",
                transition: "opacity 150ms",
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
   SECTION 8 — Footer
══════════════════════════════════════════════════════════════════════ */
const FOOTER_LINKS = [
  { label: "Docs", href: "https://docs.veclabs.xyz", external: true },
  { label: "Demo", href: "https://demo.veclabs.xyz", external: true },
  { label: "GitHub", href: "https://github.com/veclabs/veclabs", external: true },
  { label: "Pricing", href: "#pricing", external: false },
  { label: "Status", href: "https://status.veclabs.xyz", external: true },
];

function Footer() {
  const linkStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 13,
    color: MUTED,
    textDecoration: "none",
    transition: "color 150ms",
  };

  return (
    <footer
      style={{
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        padding: "24px 0",
      }}
    >
      <div className="content-width">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Left */}
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: MUTED,
              fontWeight: 500,
            }}
          >
            Recall by VecLabs
          </span>

          {/* Center links */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {FOOTER_LINKS.map((l) => (
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
          </div>

          {/* Right */}
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: MUTED,
            }}
          >
            © 2026 VecLabs. MIT Licensed.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════ */
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 56, background: BG }}>
        <HeroSection />
        <StatsBar />
        <HowItWorksSection />
        <CodeExampleSection />
        <PricingSection />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
