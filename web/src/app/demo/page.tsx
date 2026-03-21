"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LogoLockup } from "@/components/Logo";

interface Message {
  role: "user" | "assistant";
  content: string;
  memory?: {
    id: string;
    stored: boolean;
    vectorDimensions: number;
    totalMemories: number;
    merkleRoot: string;
    solanaExplorerUrl: string;
    relevantMemoriesUsed: number;
  };
  timestamp: Date;
}

const SESSION_ID = `session_${Date.now()}`;
const PROGRAM_ADDRESS = "8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP";

function DemoNav() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @veclabs/solvec");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const linkStyle = {
    fontFamily: "var(--font-geist-mono), 'Geist Mono', monospace",
    fontSize: 12,
    color: "#C9B99A",
    letterSpacing: "0.04em",
    textDecoration: "none" as const,
    transition: "color 150ms",
  };

  return (
    <>
      <style>{`
        @keyframes demo-dot-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .demo-loading-dot:nth-child(1) { animation-delay: 0ms; }
        .demo-loading-dot:nth-child(2) { animation-delay: 150ms; }
        .demo-loading-dot:nth-child(3) { animation-delay: 300ms; }
        .demo-nav-copied { background: #2D4A3E !important; color: #FFFFFF !important; }
        .demo-input:focus { border-color: #2D4A3E; outline: none; }
        .demo-input::placeholder { color: #4A4A4A; }
        .demo-send-btn:hover:not(:disabled) { background: #2D4A3E !important; color: #FFFFFF !important; }
      `}</style>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "#0A0A0A",
          borderBottom: "1px solid #1D2E28",
          height: 56,
        }}
      >
        <div
          className="mx-auto flex h-full items-center justify-between"
          style={{ maxWidth: 1100, padding: "0 48px" }}
        >
          <a href="/" style={{ textDecoration: "none" }}>
            <LogoLockup markSize={24} uid="demo-nav" dark />
          </a>

          <div
            className="hidden items-center gap-8 md:flex"
            style={{ ...linkStyle }}
          >
            <a
              href="https://docs.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:!text-[#FFFFFF]"
            >
              Docs
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:!text-[#FFFFFF]"
            >
              GitHub
            </a>
            <a href="/#benchmarks" className="hover:!text-[#FFFFFF]">
              Benchmarks
            </a>
          </div>

          <button
            onClick={handleCopy}
            className={`cursor-pointer border-none transition-colors duration-150 ${copied ? "demo-nav-copied" : ""}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              background: copied ? undefined : "#1D2E28",
              color: copied ? undefined : "#FFFFFF",
              border: copied ? undefined : "1px solid #2D4A3E",
              padding: "8px 16px",
              borderRadius: 2,
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#FFFFFF">
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
            style={{ borderTop: "1px solid #1D2E28", paddingTop: 16 }}
          >
            <a
              href="https://docs.veclabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, color: "#FFFFFF" }}
            >
              Docs
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, color: "#FFFFFF" }}
            >
              GitHub
            </a>
            <a href="/#benchmarks" style={{ ...linkStyle, color: "#FFFFFF" }}>
              Benchmarks
            </a>
            <button
              onClick={handleCopy}
              className={`cursor-pointer self-start ${copied ? "demo-nav-copied" : ""}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                background: copied ? undefined : "#1D2E28",
                color: copied ? undefined : "#FFFFFF",
                border: copied ? undefined : "1px solid #2D4A3E",
                padding: "8px 16px",
                borderRadius: 2,
              }}
            >
              {copied ? "copied ✓" : "npm install @veclabs/solvec"}
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm an AI agent with persistent memory powered by VecLabs. Tell me something about yourself - I'll remember it forever, cryptographically verified on Solana.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalMemories, setTotalMemories] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId: SESSION_ID }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          memory: data.memory,
          timestamp: new Date(),
        },
      ]);

      if (data.memory?.totalMemories) {
        setTotalMemories(data.memory.totalMemories);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#0A0A0A" }}
    >
      <DemoNav />

      {/* Page header */}
      <header
        style={{
          padding: "48px 48px 32px",
          borderBottom: "1px solid #1D2E28",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#C9B99A",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            LIVE DEMO · SOLANA DEVNET
          </p>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 28,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Agent Memory Demo
          </h1>
          <p
            style={{
              fontFamily: "var(--font-geist-mono), 'Geist Mono', monospace",
              fontSize: 15,
              color: "#C9B99A",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: 0,
            }}
          >
            Type anything. Watch it become a vector, stored with a Merkle root
            on Solana devnet.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#8B6340",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#8B6340",
              }}
            >
              devnet live
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#C9B99A",
              letterSpacing: "0.04em",
            }}
          >
            program: {PROGRAM_ADDRESS.slice(0, 12)}...
          </span>
        </div>
      </header>

      {/* Chat area */}
      <div
        className="flex-1"
        style={{
          background: "#0A0A0A",
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 48px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: 24,
            paddingBottom: 24,
            minHeight: 320,
            maxHeight: "calc(100vh - 56px - 180px)",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}
            >
              <div style={{ maxWidth: msg.role === "user" ? "70%" : "80%" }}>
                {msg.role === "user" ? (
                  <div
                    style={{
                      background: "#111111",
                      border: "1px solid #1D2E28",
                      padding: "12px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "#FFFFFF",
                      lineHeight: 1.6,
                    }}
                  >
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>
                ) : (
                  <>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "#C9B99A",
                        marginBottom: 4,
                      }}
                    >
                      agent
                    </span>
                    <div
                      style={{
                        background: "#111111",
                        border: "1px solid #1D2E28",
                        padding: "12px 16px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <p
                        className="whitespace-pre-wrap"
                        style={{
                          fontFamily: "var(--font-geist-mono), 'Geist Mono', monospace",
                          fontSize: 14,
                          color: "#C9B99A",
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {msg.content}
                      </p>
                      {msg.memory && (
                        <div
                          style={{
                            borderTop: "1px solid #1D2E28",
                            paddingTop: 10,
                            marginTop: 10,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                          }}
                        >
                          <span style={{ color: "#8B6340" }}>✓ stored</span>
                          <span style={{ color: "#C9B99A" }}>·</span>
                          <span style={{ color: "#C9B99A" }}>
                            {msg.memory.merkleRoot.slice(0, 12)}...
                          </span>
                          <span style={{ color: "#C9B99A" }}>·</span>
                          <a
                            href={msg.memory.solanaExplorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#8B6340", textDecoration: "none" }}
                          >
                            view on explorer →
                          </a>
                          <span style={{ color: "#C9B99A" }}>·</span>
                          <span style={{ color: "#C9B99A" }}>-</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "#111111",
                  border: "1px solid #1D2E28",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="demo-loading-dot"
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#8B6340",
                      animation: "demo-dot-pulse 1s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#C9B99A",
              textAlign: "center",
              padding: "24px 0",
              margin: 0,
            }}
          >
            Memory resets on server restart · Persistent storage via Shadow
            Drive ships in v0.2
          </p>
        </div>
      </div>

      {/* Input bar - fixed to bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#0A0A0A",
          borderTop: "1px solid #1D2E28",
          padding: "16px 48px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            gap: 8,
            alignItems: "stretch",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message to the agent..."
            disabled={loading}
            className="demo-input"
            style={{
              flex: 1,
              background: "#111111",
              border: "1px solid #1D2E28",
              color: "#FFFFFF",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: "14px 16px",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="demo-send-btn"
            style={{
              background: loading || !input.trim() ? "#111111" : "#1D2E28",
              color: loading || !input.trim() ? "#4A4A4A" : "#FFFFFF",
              fontFamily: "var(--font-geist-mono), 'Geist Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "14px 20px",
              border: loading || !input.trim() ? "1px solid #1D2E28" : "1px solid #2D4A3E",
              borderRadius: 2,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "background 150ms, color 150ms",
            }}
          >
            Send →
          </button>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind fixed input */}
      <div style={{ height: 88 }} />
    </div>
  );
}
