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

function DemoNav() {
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="no-underline">
          <LogoLockup markSize={28} uid="demo-nav" />
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="/#benchmarks"
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
              background: "#0A0A0A",
              color: "#FFFFFF",
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
            }}
          >
            {copied ? "Copied" : "npm install @veclabs/solvec"}
          </button>
        </div>

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

      {menuOpen && (
        <div
          className="flex flex-col gap-4 px-6 pb-4 md:hidden"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <a href="/#benchmarks" className="text-sm" style={{ color: "#6B7280" }}>
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
              background: "#0A0A0A",
              color: "#FFFFFF",
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
            }}
          >
            {copied ? "Copied" : "npm install @veclabs/solvec"}
          </button>
        </div>
      )}
    </nav>
  );
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm an AI agent with persistent memory powered by VecLabs. Tell me something about yourself — I'll remember it forever, cryptographically verified on Solana.",
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
      style={{ background: "#FFFFFF" }}
    >
      <DemoNav />

      <div className="mx-auto w-full max-w-3xl px-6 pt-24 pb-4">
        <h1
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontWeight: 600,
            fontSize: 32,
            color: "#0A0A0A",
            letterSpacing: "-0.02em",
          }}
        >
          Agent Memory Demo
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Type anything. Watch it become a vector, stored with a Merkle root.
        </p>
        <div
          className="mt-2 flex items-center gap-3"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 11,
            color: "#6B7280",
          }}
        >
          <span>{totalMemories} memories stored</span>
          <span>·</span>
          <span style={{ color: "#E8930A" }}>Solana Devnet</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-4">
        <div
          className="flex-1 overflow-y-auto"
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            padding: 16,
            minHeight: 400,
            maxHeight: "60vh",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${msg.role === "user" ? "w-auto" : "w-full"}`}
              >
                <div
                  style={{
                    background:
                      msg.role === "user" ? "#0A0A0A" : "#F9FAFB",
                    color: msg.role === "user" ? "#FFFFFF" : "#0A0A0A",
                    borderRadius: 6,
                    padding: "12px 16px",
                    border:
                      msg.role === "assistant"
                        ? "1px solid #E5E7EB"
                        : "none",
                  }}
                >
                  <p
                    className="whitespace-pre-wrap"
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {msg.content}
                  </p>
                </div>

                {msg.memory && (
                  <div
                    className="mt-2 p-3"
                    style={{
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: 6,
                    }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "#E8930A" }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          fontSize: 10,
                          color: "#E8930A",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Memory Stored On-Chain
                      </span>
                    </div>
                    <div
                      className="grid grid-cols-2 gap-2"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: 11,
                      }}
                    >
                      <div>
                        <span style={{ color: "#9CA3AF" }}>ID: </span>
                        <span style={{ color: "#6B7280" }}>
                          {msg.memory.id.slice(0, 20)}...
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#9CA3AF" }}>Dims: </span>
                        <span style={{ color: "#6B7280" }}>
                          {msg.memory.vectorDimensions}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#9CA3AF" }}>Root: </span>
                        <span style={{ color: "#6B7280" }}>
                          {msg.memory.merkleRoot}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#9CA3AF" }}>Total: </span>
                        <span style={{ color: "#6B7280" }}>
                          {msg.memory.totalMemories} memories
                        </span>
                      </div>
                    </div>
                    {msg.memory.relevantMemoriesUsed > 0 && (
                      <div
                        className="mt-2"
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          fontSize: 11,
                          color: "#E8930A",
                        }}
                      >
                        {msg.memory.relevantMemoriesUsed} past memories used
                      </div>
                    )}
                    <a
                      href={msg.memory.solanaExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: 11,
                        color: "#E8930A",
                        textDecoration: "none",
                      }}
                    >
                      View on Solana Explorer →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "12px 16px",
                }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full"
                      style={{
                        background: "#6B7280",
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage()
            }
            placeholder="Tell the agent something about yourself..."
            disabled={loading}
            style={{
              flex: 1,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 4,
              padding: "12px 16px",
              fontFamily: "var(--font-geist-sans)",
              fontSize: 14,
              color: "#0A0A0A",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="cursor-pointer disabled:opacity-40"
            style={{
              background: "#0A0A0A",
              color: "#FFFFFF",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 20px",
              border: "none",
              borderRadius: 4,
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <p
          className="mt-4 text-center"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 11,
            color: "#6B7280",
          }}
        >
          Memory resets on server restart. Persistent storage via Shadow Drive
          ships in v0.2.
        </p>
      </div>
    </div>
  );
}
