"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LogoLockup } from "@/components/Logo";

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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{ borderBottom: "1px solid #E5E7EB" }}
    >
      <div className="mx-auto flex items-center justify-between py-3" style={{ maxWidth: 1100, padding: "12px 48px" }}>
        <LogoLockup markSize={28} uid="nav" />

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#benchmarks"
            className="text-sm transition-colors hover:text-[#0A0A0A]"
            style={{ color: "#6B7280", fontFamily: "var(--font-geist-sans)" }}
          >
            Benchmarks
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-[#0A0A0A]"
            style={{ color: "#6B7280", fontFamily: "var(--font-geist-sans)" }}
          >
            GitHub
          </a>
          <a
            href="https://docs.veclabs.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-[#0A0A0A]"
            style={{ color: "#6B7280", fontFamily: "var(--font-geist-sans)" }}
          >
            Docs
          </a>
          <button
            onClick={handleCopy}
            className="cursor-pointer transition-opacity hover:opacity-80"
            style={{
              background: "#FFFFFF",
              color: "#0A0A0A",
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 4,
              border: "1px solid #E5E7EB",
            }}
          >
            {copied ? "Copied" : "npm install @veclabs/solvec"}
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", padding: 8 }}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#0A0A0A">
            {menuOpen ? (
              <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
            ) : (
              <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="flex flex-col gap-4 px-6 pb-4 md:hidden"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <a href="#benchmarks" className="text-sm" style={{ color: "#6B7280" }}>
            Benchmarks
          </a>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm"
            style={{ color: "#6B7280" }}
          >
            GitHub
          </a>
          <a
            href="https://docs.veclabs.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm"
            style={{ color: "#6B7280" }}
          >
            Docs
          </a>
          <button
            onClick={handleCopy}
            className="cursor-pointer self-start"
            style={{
              background: "#FFFFFF",
              color: "#0A0A0A",
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 4,
              border: "1px solid #E5E7EB",
            }}
          >
            {copied ? "Copied" : "npm install @veclabs/solvec"}
          </button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center pt-20 pb-16" style={{ padding: "80px 48px 64px" }}>
      <p
        className="animate-fade-in stagger-1"
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 11,
          color: "#6B7280",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Vector Database · Solana Devnet Live · MIT Licensed
      </p>

      <h1
        className="animate-fade-in stagger-2 mt-6 text-center"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontWeight: 600,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.02em",
          color: "#0A0A0A",
          lineHeight: 1.1,
          maxWidth: 800,
        }}
      >
        The vector database
        <br />
        for AI agents that{" "}
        <span style={{ color: "#E8930A" }}>proves</span> what it remembers.
      </h1>

      <p
        className="animate-fade-in stagger-3 mt-6 text-center"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontWeight: 400,
          fontSize: 20,
          color: "#6B7280",
          maxWidth: 560,
          lineHeight: 1.6,
        }}
      >
        Rust HNSW core. Solana on-chain Merkle proof after every write.
        <br />
        4.3ms p99. 88% cheaper than Pinecone.
      </p>

      <div className="animate-fade-in stagger-4 mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#waitlist"
          style={{
            background: "#0A0A0A",
            color: "#FFFFFF",
            fontFamily: "var(--font-geist-sans)",
            fontWeight: 600,
            fontSize: 14,
            padding: "12px 24px",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Get Early Access →
        </a>
        <a
          href="https://github.com/veclabs/veclabs"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#FFFFFF",
            color: "#0A0A0A",
            fontFamily: "var(--font-geist-sans)",
            fontWeight: 600,
            fontSize: 14,
            padding: "12px 24px",
            borderRadius: 4,
            border: "1px solid #0A0A0A",
            textDecoration: "none",
          }}
        >
          View on GitHub →
        </a>
      </div>

      <div className="animate-fade-in stagger-5 mt-8 flex flex-wrap items-center justify-center gap-3">
        {["< 5ms p99", "Solana devnet live", "MIT licensed"].map((pill) => (
          <span
            key={pill}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              color: "#6B7280",
              border: "1px solid #E5E7EB",
              borderRadius: 4,
              padding: "6px 14px",
            }}
          >
            {pill}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AnimatedNumber — counts up when visible
   ═══════════════════════════════════════════════════════════════════════════════ */
function AnimatedNumber({
  value,
  suffix,
  isAmber,
}: {
  value: number;
  suffix: string;
  isAmber: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const duration = 800;
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay((value * eased).toFixed(1));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={ref}
      style={{
        fontFamily: "var(--font-geist-mono)",
        fontSize: 14,
        color: isAmber ? "#E8930A" : "#6B7280",
        fontWeight: isAmber ? 600 : 400,
      }}
    >
      {display}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Benchmarks
   ═══════════════════════════════════════════════════════════════════════════════ */
function Benchmarks() {
  const rows = [
    { label: "p50", veclabs: 1.9, pinecone: "~8ms", qdrant: "~4ms", weaviate: "~12ms" },
    { label: "p95", veclabs: 2.8, pinecone: "~15ms", qdrant: "~9ms", weaviate: "~25ms" },
    { label: "p99", veclabs: 4.3, pinecone: "~25ms", qdrant: "~15ms", weaviate: "~40ms" },
  ];

  return (
    <section id="benchmarks" className="section-container">
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 11,
          color: "#6B7280",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        Benchmarks
      </p>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["", "VecLabs", "Pinecone s1", "Qdrant", "Weaviate"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#6B7280",
                      fontWeight: 400,
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 14,
                    color: "#6B7280",
                    padding: "12px 16px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <AnimatedNumber
                    value={row.veclabs}
                    suffix="ms"
                    isAmber={true}
                  />
                </td>
                {[row.pinecone, row.qdrant, row.weaviate].map((v, i) => (
                  <td
                    key={i}
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: 14,
                      color: "#6B7280",
                      padding: "12px 16px",
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="mt-4"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: 12,
          color: "#6B7280",
        }}
      >
        Apple M2 · 16GB RAM · 100K vectors · 384 dimensions · top-10 ANN query
        ·{" "}
        <a
          href="https://github.com/veclabs/veclabs/tree/main/benchmarks"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6B7280", textDecoration: "underline" }}
        >
          methodology
        </a>
      </p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Code / Migration
   ═══════════════════════════════════════════════════════════════════════════════ */
const tsCode = `// Before — Pinecone
import { Pinecone } from '@pinecone-database/pinecone'
const pc = new Pinecone({ apiKey: 'YOUR_KEY' })
const index = pc.index('my-index')

// After — VecLabs (3 lines changed)
import { SolVec } from '@veclabs/solvec'
const sv = new SolVec({ network: 'mainnet-beta' })
const index = sv.collection('my-index')

// Everything below is identical
await index.upsert([{ id: 'vec_001', values: [...] }])
const results = await index.query({ vector: [...], topK: 10 })

// New — Pinecone has no equivalent
const proof = await index.verify()
console.log(proof.solanaExplorerUrl)`;

const pyCode = `# Before — Pinecone
from pinecone import Pinecone
pc = Pinecone(api_key="YOUR_KEY")
index = pc.Index("my-index")

# After — VecLabs (3 lines changed)
from solvec import SolVec
sv = SolVec(wallet="~/.config/solana/id.json")
index = sv.collection("my-index")

# Everything below is identical
index.upsert([{"id": "vec_001", "values": [...]}])
results = index.query(vector=[...], top_k=10)

# New — Pinecone has no equivalent
proof = index.verify()
print(proof.solana_explorer_url)`;

function highlightLine(line: string, lang: "ts" | "py") {
  const commentPrefix = lang === "ts" ? "//" : "#";
  if (line.startsWith(commentPrefix)) {
    return <span style={{ color: "#4B5563" }}>{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let remaining = line;
  let idx = 0;

  const stringRegex =
    lang === "ts"
      ? /(["'`])(?:(?!\1).)*\1/g
      : /(["'])(?:(?!\1).)*\1/g;

  let match;
  let lastIndex = 0;
  stringRegex.lastIndex = 0;

  while ((match = stringRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={idx++} style={{ color: "#9CA3AF" }}>
          {remaining.slice(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <span key={idx++} style={{ color: "#E8930A" }}>
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(
      <span key={idx++} style={{ color: "#9CA3AF" }}>
        {remaining.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

function CodeBlock({ code, lang }: { code: string; lang: "ts" | "py" }) {
  const [hovering, setHovering] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div
      className="relative"
      style={{
        background: "#0A0A0A",
        borderRadius: 6,
        padding: 24,
        overflow: "auto",
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 cursor-pointer"
          style={{
            background: "#1F2937",
            color: "#9CA3AF",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontFamily: "var(--font-geist-mono)",
            fontSize: 11,
          }}
        >
          {codeCopied ? "Copied" : "Copy"}
        </button>
      )}
      <pre style={{ margin: 0 }}>
        <code
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {code.split("\n").map((line, i) => (
            <div key={i}>{line === "" ? "\n" : highlightLine(line, lang)}</div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function CodeMigration() {
  const [tab, setTab] = useState<"ts" | "py">("ts");

  return (
    <section className="section-container">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 600,
              fontSize: "clamp(28px, 3vw, 36px)",
              letterSpacing: "-0.02em",
              color: "#0A0A0A",
              lineHeight: 1.2,
            }}
          >
            Migrate from Pinecone in 3 lines.
          </h2>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: 15,
              color: "#6B7280",
              lineHeight: 1.7,
            }}
          >
            The SolVec API is shaped to match Pinecone exactly. Change the
            import, the client, and the collection call. Every other line of
            your code stays identical.
          </p>
          <p
            className="mt-6"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 13,
              color: "#E8930A",
            }}
          >
            {"index.verify()  // new — Pinecone has no equivalent"}
          </p>
        </div>

        <div>
          <div className="mb-4 flex gap-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
            {(["ts", "py"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="cursor-pointer pb-2"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 12,
                  color: tab === t ? "#0A0A0A" : "#6B7280",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? "1px solid #0A0A0A" : "1px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t === "ts" ? "TypeScript" : "Python"}
              </button>
            ))}
          </div>
          <CodeBlock code={tab === "ts" ? tsCode : pyCode} lang={tab} />
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
      label: "Speed Layer",
      title: "Rust HNSW",
      body: "No garbage collector. No JVM pauses. No Python GIL. The query engine is pure Rust — insert, delete, and search run in the same process with zero serialization overhead.",
      stat: "4.3ms",
      statLabel: "p99 at 100K vectors",
      statColor: "#E8930A",
    },
    {
      label: "Storage Layer",
      title: "Shadow Drive",
      body: "Vectors are encrypted with AES-256-GCM using a key derived from your Solana wallet before leaving the SDK. VecLabs cannot read your data. Nobody can.",
      stat: "AES-256",
      statLabel: "GCM encryption",
      statColor: "#0A0A0A",
    },
    {
      label: "Trust Layer",
      title: "Solana",
      body: "After every write, a 32-byte SHA-256 Merkle root is posted on-chain. One transaction. $0.00025. 400ms finality. The root is permanent and public — anyone can verify it.",
      stat: "32B",
      statLabel: "Merkle root, on-chain",
      statColor: "#0A0A0A",
    },
  ];

  return (
    <section className="section-container">
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 11,
          color: "#6B7280",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        Architecture
      </p>

      <div
        className="grid md:grid-cols-3"
        style={{ border: "1px solid #E5E7EB", borderRadius: 6 }}
      >
        {cols.map((col, i) => (
          <div
            key={col.label}
            className="p-8"
            style={{
              borderRight:
                i < 2 ? "1px solid #E5E7EB" : "none",
              borderBottom: "none",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 10,
                color: "#6B7280",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {col.label}
            </p>
            <h3
              className="mt-3"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 600,
                fontSize: 20,
                color: "#0A0A0A",
              }}
            >
              {col.title}
            </h3>
            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 15,
                color: "#6B7280",
                lineHeight: 1.7,
              }}
            >
              {col.body}
            </p>
            <p
              className="mt-6"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 48,
                color: col.statColor,
                lineHeight: 1,
              }}
            >
              {col.stat}
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 11,
                color: "#6B7280",
              }}
            >
              {col.statLabel}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile stacking override: remove right borders on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .grid.md\\:grid-cols-3 > div {
            border-right: none !important;
            border-bottom: 1px solid #E5E7EB !important;
          }
          .grid.md\\:grid-cols-3 > div:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>

      <div
        className="mt-6 px-6 py-4"
        style={{
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 6,
        }}
      >
        <a
          href="https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 12,
            color: "#6B7280",
            textDecoration: "none",
          }}
          className="hover:underline"
        >
          Live on Solana devnet — Program:
          8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Comparison Table
   ═══════════════════════════════════════════════════════════════════════════════ */
function ComparisonTable() {
  const headers = ["", "VecLabs", "Pinecone", "Qdrant", "Weaviate"];
  const rows = [
    ["Query latency (p99)", "4.3ms", "~25ms", "~15ms", "~40ms"],
    ["Monthly cost (1M vectors)", "~$8", "$70", "$25+", "$25+"],
    ["Data ownership", "Your wallet", "Their servers", "Their servers", "Their servers"],
    ["On-chain audit trail", "Yes", "No", "No", "No"],
    ["Verifiable memory", "Yes", "No", "No", "No"],
    ["Open source", "Yes (MIT)", "No", "Yes", "Yes"],
    ["Vendor lock-in", "None", "High", "Medium", "Medium"],
  ];

  const renderCell = (value: string, colIdx: number) => {
    const isVecLabs = colIdx === 1;
    const isYes = value === "Yes" || value === "Yes (MIT)";
    const isNo = value === "No";

    let color = "#0A0A0A";
    if (isVecLabs && isYes) color = "#E8930A";
    else if (isNo) color = "#E5E7EB";
    else if (!isVecLabs) color = "#6B7280";

    return (
      <td
        key={colIdx}
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 13,
          color,
          padding: "12px 16px",
          borderBottom: "1px solid #E5E7EB",
          borderLeft: isVecLabs ? "1px solid #E8930A" : "none",
        }}
      >
        {value}
      </td>
    );
  };

  return (
    <section className="section-container">
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 11,
          color: "#6B7280",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        How VecLabs compares
      </p>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={h || "empty"}
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6B7280",
                    fontWeight: 400,
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid #E5E7EB",
                    borderLeft: i === 1 ? "1px solid #E8930A" : "none",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td
                  style={{
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: 14,
                    color: "#0A0A0A",
                    padding: "12px 16px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  {row[0]}
                </td>
                {row.slice(1).map((cell, i) => renderCell(cell, i + 1))}
              </tr>
            ))}
          </tbody>
        </table>
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
      eyebrow: "AI Agents",
      title: "LangChain · AutoGen · CrewAI",
      body: "Drop-in replacement for Pinecone in any agent framework. Your agent's memory is searchable in milliseconds and provably unmodified — verifiable by anyone.",
    },
    {
      eyebrow: "Enterprise AI",
      title: "Compliance & Auditability",
      body: "Healthcare, legal, and financial AI systems need proof of what the model knew and when. VecLabs provides immutable on-chain records that satisfy regulatory audit requirements.",
    },
    {
      eyebrow: "RAG Systems",
      title: "Retrieval-Augmented Generation",
      body: "Index your knowledge base once. Query it at Rust speed. Verify the index hasn't drifted or been tampered with before every generation call.",
    },
  ];

  return (
    <section className="section-container">
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.eyebrow}
            className="p-8"
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 6,
              background: "#FFFFFF",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 10,
                color: "#6B7280",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {card.eyebrow}
            </p>
            <h3
              className="mt-3"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 600,
                fontSize: 18,
                color: "#0A0A0A",
              }}
            >
              {card.title}
            </h3>
            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 15,
                color: "#6B7280",
                lineHeight: 1.7,
              }}
            >
              {card.body}
            </p>
          </div>
        ))}
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
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error — try again");
    }
  };

  return (
    <section
      id="waitlist"
      style={{ background: "#0A0A0A", padding: "96px 24px" }}
    >
      <div className="mx-auto max-w-xl text-center">
        <h2
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontWeight: 600,
            fontSize: "clamp(32px, 5vw, 48px)",
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          Get early access.
        </h2>
        <p
          className="mt-4"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: 18,
            color: "#6B7280",
            lineHeight: 1.6,
          }}
        >
          Free hosted tier for the first 500 developers.
          <br />
          No credit card. No Solana wallet required.
        </p>

        {submitted ? (
          <p
            className="mt-8"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            You&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                background: "#FFFFFF",
                color: "#0A0A0A",
                fontFamily: "var(--font-geist-sans)",
                fontSize: 15,
                padding: "12px 16px",
                border: "1px solid #0A0A0A",
                borderRadius: 4,
                width: "100%",
                maxWidth: 320,
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="cursor-pointer"
              style={{
                background: "#E8930A",
                color: "#0A0A0A",
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 600,
                fontSize: 14,
                padding: "12px 24px",
                border: "none",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              Request Access
            </button>
          </form>
        )}
        {error && (
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              color: "#EF4444",
            }}
          >
            {error}
          </p>
        )}

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 11,
            color: "#4B5563",
          }}
        >
          <span>Solana devnet live</span>
          <span>·</span>
          <span>@veclabs/solvec on npm</span>
          <span>·</span>
          <span>MIT licensed</span>
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
    <footer style={{ borderTop: "1px solid #E5E7EB" }}>
      <div className="section-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <LogoLockup markSize={28} uid="footer" />
          <div className="flex flex-wrap gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: 14,
                  color: "#6B7280",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 md:flex-row">
          <span
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            © 2026 VecLabs. MIT Licensed.
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            Built with Rust and Solana.
          </span>
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
    <main style={{ background: "#FFFFFF" }}>
      <Nav />
      <Hero />
      <Benchmarks />
      <CodeMigration />
      <Architecture />
      <ComparisonTable />
      <UseCases />
      <Waitlist />
      <Footer />
    </main>
  );
}
