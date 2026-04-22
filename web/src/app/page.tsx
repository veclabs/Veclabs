"use client";

/* ═══════════════════════════════════════════════════════════════════
   VecLabs · Recall landing
   Editorial-dark / burnt-copper aesthetic · single-file React page
   ═══════════════════════════════════════════════════════════════════ */

import { useEffect, useState, type CSSProperties } from "react";

/* ─── Design tokens (mirror globals.css) ─────────────────────────── */
const BG       = "var(--bg)";
const BG2      = "var(--bg-2)";
const PAPER    = "var(--paper)";
const INK      = "var(--text)";
const INK_DIM  = "var(--text-muted)";
const INK_F    = "var(--text-dim)";
const RULE     = "var(--border)";
const RULE_HI  = "var(--border-light)";
const COPPER   = "var(--accent)";
const MONO     = "var(--font-mono)";
const SERIF    = "var(--font-serif)";

const SHELL: CSSProperties = {
  maxWidth: "var(--maxw)",
  margin: "0 auto",
  padding: "0 var(--gutter)",
};

/* ═══════════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════════ */
function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(11, 10, 7, 0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${RULE}`,
      }}
    >
      <div
        style={{
          ...SHELL,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: INK,
            fontFamily: MONO,
          }}
        >
          <BrandMark size={22} />
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.06em" }}>VECLABS</span>
          <span style={{ color: INK_F, margin: "0 2px" }}>//</span>
          <span style={{ color: INK_DIM, fontSize: 11, letterSpacing: "0.08em" }}>RECALL</span>
        </a>

        <nav
          className="vec-primary-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontFamily: MONO,
            fontSize: 11.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <NavLink href="#thesis">Thesis</NavLink>
          <NavLink href="#arch">Architecture</NavLink>
          <NavLink href="#sdk">SDK</NavLink>
          <NavLink href="#compare">Compare</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <a
            href="https://app.veclabs.xyz/register"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: `1px solid ${RULE_HI}`,
              padding: "8px 14px",
              color: INK,
            }}
          >
            Get API Key ↗
          </a>
        </nav>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .vec-primary-nav a:not([data-cta]) { display: none; }
        }
      `}</style>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        color: INK_DIM,
        transition: "color .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
      onMouseLeave={(e) => (e.currentTarget.style.color = INK_DIM)}
    >
      {children}
    </a>
  );
}

function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx={16} cy={16} r={15} fill="none" stroke={COPPER} strokeWidth={1} />
      <path d="M16 2 L16 30 M2 16 L30 16" stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
      <path d="M8 8 L24 24 M24 8 L8 24"  stroke="currentColor" strokeWidth={0.6} opacity={0.3} />
      <circle cx={16} cy={16} r={3} fill={COPPER} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SYSBAR
═══════════════════════════════════════════════════════════════════ */
function SysBar() {
  return (
    <div style={SHELL}>
      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: INK_F,
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <span className="sys-col">VEC-01 / LIVE SPEC</span>
        <span className="sys-col">BUILD 0.1.0-α.9</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: INK_DIM }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COPPER,
              animation: "vec-pulse 2s infinite",
            }}
          />
          Anchor{" "}
          <span style={{ color: INK_DIM, marginLeft: 6 }}>8xjQ2X…Vn5nP</span>{" "}
          operational
        </span>
        <span className="sys-col">4.7 MS P99</span>
        <span className="sys-col">§ APR · MMXXVI</span>

        <style>{`
          @media (max-width: 680px) { .sys-col { display: none; } }
        `}</style>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BUTTONS
═══════════════════════════════════════════════════════════════════ */
const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
  fontFamily: MONO,
  fontSize: 11.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "14px 22px",
  border: `1px solid ${RULE_HI}`,
  transition: "all .2s ease",
};
const btnPrimary: CSSProperties = {
  ...btnBase,
  background: COPPER,
  color: BG,
  borderColor: COPPER,
};
const btnGhost: CSSProperties = {
  ...btnBase,
  color: INK,
  background: "transparent",
};

/* ═══════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{ padding: "72px 0 88px", borderBottom: `1px solid ${RULE}` }}>
      <div style={SHELL}>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 0.55fr)",
            gap: 56,
            alignItems: "start",
            animation: "vec-rise .7s cubic-bezier(.2,.7,.2,1) both",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: INK_DIM,
                marginBottom: 28,
              }}
            >
              <span style={{ width: 24, height: 1, background: COPPER }} />
              Cryptographic Memory Layer · For AI Agents
            </div>

            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(40px, 6.2vw, 88px)",
                lineHeight: 0.98,
                letterSpacing: "-0.015em",
                color: PAPER,
                margin: "0 0 32px",
              }}
            >
              The blockchain isn&rsquo;t just a{" "}
              <em style={{ fontStyle: "italic", color: COPPER }}>trust</em> layer.
              <br />
              It&rsquo;s the{" "}
              <em style={{ fontStyle: "italic", color: COPPER }}>full stack</em> —
              <br />
              storage, verification, and proof.
            </h1>

            <p
              style={{
                fontFamily: MONO,
                fontSize: 14,
                lineHeight: 1.65,
                color: INK_DIM,
                maxWidth: "58ch",
                margin: "0 0 40px",
              }}
            >
              <span style={{ color: INK }}>Recall</span> is a Rust-native
              vector database with cryptographic memory proofs. Every write is
              client-side encrypted with AES-256-GCM, persisted to Shadow Drive,
              and Merkle-rooted to a Solana Anchor program — so your
              agent&rsquo;s memory is{" "}
              <span style={{ color: INK }}>yours</span>, auditable, and
              tamper-evident by construction.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="#start" style={btnPrimary}>
                Start building <span>→</span>
              </a>
              <a href="#arch" style={btnGhost}>
                Read the spec <span>↗</span>
              </a>
            </div>
          </div>

          <HeroPanel />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO LIVE PANEL
═══════════════════════════════════════════════════════════════════ */
interface LogLine {
  t: string;
  hex: string;
  col: string;
  ok: boolean;
}

function HeroPanel() {
  const [lines, setLines] = useState<LogLine[]>([
    { t: "+00.000s", hex: "0x7a3f…e8b2", col: "agent/memory", ok: true },
    { t: "+00.142s", hex: "0xc4d1…a915", col: "agent/tools",  ok: true },
    { t: "+00.318s", hex: "0x2e8b…f372", col: "user/ctx",     ok: true },
    { t: "+00.501s", hex: "0x9fa0…d4c6", col: "agent/memory", ok: true },
    { t: "+00.674s", hex: "0x1b5c…002f", col: "tamper test",  ok: false },
    { t: "+00.890s", hex: "0xf002…ab83", col: "agent/memory", ok: true },
  ]);

  useEffect(() => {
    const colls = ["agent/memory", "agent/tools", "user/ctx", "agent/plan", "session/state"];
    const hx = () => Math.floor(Math.random() * 16).toString(16);
    const makeHex = () =>
      "0x" +
      Array.from({ length: 4 }, () => hx() + hx() + hx() + hx()).join("").slice(0, 4) +
      "…" +
      Array.from({ length: 2 }, () => hx() + hx()).join("");

    let t = 0.89;
    const id = setInterval(() => {
      t += 0.1 + Math.random() * 0.4;
      const ok = Math.random() > 0.12;
      setLines((prev) =>
        [
          {
            t: `+${t.toFixed(3)}s`,
            hex: makeHex(),
            col: colls[Math.floor(Math.random() * colls.length)],
            ok,
          },
          ...prev,
        ].slice(0, 6)
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        border: `1px solid ${RULE_HI}`,
        background:
          "linear-gradient(180deg, rgba(244, 239, 226, 0.015), rgba(244, 239, 226, 0.005))",
      }}
    >
      {/* head */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: `1px solid ${RULE}`,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INK_F,
        }}
      >
        <span>recall · live writes</span>
        <span style={{ display: "flex", gap: 6 }}>
          <Dot />
          <Dot />
          <Dot live />
        </span>
      </div>

      {/* feed */}
      <div style={{ padding: "16px 14px" }}>
        {lines.map((l, i) => (
          <div
            key={`${l.hex}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr auto",
              gap: 12,
              padding: "6px 0",
              borderBottom: i === lines.length - 1 ? "none" : `1px dashed ${RULE}`,
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 11.5,
              opacity: i < 4 ? 1 : i === 4 ? 0.6 : 0.3,
            }}
          >
            <span style={{ color: INK_F }}>{l.t}</span>
            <span
              style={{
                color: INK,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {l.hex} · {l.col}
            </span>
            <span
              style={{
                color: l.ok ? COPPER : "#8A857B",
                letterSpacing: "0.08em",
                fontSize: 10,
                textTransform: "uppercase",
              }}
            >
              {l.ok ? "verified" : "rejected"}
            </span>
          </div>
        ))}
      </div>

      {/* merkle tree */}
      <div style={{ padding: "22px 14px 14px", borderTop: `1px solid ${RULE}` }}>
        <svg viewBox="0 0 400 140" fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx={200} cy={16} r={5} fill={COPPER} />
          <text x={200} y={10} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={8} fill={COPPER}>
            ROOT
          </text>
          <line x1={200} y1={16} x2={100} y2={60} stroke={RULE_HI} strokeWidth={1} />
          <line x1={200} y1={16} x2={300} y2={60} stroke={RULE_HI} strokeWidth={1} />
          <circle cx={100} cy={60} r={4} fill={INK_DIM} />
          <circle cx={300} cy={60} r={4} fill={INK_DIM} />
          <line x1={100} y1={60} x2={50}  y2={100} stroke={RULE_HI} strokeWidth={1} />
          <line x1={100} y1={60} x2={150} y2={100} stroke={RULE_HI} strokeWidth={1} />
          <line x1={300} y1={60} x2={250} y2={100} stroke={RULE_HI} strokeWidth={1} />
          <line x1={300} y1={60} x2={350} y2={100} stroke={RULE_HI} strokeWidth={1} />
          <circle cx={50}  cy={100} r={3} fill={INK_F} />
          <circle cx={150} cy={100} r={3} fill={INK_F} />
          <circle cx={250} cy={100} r={3} fill={INK_F} />
          <circle cx={350} cy={100} r={3} fill={INK_F} />
          {["h₀", "h₁", "h₂", "h₃"].map((h, i) => (
            <text
              key={h}
              x={50 + i * 100}
              y={124}
              textAnchor="middle"
              fontFamily="JetBrains Mono"
              fontSize={7}
              fill={INK_F}
            >
              {h}
            </text>
          ))}
          <text
            x={200}
            y={138}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={7}
            fill={INK_F}
            letterSpacing={2}
          >
            MERKLE · SHA-256
          </text>
        </svg>
      </div>

      {/* foot */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${RULE}`,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: INK_F,
        }}
      >
        <span>Fig. 01 · Write-verification flow</span>
        <span>
          Slot <span style={{ color: COPPER }}>287,934,512</span>
        </span>
      </div>
    </div>
  );
}

function Dot({ live = false }: { live?: boolean }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: live ? COPPER : RULE_HI,
        display: "inline-block",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════════════════════════════ */
function Marquee() {
  const item = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 48 }}>
      Rust-Native HNSW &nbsp;·&nbsp;{" "}
      <em style={{ color: COPPER, fontStyle: "normal" }}>AES-256-GCM</em>{" "}
      &nbsp;·&nbsp; Shadow Drive &nbsp;·&nbsp; Solana Anchor &nbsp;·&nbsp;{" "}
      <em style={{ color: COPPER, fontStyle: "normal" }}>Merkle-Rooted Writes</em>{" "}
      &nbsp;·&nbsp; Client-Side Encryption &nbsp;·&nbsp; Open-Source Core &nbsp;·&nbsp;{" "}
      <em style={{ color: COPPER, fontStyle: "normal" }}>SDKs in TS + Python</em>{" "}
      &nbsp;·&nbsp; Sovereign Memory &nbsp;·&nbsp;&nbsp;&nbsp;
    </span>
  );
  return (
    <div style={{ borderBottom: `1px solid ${RULE}`, overflow: "hidden", padding: "14px 0" }}>
      <div
        style={{
          display: "flex",
          gap: 48,
          whiteSpace: "nowrap",
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: INK_F,
          animation: "vec-marquee 44s linear infinite",
        }}
      >
        {item}
        {item}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEAD
═══════════════════════════════════════════════════════════════════ */
function SectionHead({
  mark,
  label,
  title,
  sub,
}: {
  mark: string;
  label: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div
      className="section-head"
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 40,
        marginBottom: 56,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: INK_F,
          paddingTop: 12,
          borderTop: `1px solid ${RULE_HI}`,
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 36,
            color: INK,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {mark}
        </span>
        {label}
      </div>
      <div>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(30px, 3.8vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: PAPER,
            margin: "0 0 12px",
          }}
        >
          {title}
        </h2>
        {sub ? (
          <p style={{ fontFamily: MONO, fontSize: 13, color: INK_DIM, maxWidth: "62ch", margin: 0 }}>
            {sub}
          </p>
        ) : null}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .section-head { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
      `}</style>
    </div>
  );
}

const sectionStyle: CSSProperties = {
  padding: "104px 0",
  borderBottom: `1px solid ${RULE}`,
};

/* ═══════════════════════════════════════════════════════════════════
   THESIS
═══════════════════════════════════════════════════════════════════ */
function Thesis() {
  return (
    <section id="thesis" style={sectionStyle}>
      <div style={SHELL}>
        <SectionHead
          mark="§ I"
          label="Thesis"
          title={
            <>
              AI agents have amnesia.
              <br />
              <em style={{ fontStyle: "italic", color: COPPER }}>
                We gave them a spine.
              </em>
            </>
          }
          sub="Today's agents either lose everything between sessions or hand their memory to a vendor that owns it. Neither is acceptable for software meant to remember on your behalf."
        />

        <p
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(26px, 3.2vw, 44px)",
            lineHeight: 1.18,
            color: PAPER,
            margin: "0 0 56px",
            letterSpacing: "-0.005em",
          }}
        >
          Most &ldquo;Web3 memory&rdquo; projects write embeddings onchain —
          which is slow, expensive, and structurally wrong. Shadow Drive handles
          storage.{" "}
          <em style={{ fontStyle: "italic", color: COPPER }}>
            The Anchor program handles proof.
          </em>{" "}
          Hot reads live in cache. Each layer does exactly one job well.
        </p>

        <div
          className="thesis-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            ["01 · Sovereignty", "Keys are derived from your Solana wallet. If you lose us, you don't lose your memory."],
            ["02 · Verifiability", "Every write produces a SHA-256 leaf. Every batch produces a root. Every root lives on Solana."],
            ["03 · Speed, still", "A Rust HNSW index under everything. 4.7ms P99 at 100K vectors. Trust doesn't have to be slow."],
          ].map(([k, v]) => (
            <div key={k} style={{ borderTop: `1px solid ${RULE_HI}`, padding: "22px 0 0" }}>
              <h4
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: INK_F,
                  margin: "0 0 18px",
                }}
              >
                {k}
              </h4>
              <p style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.35, color: INK, margin: 0 }}>
                {v}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 900px) {
            .thesis-cards { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ARCHITECTURE
═══════════════════════════════════════════════════════════════════ */
function Architecture() {
  const layers: Array<[string, string, string, string]> = [
    ["01", "HNSW Graph Index", "Rust-native hierarchical navigable small-world graph. In-memory top, disk-paged tail. Billion-scale queries in single-digit ms.", "Speed"],
    ["02", "AES-256-GCM · Client-Side", "Vectors and payloads are encrypted before they leave your process, with keys derived from your Solana keypair. We never see plaintext.", "Encryption"],
    ["03", "Shadow Drive", "Decentralized object storage on Solana's storage protocol is the source of truth. Redis sits in front as a hot read cache — not the database.", "Storage"],
    ["04", "Solana Anchor Program", "Merkle roots of every write batch are committed to an Anchor program. Anyone, anywhere, can verify memory integrity with a signature.", "Trust"],
  ];

  return (
    <section id="arch" style={sectionStyle}>
      <div style={SHELL}>
        <SectionHead
          mark="§ II"
          label="Architecture"
          title={
            <>
              Four layers.
              <br />
              <em style={{ fontStyle: "italic", color: COPPER }}>One contract.</em>
            </>
          }
          sub="Each layer is independently replaceable, independently auditable, and does exactly one thing. Compose them, run them yourself, or use our hosted API."
        />

        <div
          className="arch-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* stack */}
          <div
            style={{
              border: `1px solid ${RULE_HI}`,
              background: "linear-gradient(180deg, rgba(244,239,226,0.02), transparent)",
            }}
          >
            {layers.map(([n, t, d, tag], i) => {
              const isTrust = tag === "Trust";
              return (
                <div
                  key={n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr auto",
                    gap: 20,
                    alignItems: "center",
                    padding: "22px 22px",
                    borderBottom: i === layers.length - 1 ? "none" : `1px solid ${RULE}`,
                    transition: "background .25s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(217,107,62,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 40,
                      color: INK_F,
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        color: PAPER,
                        marginBottom: 4,
                      }}
                    >
                      {t}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: INK_DIM, lineHeight: 1.5 }}>
                      {d}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "6px 10px",
                      border: `1px solid ${isTrust ? "rgba(217,107,62,0.4)" : RULE_HI}`,
                      color: isTrust ? COPPER : INK_DIM,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tag}
                  </div>
                </div>
              );
            })}
          </div>

          {/* aside */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                padding: 22,
                border: `1px solid ${RULE_HI}`,
                background: "rgba(217,107,62,0.05)",
              }}
            >
              <h5
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: COPPER,
                  margin: "0 0 12px",
                }}
              >
                Common mistake
              </h5>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 19,
                  lineHeight: 1.4,
                  color: INK,
                  margin: "0 0 14px",
                }}
              >
                &ldquo;Web3 vector DBs&rdquo; that put embeddings onchain are
                doing it wrong. Chain blockspace is the most expensive storage
                on earth.
              </p>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK_DIM, lineHeight: 1.6 }}>
                The chain&rsquo;s job is to be the final authority on{" "}
                <em style={{ color: COPPER, fontStyle: "normal" }}>what happened</em>,
                not to hold the thing that happened.
              </div>
            </div>

            <div style={{ border: `1px solid ${RULE_HI}` }}>
              {[
                ["Index", "HNSW (M=16, efC=200)"],
                ["Distance", "Cosine · L2 · Dot"],
                ["Encryption", "AES-256-GCM"],
                ["Hashing", "SHA-256 + domain sep."],
                ["Anchor program", "8xjQ2X…Vn5nP"],
                ["Core language", "Rust (no_std compat)"],
                ["SDK", "TypeScript · Python"],
                ["License", "Apache-2.0 (core)"],
              ].map(([k, v], i, arr) => (
                <div
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 20,
                    padding: "12px 16px",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${RULE}`,
                    fontSize: 11.5,
                  }}
                >
                  <span
                    style={{
                      color: INK_DIM,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontSize: 10.5,
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ color: PAPER, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .arch-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SDK
═══════════════════════════════════════════════════════════════════ */
type Tok = [t: "k" | "s" | "c" | "num" | "f" | "p" | "n", v: string];

function CodeBlock({
  head,
  lang,
  lines,
}: {
  head: string;
  lang: string;
  lines: Tok[][];
}) {
  const color = (t: Tok[0]) => {
    switch (t) {
      case "k":   return "#B4C7FF";
      case "s":   return COPPER;
      case "c":   return INK_F;
      case "num": return "#FFC56E";
      case "f":   return INK;
      case "p":   return INK_DIM;
      default:    return INK;
    }
  };
  return (
    <div style={{ border: `1px solid ${RULE_HI}`, background: BG2, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: `1px solid ${RULE}`,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INK_F,
        }}
      >
        <span>{head}</span>
        <span style={{ color: COPPER }}>{lang}</span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 18,
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.68,
          color: INK,
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        {lines.map((ln, i) => (
          <div key={i}>
            {ln.length === 0
              ? "\u00A0"
              : ln.map((tok, j) => (
                  <span key={j} style={{ color: color(tok[0]) }}>
                    {tok[1]}
                  </span>
                ))}
          </div>
        ))}
      </pre>
    </div>
  );
}

function SdkSection() {
  return (
    <section id="sdk" style={sectionStyle}>
      <div style={SHELL}>
        <SectionHead
          mark="§ III"
          label="SDK"
          title={
            <>
              Two lines to{" "}
              <em style={{ fontStyle: "italic", color: COPPER }}>remember</em>.
              <br />
              One line to{" "}
              <em style={{ fontStyle: "italic", color: COPPER }}>verify</em>.
            </>
          }
          sub="Install, configure with your wallet, write. Shadow Drive persistence and Anchor proofs happen in the background. Python and TypeScript are feature-complete and behaviorally identical."
        />

        <div
          className="sdk-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <CodeBlock
            head="sdk / typescript"
            lang="@veclabs/solvec"
            lines={[
              [["c", "// npm i @veclabs/solvec"]],
              [["k", "import"], ["n", " { Recall } "], ["k", "from"], ["s", ' "@veclabs/solvec"'], ["p", ";"]],
              [["n", ""]],
              [["k", "const"], ["n", " recall "], ["p", "="], ["k", " new"], ["f", " Recall"], ["p", "({"]],
              [["n", "  apiKey: process.env.VECLABS_KEY,"]],
              [["n", "  wallet: keypair,"]],
              [["n", "  shadowDrive: "], ["num", "true"], ["p", ","]],
              [["p", "});"]],
              [["n", ""]],
              [["k", "await"], ["n", " recall."], ["f", "upsert"], ["p", "("], ["s", "\"agent-001\""], ["p", ", [{"]],
              [["n", "  id: "], ["s", "\"mem_9fa0\""], ["p", ","]],
              [["n", "  vector: embedding,     "], ["c", "// 1536-dim"]],
              [["n", "  payload: { text, ts: "], ["f", "Date"], ["p", "."], ["f", "now"], ["p", "()"], ["n", " },"]],
              [["p", "}]);"]],
              [["n", ""]],
              [["k", "const"], ["n", " proof "], ["p", "="], ["k", " await"], ["n", " recall."], ["f", "verify"], ["p", "("], ["s", "\"mem_9fa0\""], ["p", ");"]],
              [["c", "// → { root, slot, sig, verified: true }"]],
            ]}
          />

          <CodeBlock
            head="sdk / python"
            lang="solvec"
            lines={[
              [["c", "# pip install solvec"]],
              [["k", "from"], ["n", " solvec "], ["k", "import"], ["n", " Recall"]],
              [["n", ""]],
              [["n", "recall "], ["p", "="], ["f", " Recall"], ["p", "("]],
              [["n", "    api_key"], ["p", "="], ["n", "os.environ["], ["s", "\"VECLABS_KEY\""], ["n", "],"]],
              [["n", "    wallet"], ["p", "="], ["n", "keypair,"]],
              [["n", "    shadow_drive"], ["p", "="], ["num", "True"], ["n", ","]],
              [["p", ")"]],
              [["n", ""]],
              [["n", "recall."], ["f", "upsert"], ["p", "("], ["s", "\"agent-001\""], ["p", ", [{"]],
              [["n", "    "], ["s", "\"id\""], ["p", ":"], ["s", " \"mem_9fa0\""], ["p", ","]],
              [["n", "    "], ["s", "\"vector\""], ["p", ":"], ["n", " embedding,     "], ["c", "# 1536-dim"]],
              [["n", "    "], ["s", "\"payload\""], ["p", ":"], ["n", " {"], ["s", "\"text\""], ["p", ":"], ["n", " text, "], ["s", "\"ts\""], ["p", ":"], ["n", " time."], ["f", "time"], ["p", "()},"]],
              [["p", "}])"]],
              [["n", ""]],
              [["n", "proof "], ["p", "="], ["n", " recall."], ["f", "verify"], ["p", "("], ["s", "\"mem_9fa0\""], ["p", ")"]],
              [["c", "# → {root, slot, sig, verified: True}"]],
            ]}
          />
        </div>

        <style>{`
          @media (max-width: 900px) {
            .sdk-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PULLQUOTE
═══════════════════════════════════════════════════════════════════ */
function Pullquote() {
  return (
    <section style={{ padding: "120px 0", borderBottom: `1px solid ${RULE}`, textAlign: "center" }}>
      <div style={SHELL}>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(28px, 4vw, 56px)",
            lineHeight: 1.18,
            color: PAPER,
            margin: "0 auto 32px",
            maxWidth: "24ch",
            letterSpacing: "-0.005em",
          }}
        >
          If your agent can&rsquo;t{" "}
          <em style={{ color: COPPER, fontStyle: "italic" }}>prove</em>{" "}
          what it remembered,
          <br />
          it didn&rsquo;t really remember at all.
        </p>
        <cite
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: INK_F,
            fontStyle: "normal",
          }}
        >
          — Recall · Thesis, Part I
        </cite>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARE
═══════════════════════════════════════════════════════════════════ */
function Compare() {
  const rows: Array<[string, string, string, string, string]> = [
    ["Storage Ownership",   "Yours (Shadow Drive)",    "Vendor cloud",   "Self / vendor",  "Self / vendor"],
    ["Encryption at Rest",  "AES-256-GCM, client-side","Server-side",    "Optional",       "Server-side"],
    ["Cryptographic Proofs","Merkle → Solana Anchor",  "—",              "—",              "—"],
    ["Key Sovereignty",     "Solana keypair-derived",  "Vendor-managed", "Vendor-managed", "Vendor-managed"],
    ["Query Latency (P99)", "~4.7 ms",                 "~30 ms",         "~18 ms",         "~48 ms"],
    ["Core Open Source",    "Apache-2.0 (Rust)",       "Closed",         "Apache-2.0",     "BSD"],
    ["Tamper-Evident Audit","Built-in",                "—",              "—",              "—"],
  ];

  return (
    <section id="compare" style={sectionStyle}>
      <div style={SHELL}>
        <SectionHead
          mark="§ IV"
          label="Compare"
          title={
            <>
              The row
              <br />
              <em style={{ fontStyle: "italic", color: COPPER }}>nobody else has.</em>
            </>
          }
          sub="Vector search is table stakes in 2026. The question isn't 'how fast.' It's who owns the index."
        />

        <div style={{ overflowX: "auto", border: `1px solid ${RULE_HI}` }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              minWidth: 700,
            }}
          >
            <thead>
              <tr style={{ background: "rgba(244, 239, 226, 0.02)" }}>
                {["", "Recall", "Pinecone", "Chroma", "Weaviate"].map((h, i) => (
                  <th
                    key={h || i}
                    style={{
                      padding: "16px 18px",
                      textAlign: "left",
                      borderBottom: `1px solid ${RULE}`,
                      fontFamily: MONO,
                      fontSize: 10.5,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: i === 1 ? COPPER : INK_F,
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, us, p, c, w], ri) => (
                <tr key={feature}>
                  <th
                    style={{
                      padding: "16px 18px",
                      textAlign: "left",
                      borderBottom: ri === rows.length - 1 ? "none" : `1px solid ${RULE}`,
                      fontFamily: MONO,
                      fontWeight: 400,
                      color: INK_DIM,
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      width: "32%",
                      verticalAlign: "middle",
                    }}
                  >
                    {feature}
                  </th>
                  {[us, p, c, w].map((v, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "16px 18px",
                        borderBottom: ri === rows.length - 1 ? "none" : `1px solid ${RULE}`,
                        color: ci === 0 ? COPPER : v === "—" ? INK_F : INK,
                        fontWeight: ci === 0 ? 500 : 400,
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
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════════════════ */
function Pricing() {
  const tiers = [
    {
      name: "Open / Self-Host",
      price: "$0",
      unit: "/forever",
      tag: "The core. Yours.",
      items: [
        "Rust crate + local SDK",
        "Self-hosted Shadow Drive",
        "Direct Anchor writes",
        "Memory Inspector UI",
        "Community support",
      ],
      cta: "Clone on GitHub ↗",
      href: "https://github.com/veclabs/veclabs",
      featured: false,
    },
    {
      name: "Pro · Hosted",
      price: "$25",
      unit: "/mo",
      tag: "For indie builders & agents.",
      items: [
        "Hosted API + managed cache",
        "Shadow Drive provisioning",
        "1M vectors · 100k writes/mo",
        "Dashboard + usage analytics",
        "Email support",
      ],
      cta: "Start Pro →",
      href: "https://app.veclabs.xyz/register",
      featured: true,
    },
    {
      name: "Business",
      price: "$199",
      unit: "/mo",
      tag: "Production agents.",
      items: [
        "10M vectors · 2M writes/mo",
        "Team keys + RBAC",
        "Priority queue + SLA",
        "Verified proof export",
        "Slack-connected support",
      ],
      cta: "Upgrade →",
      href: "https://app.veclabs.xyz/register",
      featured: false,
    },
    {
      name: "Enterprise",
      price: "Let's talk",
      unit: "",
      tag: "Sovereign deployments.",
      items: [
        "On-prem or dedicated cluster",
        "Custom Anchor program",
        "Dedicated solutions engineer",
        "Compliance (SOC 2, HIPAA path)",
        "24/7 on-call",
      ],
      cta: "Contact team ↗",
      href: "mailto:veclabs@outlook.com",
      featured: false,
    },
  ];

  return (
    <section id="pricing" style={sectionStyle}>
      <div style={SHELL}>
        <SectionHead
          mark="§ V"
          label="Pricing"
          title={
            <>
              Fair rails.
              <br />
              <em style={{ fontStyle: "italic", color: COPPER }}>Open core.</em>
            </>
          }
          sub="The Rust core is Apache-2.0 forever. The hosted API is metered; you're paying for low-latency cache, Shadow Drive provisioning, and Anchor gas — not for owning your own memory."
        />

        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            border: `1px solid ${RULE_HI}`,
          }}
        >
          {tiers.map((t, i) => (
            <div
              key={t.name}
              style={{
                padding: "32px 24px",
                borderRight: i === tiers.length - 1 ? "none" : `1px solid ${RULE}`,
                display: "flex",
                flexDirection: "column",
                minHeight: 420,
                background: t.featured ? "rgba(217, 107, 62, 0.05)" : "transparent",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: t.featured ? COPPER : INK_F,
                  marginBottom: 18,
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 48,
                  lineHeight: 1,
                  color: PAPER,
                  marginBottom: 4,
                }}
              >
                {t.price}
                {t.unit ? (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: INK_F,
                      letterSpacing: "0.08em",
                      marginLeft: 4,
                    }}
                  >
                    {t.unit}
                  </span>
                ) : null}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: INK_DIM, marginBottom: 24 }}>
                {t.tag}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px",
                  fontSize: 12,
                  color: INK,
                  flexGrow: 1,
                }}
              >
                {t.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      padding: "8px 0",
                      borderBottom: `1px dashed ${RULE}`,
                      display: "flex",
                      gap: 10,
                      lineHeight: 1.5,
                      fontFamily: MONO,
                    }}
                  >
                    <span style={{ color: COPPER, flexShrink: 0 }}>+</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <a
                href={t.href}
                target={t.href.startsWith("http") ? "_blank" : undefined}
                rel={t.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  ...btnBase,
                  width: "100%",
                  justifyContent: "center",
                  ...(t.featured
                    ? { background: COPPER, color: BG, borderColor: COPPER }
                    : {}),
                }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 960px) {
            .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 540px) {
            .pricing-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section id="start" style={{ padding: "100px 0", borderBottom: `1px solid ${RULE}` }}>
      <div style={SHELL}>
        <div
          className="cta-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 48,
            alignItems: "end",
          }}
        >
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(36px, 5vw, 68px)",
              lineHeight: 1,
              color: PAPER,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Give your agent a
            <br />
            <em style={{ fontStyle: "italic", color: COPPER }}>memory it owns.</em>
          </h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a
              href="https://app.veclabs.xyz/register"
              target="_blank"
              rel="noopener noreferrer"
              style={btnPrimary}
            >
              Get API key →
            </a>
            <a href="https://docs.veclabs.xyz" target="_blank" rel="noopener noreferrer" style={btnGhost}>
              Read the docs ↗
            </a>
          </div>
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(120px, 26vw, 380px)",
            lineHeight: 0.85,
            letterSpacing: "-0.03em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(232, 225, 206, 0.14)",
            margin: "24px 0 -30px",
            userSelect: "none",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          Recall.
        </div>

        <style>{`
          @media (max-width: 780px) {
            .cta-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════ */
function Footer() {
  const columns: Array<[string, Array<[string, string]>]> = [
    ["Product", [
      ["Architecture",      "#arch"],
      ["SDKs",              "#sdk"],
      ["Memory Inspector",  "https://demo.veclabs.xyz"],
      ["Changelog",         "https://docs.veclabs.xyz"],
    ]],
    ["Developers", [
      ["Docs",            "https://docs.veclabs.xyz"],
      ["API Reference",   "https://docs.veclabs.xyz"],
      ["Anchor Program",  "https://explorer.solana.com"],
      ["GitHub",          "https://github.com/veclabs/veclabs"],
    ]],
    ["Company", [
      ["Thesis",               "#thesis"],
      ["Blog",                 "/blog"],
      ["X / @VecLabs",         "https://twitter.com/veclabss"],
      ["veclabs@outlook.com",  "mailto:veclabs@outlook.com"],
    ]],
  ];

  return (
    <footer style={{ padding: "56px 0 28px" }}>
      <div style={SHELL}>
        <div
          className="foot-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 56,
          }}
        >
          <div style={{ maxWidth: "38ch" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                fontFamily: MONO,
                color: INK,
              }}
            >
              <BrandMark size={22} />
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.06em" }}>
                VECLABS
              </span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, color: INK, margin: "18px 0 0" }}>
              Building the cryptographic substrate for a trillion agents that{" "}
              <em style={{ fontStyle: "italic", color: COPPER }}>actually</em> remember.
            </p>
          </div>

          {columns.map(([heading, items]) => (
            <div key={heading}>
              <h6
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: INK_F,
                  margin: "0 0 16px",
                  fontWeight: 500,
                }}
              >
                {heading}
              </h6>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map(([label, href]) => (
                  <li key={label} style={{ padding: "6px 0", fontSize: 12, fontFamily: MONO }}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ color: INK_DIM }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = COPPER)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = INK_DIM)}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="foot-bottom"
          style={{
            paddingTop: 24,
            borderTop: `1px solid ${RULE}`,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: INK_F,
          }}
        >
          <span>© MMXXVI VecLabs, Inc. — All writes reserved.</span>
          <span>Anchor: 8xjQ2XrdhR4J…Vn5nP</span>
          <span>Made in Solana space.</span>
        </div>

        <style>{`
          @media (max-width: 780px) {
            .foot-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 600px) {
            .foot-bottom { flex-direction: column !important; gap: 10px !important; }
          }
        `}</style>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Page() {
  return (
    <main style={{ background: BG, minHeight: "100vh", color: INK }}>
      <Nav />
      <SysBar />
      <Hero />
      <Marquee />
      <Thesis />
      <Architecture />
      <SdkSection />
      <Pullquote />
      <Compare />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}