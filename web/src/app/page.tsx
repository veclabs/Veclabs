"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { ParticleNetwork } from "@/components/ParticleNetwork";

/* ═══════════════════════════════════════════════════════════════════════════════
   Nav
   ═══════════════════════════════════════════════════════════════════════════════ */
function Nav() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const linkStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#8A8580",
    letterSpacing: "0.04em",
    textDecoration: "none" as const,
    transition: "color 150ms",
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "#000000",
        borderBottom: "1px solid #111111",
        height: 56,
      }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between"
        style={{ maxWidth: 1100, padding: "0 48px" }}
      >
        <LogoLockup markSize={24} uid="nav" dark />

        <div
          className="hidden items-center gap-8 md:flex"
          style={{ ...linkStyle }}
        >
          <a
            href="https://docs.veclabs.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:!text-[#F0EDE6]"
          >
            Docs
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:!text-[#F0EDE6]"
          >
            GitHub
          </a>
          <a href="#benchmarks" className="hover:!text-[#F0EDE6]">
            Benchmarks
          </a>
        </div>

        <button
          onClick={handleCopy}
          className={`cursor-pointer border-none transition-colors duration-150 nav-copy-btn ${copied ? "copied" : ""}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            background: copied ? undefined : "#F0EDE6",
            color: copied ? undefined : "#000000",
            padding: "8px 16px",
            borderRadius: 0,
          }}
        >
          {copied ? "copied ✓" : "npm install @veclabs/solvec"}
        </button>

        <button
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", padding: 8 }}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#F0EDE6">
            {menuOpen ? (
              <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
            ) : (
              <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          className="flex flex-col gap-4 px-6 pb-4 md:hidden"
          style={{ borderTop: "1px solid #111111", paddingTop: 16 }}
        >
          <a
            href="https://docs.veclabs.xyz/introduction"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, color: "#F0EDE6" }}
          >
            Docs
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, color: "#F0EDE6" }}
          >
            GitHub
          </a>
          <a href="#benchmarks" style={{ ...linkStyle, color: "#F0EDE6" }}>
            Benchmarks
          </a>
          <button
            onClick={handleCopy}
            className={`cursor-pointer self-start nav-copy-btn ${copied ? "copied" : ""}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              background: copied ? undefined : "#F0EDE6",
              color: copied ? undefined : "#000000",
              padding: "8px 16px",
              borderRadius: 0,
              border: "none",
            }}
          >
            {copied ? "copied ✓" : "npm install"}
          </button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Hero - count-up stats (from 0, 800ms, start 400ms)
   ═══════════════════════════════════════════════════════════════════════════════ */
function HeroStat({
  value,
  suffix,
  label,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(decimals ? "0.0" : "0");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const duration = 800;
    const delay = 400;
    const tick = (now: number) => {
      const elapsed = now - t0 - delay;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = value * eased;
      setDisplay(decimals ? v.toFixed(1) : String(Math.round(v)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, decimals]);

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 32,
          color: "#F0EDE6",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {display}
        {suffix}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "#8A8580",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Hero Terminal - right column, lines appear 80ms apart from 600ms
   ═══════════════════════════════════════════════════════════════════════════════ */
const TERMINAL_LINES = [
  { type: "prompt", text: "› npm install @veclabs/solvec" },
  { type: "output", text: "   added 1 package in 340ms" },
  { type: "blank" },
  { type: "prompt", text: "› node" },
  { type: "output", text: "Welcome to Node.js v22.0.0" },
  { type: "blank" },
  { type: "code", text: "const { SolVec } = require('@veclabs/solvec')" },
  { type: "code", text: "const sv = new SolVec({ network: 'devnet' })" },
  { type: "code", text: "const idx = sv.collection('agent-memory')" },
  { type: "blank" },
  { type: "code", text: "await idx.upsert([{ id: 'v1', values: [...] }])" },
  { type: "output", text: "✓ upserted  1.2ms" },
  { type: "blank" },
  { type: "code", text: "const proof = await idx.verify()" },
  { type: "output", text: "✓ merkle root posted" },
  { type: "output", text: "tx: 5uRtuNVhvhDZ...  0.2ms", tx: true },
];

function HeroTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const start = 600;
    const interval = 80;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < TERMINAL_LINES.length; i++) {
      timeouts.push(
        setTimeout(() => setVisibleCount(i + 1), start + i * interval),
      );
    }
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        background: "#080808",
        border: "1px solid #111111",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          height: 36,
          background: "#080808",
          borderBottom: "1px solid #111111",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#8A8580",
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#8A8580",
            letterSpacing: "0.1em",
          }}
        >
          veclabs - zsh
        </span>
      </div>
      <div
        style={{
          padding: 24,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => {
          if (line.type === "blank")
            return <div key={i} style={{ height: "1em" }} />;
          if (line.type === "prompt") {
            return (
              <div key={i}>
                <span style={{ color: "#2D7A45" }}>›</span>
                <span style={{ color: "#F0EDE6" }}>
                  {" "}
                  {line.text!.replace("› ", "")}
                </span>
              </div>
            );
          }
          if (line.type === "output") {
            const text = line.text!;
            const hasCheck = text.startsWith("✓");
            const isTx = "tx" in line && line.tx;
            if (isTx) {
              return (
                <div key={i}>
                  <span style={{ color: "#3A3A3A" }}>tx: </span>
                  <a
                    href="https://explorer.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2D7A45", cursor: "pointer" }}
                    title="View on Solana Explorer"
                  >
                    5uRtuNVhvhDZ... 0.2ms
                  </a>
                </div>
              );
            }
            return (
              <div key={i}>
                {hasCheck && <span style={{ color: "#2D7A45" }}>✓</span>}
                <span style={{ color: "#3A3A3A" }}>
                  {hasCheck ? text.slice(1) : text}
                </span>
              </div>
            );
          }
          return (
            <div key={i} style={{ color: "#F0EDE6" }}>
              {line.text}
            </div>
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "#8A8580",
          letterSpacing: "0.1em",
          paddingBottom: 12,
        }}
      >
        › veclabs · devnet · program: 8xjQ2XrdhR4JkGAd...
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      className="hero-padding"
      style={{
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="mx-auto flex w-full flex-col gap-12 md:flex-row md:items-center"
        style={{ maxWidth: 1100, gap: 80 }}
      >
        <div style={{ flex: "0 1 60%" }}>
          <p
            className="eyebrow animate-fade-in stagger-1"
            style={{ marginBottom: 24 }}
          >
            Vector Database · Solana Devnet Live · MIT Licensed
          </p>
          <h1
            className="animate-fade-in stagger-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: "clamp(36px, 4vw, 52px)",
              color: "#F0EDE6",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              maxWidth: 560,
              marginBottom: 24,
            }}
          >
            The database for AI agents that{" "}
            <span style={{ position: "relative" }}>
              proves
              <span
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "#2D7A45",
                }}
              />
            </span>{" "}
            what it remembers.
          </h1>
          <p
            className="animate-fade-in stagger-3"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 17,
              color: "#3A3A3A",
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 36,
            }}
          >
            Rust HNSW core. Solana on-chain Merkle proof after every write.
            4.7ms p99. 88% cheaper than Pinecone.
          </p>
          <div
            className="animate-fade-in stagger-4 flex flex-wrap gap-3"
            style={{ marginBottom: 48 }}
          >
            <a
              href="#waitlist"
              className="cursor-pointer transition-colors duration-150 hover:bg-[#2D7A45] hover:!text-[#F0EDE6]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.04em",
                background: "#F0EDE6",
                color: "#000000",
                padding: "12px 24px",
                borderRadius: 0,
                border: "none",
                textDecoration: "none",
              }}
            >
              Get Early Access →
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition-colors duration-150 hover:border-[#2D7A45] hover:!text-[#F0EDE6]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.04em",
                background: "transparent",
                color: "#3A3A3A",
                padding: "12px 24px",
                borderRadius: 0,
                border: "1px solid #8A8580",
                textDecoration: "none",
              }}
            >
              View on GitHub →
            </a>
          </div>
          <div
            className="animate-fade-in stagger-5 flex gap-10"
            style={{ paddingTop: 40, borderTop: "1px solid #111111" }}
          >
            <HeroStat
              value={4.7}
              suffix="ms"
              label="P99 · 100K VECTORS"
              decimals={1}
            />
            <HeroStat value={88} suffix="%" label="CHEAPER THAN PINECONE" />
            <HeroStat value={32} suffix="B" label="MERKLE ROOT ON-CHAIN" />
          </div>
        </div>
        <div className="animate-fade-in stagger-6" style={{ flex: "0 1 40%" }}>
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Benchmark stat box - count up when in viewport (IntersectionObserver, 600ms)
   ═══════════════════════════════════════════════════════════════════════════════ */
function BenchmarkBox({
  label,
  value,
  valueSuffix,
  pinecone,
  qdrant,
}: {
  label: string;
  value: number;
  valueSuffix: string;
  pinecone: string;
  qdrant: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        const start = performance.now();
        const duration = 600;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased * 10) / 10);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      style={{
        background: "#080808",
        border: "1px solid #111111",
        borderTop: "2px solid #2D7A45",
        padding: "32px 28px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "#8A8580",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 40,
          color: "#F0EDE6",
          letterSpacing: "-0.04em",
          marginTop: 8,
        }}
      >
        {display}
        {valueSuffix}
      </p>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "#8A8580",
        }}
      >
        <span>Pinecone {pinecone}</span>
        <span>·</span>
        <span>Qdrant {qdrant}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Benchmarks
   ═══════════════════════════════════════════════════════════════════════════════ */
function Benchmarks() {
  const boxes = [
    {
      label: "P50",
      value: 2.995,
      valueSuffix: "ms",
      pinecone: "~8ms",
      qdrant: "~4ms",
    },
    {
      label: "P95",
      value: 3.854,
      valueSuffix: "ms",
      pinecone: "~15ms",
      qdrant: "~9ms",
    },
    {
      label: "P99",
      value: 4.688,
      valueSuffix: "ms",
      pinecone: "~25ms",
      qdrant: "~15ms",
    },
    {
      label: "P99.9",
      value: 5.674,
      valueSuffix: "ms",
      pinecone: "~40ms",
      qdrant: "~28ms",
    },
  ];

  return (
    <section
      id="benchmarks"
      className="section-padding"
      style={{ background: "#000000", borderTop: "1px solid #111111" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <p className="eyebrow" style={{ marginBottom: 48 }}>
          BENCHMARKS · Apple M3 · 100K vectors · 1536 dimensions (OpenAI ada-002
          size) · 1,000 samples
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 2 }}>
          {boxes.map((b) => (
            <BenchmarkBox
              key={b.label}
              label={b.label}
              value={b.value}
              valueSuffix={b.valueSuffix}
              pinecone={b.pinecone}
              qdrant={b.qdrant}
            />
          ))}
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#8A8580",
            paddingTop: 16,
          }}
        >
          Methodology: github.com/veclabs/veclabs/benchmarks
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Migration / Code
   ═══════════════════════════════════════════════════════════════════════════════ */
const tsCode = `// Before - Pinecone
import { Pinecone } from '@pinecone-database/pinecone'
const pc = new Pinecone({ apiKey: 'YOUR_KEY' })
const index = pc.index('my-index')

// After - VecLabs (3 lines changed)
import { SolVec } from '@veclabs/solvec'
const sv = new SolVec({ network: 'mainnet-beta' })
const index = sv.collection('my-index')

// Everything below is identical
await index.upsert([{ id: 'vec_001', values: [...] }])
const results = await index.query({ vector: [...], topK: 10 })

// New - Pinecone has no equivalent
const proof = await index.verify()
console.log(proof.solanaExplorerUrl)`;

const pyCode = `# Before - Pinecone
from pinecone import Pinecone
pc = Pinecone(api_key="YOUR_KEY")
index = pc.Index("my-index")

# After - VecLabs (3 lines changed)
from solvec import SolVec
sv = SolVec(wallet="~/.config/solana/id.json")
index = sv.collection("my-index")

# Everything below is identical
index.upsert([{"id": "vec_001", "values": [...]}])
results = index.query(vector=[...], top_k=10)

# New - Pinecone has no equivalent
proof = index.verify()
print(proof.solana_explorer_url)`;

function highlightCodeLine(line: string, lang: "ts" | "py") {
  const commentPrefix = lang === "ts" ? "//" : "#";
  if (line.startsWith(commentPrefix)) {
    return <span style={{ color: "#2A2A2A" }}>{line}</span>;
  }
  const parts: React.ReactNode[] = [];
  let idx = 0;
  const stringRegex =
    lang === "ts" ? /(["'`])(?:(?!\1).)*\1/g : /(["'])(?:(?!\1).)*\1/g;
  let lastIndex = 0;
  let match;
  while ((match = stringRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      const slice = line.slice(lastIndex, match.index);
      const vIdx = slice.indexOf("verify()");
      if (vIdx >= 0) {
        parts.push(
          <span key={idx++} style={{ color: "#F0EDE6" }}>
            {slice.slice(0, vIdx)}
          </span>,
        );
        parts.push(
          <span key={idx++} style={{ color: "#4CAF72" }}>
            verify()
          </span>,
        );
        parts.push(
          <span key={idx++} style={{ color: "#F0EDE6" }}>
            {slice.slice(vIdx + 8)}
          </span>,
        );
      } else {
        parts.push(
          <span key={idx++} style={{ color: "#F0EDE6" }}>
            {slice}
          </span>,
        );
      }
    }
    parts.push(
      <span key={idx++} style={{ color: "#2D7A45" }}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    const slice = line.slice(lastIndex);
    const vIdx = slice.indexOf("verify()");
    if (vIdx >= 0) {
      parts.push(
        <span key={idx++} style={{ color: "#F0EDE6" }}>
          {slice.slice(0, vIdx)}
        </span>,
      );
      parts.push(
        <span key={idx++} style={{ color: "#4CAF72" }}>
          verify()
        </span>,
      );
      parts.push(
        <span key={idx++} style={{ color: "#F0EDE6" }}>
          {slice.slice(vIdx + 8)}
        </span>,
      );
    } else {
      parts.push(
        <span key={idx++} style={{ color: "#F0EDE6" }}>
          {slice}
        </span>,
      );
    }
  }
  return <>{parts}</>;
}

function CodeBlock({
  code,
  lang,
  filename,
}: {
  code: string;
  lang: "ts" | "py";
  filename: string;
}) {
  const [codeCopied, setCodeCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div style={{ border: "1px solid #111111", borderRadius: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#080808",
          borderBottom: "1px solid #111111",
          padding: "10px 16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#8A8580",
          }}
        >
          {filename}
        </span>
        <button
          onClick={handleCopy}
          className="code-copy-btn cursor-pointer transition-colors duration-150"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#8A8580",
            background: "none",
            border: "none",
          }}
        >
          {codeCopied ? "Copied" : "Copy"}
        </button>
      </div>
      <div style={{ background: "#000000", padding: 24 }}>
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          {code.split("\n").map((l, i) => (
            <div key={i}>{l ? highlightCodeLine(l, lang) : "\n"}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function CodeMigration() {
  const [tab, setTab] = useState<"ts" | "py">("ts");

  return (
    <section
      className="section-padding"
      style={{ background: "#080808", borderTop: "1px solid #111111" }}
    >
      <div
        className="mx-auto grid gap-16 md:grid-cols-[0.45fr_0.55fr]"
        style={{ maxWidth: 1100 }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>
            MIGRATION
          </p>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 36,
              color: "#F0EDE6",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Migrate from Pinecone in 3 lines.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              color: "#3A3A3A",
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            The SolVec API is shaped to match Pinecone exactly. Change the
            import, the client, and the collection call. Every other line of
            your code stays identical.
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "#2D7A45",
            }}
          >
            index.verify() // Pinecone has no equivalent
          </p>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              height: 40,
              background: "#080808",
              borderBottom: "1px solid #111111",
            }}
          >
            {(["ts", "py"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  color: tab === t ? "#F0EDE6" : "#8A8580",
                  background: "none",
                  border: "none",
                  borderBottom:
                    tab === t ? "1px solid #F0EDE6" : "1px solid transparent",
                  padding: "0 16px",
                  marginBottom: -1,
                }}
              >
                {t === "ts" ? "TypeScript" : "Python"}
              </button>
            ))}
          </div>
          <CodeBlock
            code={tab === "ts" ? tsCode : pyCode}
            lang={tab}
            filename={tab === "ts" ? "migrate.ts" : "migrate.py"}
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Architecture
   ═══════════════════════════════════════════════════════════════════════════════ */
function Architecture() {
  const cols = [
    {
      label: "SPEED LAYER",
      title: "Rust HNSW",
      body: "No garbage collector. No JVM pauses. No Python GIL. Vectors stay in memory. Queries never touch disk.",
      stat: "4.7ms",
      statLabel: "P99 AT 100K VECTORS",
    },
    {
      label: "STORAGE LAYER",
      title: "Shadow Drive",
      body: "Encrypted with AES-256-GCM using a key derived from your Solana wallet before leaving the SDK. VecLabs cannot read your data.",
      stat: "AES-256",
      statLabel: "GCM ENCRYPTION",
    },
    {
      label: "TRUST LAYER",
      title: "Solana",
      body: "After every write, a 32-byte SHA-256 Merkle root is posted on-chain. One transaction. $0.00025. 400ms finality. Permanent. Public.",
      stat: "32B",
      statLabel: "MERKLE ROOT ON-CHAIN",
    },
  ];

  return (
    <section
      className="section-padding"
      style={{ background: "#000000", borderTop: "1px solid #111111" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <p className="eyebrow" style={{ marginBottom: 48 }}>
          ARCHITECTURE
        </p>
        <div className="grid md:grid-cols-3" style={{ gap: 0 }}>
          {cols.map((col) => (
            <div
              key={col.label}
              className="arch-card"
              style={{
                background: "#080808",
                border: "1px solid #111111",
                borderTop: "2px solid #111111",
                padding: "40px 36px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "#8A8580",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {col.label}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  fontSize: 22,
                  color: "#F0EDE6",
                  letterSpacing: "-0.01em",
                  margin: "12px 0",
                }}
              >
                {col.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "#3A3A3A",
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                {col.body}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 48,
                  color: "#F0EDE6",
                  letterSpacing: "-0.04em",
                  display: "block",
                }}
              >
                {col.stat}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "#8A8580",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {col.statLabel}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "#080808",
            border: "1px solid #111111",
            padding: "16px 32px",
            marginTop: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#8A8580",
              letterSpacing: "0.04em",
            }}
          >
            Live on Solana devnet
          </span>
          <a
            href="https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="solana-program-addr transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#2D7A45",
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Demo section - live demo CTA + mock chat preview
   ═══════════════════════════════════════════════════════════════════════════════ */
function Demo() {
  return (
    <section
      id="demo"
      className="section-padding"
      style={{ background: "#080808", borderTop: "1px solid #111111" }}
    >
      <div
        className="mx-auto grid gap-16 md:grid-cols-[0.45fr_0.55fr] md:gap-16"
        style={{ maxWidth: 1100, gap: 64, alignItems: "center" }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>
            LIVE DEMO
          </p>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 36,
              color: "#F0EDE6",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Agent memory demo.
            <br />
            Live on devnet.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              color: "#3A3A3A",
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            Type a message to the agent. It stores your message as a vector,
            retrieves semantically similar past messages, and posts a Merkle
            root to Solana after every write. Memory resets on server restart.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Vector stored in <4ms",
              "Merkle root posted on-chain after every upsert",
              "Solana Explorer link returned per message",
            ].map((text) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "#3A3A3A",
                }}
              >
                <span style={{ color: "#2D7A45", fontSize: 14 }}>›</span>
                {text}
              </div>
            ))}
          </div>
          <Link
            href="https://demo.veclabs.xyz"
            className="inline-block transition-colors duration-150 hover:bg-[#2D7A45] hover:text-[#F0EDE6]"
            style={{
              marginTop: 32,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "#F0EDE6",
              color: "#000",
              padding: "12px 24px",
              border: "none",
              borderRadius: 0,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Try the Demo →
          </Link>
        </div>

        {/* Mock chat preview */}
        <div
          style={{
            border: "1px solid #111111",
            background: "#000000",
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 40,
              background: "#080808",
              borderBottom: "1px solid #111111",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#1A1A1A",
              }}
            >
              agent-memory · devnet
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#2D7A45",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#2D7A45",
                }}
              >
                live
              </span>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "#000000",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                height: 280,
                overflow: "hidden",
              }}
            >
              {/* Message 1 - user */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    background: "#0D0D0D",
                    border: "1px solid #111111",
                    padding: "10px 14px",
                    maxWidth: "80%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "#F0EDE6",
                    lineHeight: 1.6,
                  }}
                >
                  What is the capital of France?
                </div>
              </div>

              {/* Message 2 - agent */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "#1A1A1A",
                    marginBottom: 4,
                  }}
                >
                  agent
                </span>
                <div
                  style={{
                    background: "#080808",
                    border: "1px solid #111111",
                    padding: "10px 14px",
                    maxWidth: "85%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "#3A3A3A" }}>
                    Paris is the capital of France.
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                      borderTop: "1px solid #111111",
                      paddingTop: 8,
                    }}
                  >
                    <span style={{ color: "#2D7A45" }}>✓ stored</span>
                    <span style={{ color: "#1A1A1A" }}>·</span>
                    <span style={{ color: "#1A1A1A" }}>merkle: 5uRtu...</span>
                    <span style={{ color: "#1A1A1A" }}>·</span>
                    <span style={{ color: "#1A1A1A" }}>1.2ms</span>
                  </div>
                </div>
              </div>

              {/* Message 3 - user */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    background: "#0D0D0D",
                    border: "1px solid #111111",
                    padding: "10px 14px",
                    maxWidth: "80%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "#F0EDE6",
                    lineHeight: 1.6,
                  }}
                >
                  What did I just ask about?
                </div>
              </div>

              {/* Message 4 - agent */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "#1A1A1A",
                    marginBottom: 4,
                  }}
                >
                  agent
                </span>
                <div
                  style={{
                    background: "#080808",
                    border: "1px solid #111111",
                    padding: "10px 14px",
                    maxWidth: "85%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "#3A3A3A" }}>
                    You asked about the capital of France. Recalled from memory
                    with 0.94 similarity.
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                      borderTop: "1px solid #111111",
                      paddingTop: 8,
                    }}
                  >
                    <span style={{ color: "#2D7A45" }}>✓ recalled</span>
                    <span style={{ color: "#1A1A1A" }}>·</span>
                    <span style={{ color: "#1A1A1A" }}>similarity: 0.94</span>
                    <span style={{ color: "#1A1A1A" }}>·</span>
                    <span style={{ color: "#1A1A1A" }}>2.1ms</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                background: "linear-gradient(to bottom, transparent, #000000)",
                pointerEvents: "none",
              }}
            />
          </div>

          <div
            style={{
              background: "#080808",
              borderTop: "1px solid #111111",
              padding: "12px 16px",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              readOnly
              placeholder="Type a message..."
              style={{
                background: "#000",
                border: "1px solid #111111",
                color: "#3A3A3A",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "8px 12px",
                flex: 1,
                outline: "none",
              }}
            />
            <button
              type="button"
              disabled
              style={{
                background: "#F0EDE6",
                color: "#000",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "8px 14px",
                border: "none",
                cursor: "default",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Comparison Table
   ═══════════════════════════════════════════════════════════════════════════════ */
function ComparisonTable() {
  const headers = ["Feature", "VecLabs", "Pinecone", "Qdrant", "Weaviate"];
  const rows = [
    ["Query latency (p99)", "4.7ms", "~25ms", "~15ms", "~40ms"],
    ["Monthly cost (1M vecs)", "~$20", "$70", "$25+", "$25+"],
    ["Data ownership", "Your wallet", "Their server", "Their srv", "Their srv"],
    ["On-chain audit trail", "Yes", "No", "No", "No"],
    ["Verifiable memory", "Yes", "No", "No", "No"],
    ["Open source", "MIT", "No", "Yes", "Yes"],
    ["Vendor lock-in", "None", "High", "Medium", "Medium"],
  ];

  return (
    <section
      className="section-padding"
      style={{ background: "#080808", borderTop: "1px solid #111111" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <p className="eyebrow" style={{ marginBottom: 48 }}>
          COMPARISON
        </p>
        <div
          className="overflow-x-auto"
          style={{ border: "1px solid #111111" }}
        >
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#000000" }}>
                {headers.map((h, i) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: i === 1 ? "#F0EDE6" : "#8A8580",
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #111111",
                      borderTop: i === 1 ? "2px solid #2D7A45" : "none",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row[0]}
                  className="comparison-row"
                  style={{ transition: "background 150ms" }}
                >
                  <td
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      color: "#3A3A3A",
                      padding: "16px",
                      borderBottom: "1px solid #111111",
                      height: 52,
                    }}
                  >
                    {row[0]}
                  </td>
                  {row.slice(1).map((cell, i) => {
                    const isVecLabs = i === 0;
                    const isNo = cell === "No";
                    const color = isNo
                      ? "#161616"
                      : isVecLabs
                        ? "#F0EDE6"
                        : "#2A2A2A";
                    return (
                      <td
                        key={i}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          color,
                          fontWeight: isVecLabs ? 500 : 400,
                          padding: "16px",
                          borderBottom: "1px solid #111111",
                          height: 52,
                        }}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Use Cases
   ═══════════════════════════════════════════════════════════════════════════════ */
function UseCases() {
  const cards = [
    {
      eyebrow: "AI AGENTS",
      title: "LangChain · AutoGen · CrewAI",
      body: "Drop-in replacement for Pinecone in any agent framework. Searchable in milliseconds and provably unmodified.",
    },
    {
      eyebrow: "ENTERPRISE AI",
      title: "Compliance & Auditability",
      body: "Healthcare, legal, and financial AI systems need proof of what the model knew and when. Immutable on-chain records satisfy regulatory audit requirements.",
    },
    {
      eyebrow: "RAG SYSTEMS",
      title: "Retrieval-Augmented Generation",
      body: "Index your knowledge base once. Query at Rust speed. Verify the index hasn't drifted before every generation call.",
    },
  ];

  return (
    <section
      className="section-padding"
      style={{ background: "#000000", borderTop: "1px solid #111111" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <p className="eyebrow" style={{ marginBottom: 48 }}>
          USE CASES
        </p>
        <div className="grid md:grid-cols-3" style={{ gap: 0 }}>
          {cards.map((card) => (
            <div
              key={card.eyebrow}
              className="use-case-card"
              style={{
                background: "#080808",
                border: "1px solid #111111",
                padding: "36px 32px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "#2D7A45",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {card.eyebrow}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  fontSize: 18,
                  color: "#F0EDE6",
                  letterSpacing: "-0.01em",
                  margin: "10px 0 14px",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "#3A3A3A",
                  lineHeight: 1.7,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Waitlist
   ═══════════════════════════════════════════════════════════════════════════════ */
function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
      else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error - try again");
    }
  };

  return (
    <section
      id="waitlist"
      className="section-padding"
      style={{ background: "#080808", borderTop: "1px solid #2D7A45" }}
    >
      <div
        className="mx-auto grid gap-16 md:grid-cols-2 md:gap-20"
        style={{ maxWidth: 1100 }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>
            EARLY ACCESS
          </p>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 42,
              color: "#F0EDE6",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Get early access.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              color: "#3A3A3A",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Free hosted tier for the first 500 developers. No credit card. No
            Solana wallet required.
          </p>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#8A8580",
              letterSpacing: "0.02em",
            }}
          >
            <p>
              <span style={{ color: "#2D7A45" }}>›</span> Solana devnet live
              today
            </p>
            <p>
              <span style={{ color: "#2D7A45" }}>›</span> @veclabs/solvec on npm
            </p>
            <p>
              <span style={{ color: "#2D7A45" }}>›</span> MIT licensed
            </p>
          </div>
        </div>
        <div>
          {submitted ? (
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  color: "#F0EDE6",
                  marginBottom: 8,
                }}
              >
                You&apos;re on the list.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "#8A8580",
                }}
              >
                We&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                className="waitlist-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  background: "#000000",
                  border: "1px solid #8A8580",
                  color: "#F0EDE6",
                  padding: "14px 16px",
                  borderRadius: 0,
                  outline: "none",
                  width: "100%",
                }}
              />
              <button
                type="submit"
                className="cursor-pointer transition-colors duration-150 hover:bg-[#2D7A45] hover:!text-[#F0EDE6]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "#F0EDE6",
                  color: "#000000",
                  padding: 14,
                  border: "none",
                  borderRadius: 0,
                }}
              >
                REQUEST ACCESS →
              </button>
            </form>
          )}
          {error && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#EF4444",
                marginTop: 8,
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════════════════════ */
function Footer() {
  const links = [
    { label: "GitHub", href: "https://github.com/veclabs/veclabs" },
    { label: "npm", href: "https://www.npmjs.com/package/@veclabs/solvec" },
    { label: "PyPI", href: "https://pypi.org/project/solvec/" },
    { label: "Discord", href: "https://discord.gg/veclabs" },
    { label: "Twitter", href: "https://x.com/veclabs" },
  ];

  return (
    <footer
      style={{
        background: "#000000",
        borderTop: "1px solid #111111",
        padding: "40px 48px",
      }}
    >
      <div className="mx-auto flex flex-col gap-8" style={{ maxWidth: 1100 }}>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <LogoLockup markSize={18} uid="footer" dark />
          <div
            className="flex flex-wrap gap-7"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "#8A8580",
            }}
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link transition-colors duration-150"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div
          className="flex flex-col justify-between gap-2 md:flex-row"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#8A8580",
          }}
        >
          <span>© 2026 VecLabs. MIT Licensed.</span>
          <span>Built with Rust and Solana.</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <ParticleNetwork />
      <main
        style={{ background: "transparent", position: "relative", zIndex: 1 }}
      >
        <Nav />
        <Hero />
        <Benchmarks />
        <CodeMigration />
        <Architecture />
        <Demo />
        <ComparisonTable />
        <UseCases />
        <Waitlist />
        <Footer />
      </main>
    </>
  );
}
