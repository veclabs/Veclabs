"use client";

import { useState, useRef, useEffect } from "react";

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

const C = {
  bg:          "#000000",
  surface:     "#080808",
  surface2:    "#0D0D0D",
  ink:         "#F0EDE6",
  muted:       "#3A3A3A",
  subtle:      "#7c827e",
  border:      "#111111",
  green:       "#2D7A45",
  greenBright: "#4CAF72",
  greenDim:    "#1A4A2A",
} as const;

const MONO = "'IBM Plex Mono', monospace";
const SANS = "'Geist', sans-serif";

const SESSION_ID = `session_${Date.now()}`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm an AI agent with persistent memory powered by VecLabs. Tell me something about yourself, I'll remember it forever, cryptographically verified on Solana.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalMemories, setTotalMemories] = useState(0);
  const [sendHover, setSendHover] = useState(false);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000000; }
        ::selection { background: #2D7A45; color: #F0EDE6; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: #111111; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #2D7A45; }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        input::placeholder { color: #1A1A1A; font-family: 'IBM Plex Mono', monospace; }
        input:focus { outline: none; border-color: #2D7A45 !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}>

        {/* NAV */}
        <header style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "0 48px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.bg,
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}>
          <a href="https://veclabs.xyz" style={{
            fontFamily: MONO,
            fontSize: "15px",
            fontWeight: 500,
            color: C.ink,
            letterSpacing: "-0.01em",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            veclabs
            <span style={{ color: C.subtle, fontWeight: 400 }}>
              / agent memory demo
            </span>
          </a>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontFamily: MONO,
            fontSize: "11px",
            letterSpacing: "0.04em",
          }}>
            <span style={{ color: C.muted }}>
              {totalMemories} memories stored
            </span>
            <span style={{ color: C.green }}>
              Solana Devnet
            </span>
            <a
              href="https://github.com/veclabs/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.subtle, textDecoration: "none", transition: "color 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = C.subtle)}
            >
              GitHub
            </a>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "40px 48px 32px",
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
        }}>
          <span style={{
            fontFamily: MONO,
            fontSize: "10px",
            color: C.subtle,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            display: "block",
            marginBottom: "12px",
          }}>
            LIVE DEMO · SOLANA DEVNET
          </span>
          <h1 style={{
            fontFamily: MONO,
            fontSize: "26px",
            fontWeight: 500,
            color: C.ink,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "10px",
          }}>
            Agent Memory Demo
          </h1>
          <p style={{
            fontFamily: SANS,
            fontSize: "15px",
            color: C.muted,
            lineHeight: 1.65,
          }}>
            Type anything. Watch it become a vector, stored with a Merkle root on Solana devnet.
          </p>
        </div>

        {/* MESSAGES */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 48px",
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column" as const,
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {/* Label */}
              {msg.role === "assistant" && (
                <span style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  color: C.subtle,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  marginBottom: "6px",
                }}>
                  agent
                </span>
              )}

              {/* Bubble */}
              <div style={{
                background: msg.role === "user" ? C.surface2 : C.surface,
                border: `1px solid ${C.border}`,
                padding: "12px 16px",
                maxWidth: msg.role === "user" ? "70%" : "100%",
                width: msg.role === "assistant" ? "100%" : "auto",
              }}>
                <p style={{
                  fontFamily: msg.role === "user" ? MONO : SANS,
                  fontSize: msg.role === "user" ? "13px" : "14px",
                  color: msg.role === "user" ? C.ink : C.muted,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </p>
              </div>

              {/* Memory proof strip */}
              {msg.memory && (
                <div style={{
                  width: "100%",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderTop: `1px solid ${C.greenDim}`,
                  padding: "12px 16px",
                  marginTop: "2px",
                  fontFamily: MONO,
                  fontSize: "10px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}>
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: C.greenBright,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      color: C.greenBright,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase" as const,
                      fontSize: "9px",
                    }}>
                      Memory Stored On-Chain
                    </span>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                    marginBottom: "8px",
                  }}>
                    <div>
                      <span style={{ color: C.subtle }}>ID: </span>
                      <span style={{ color: C.muted }}>
                        {msg.memory.id.slice(0, 20)}...
                      </span>
                    </div>
                    <div>
                      <span style={{ color: C.subtle }}>Dims: </span>
                      <span style={{ color: C.muted }}>
                        {msg.memory.vectorDimensions}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: C.subtle }}>Root: </span>
                      <span style={{ color: C.muted }}>
                        {msg.memory.merkleRoot}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: C.subtle }}>Total: </span>
                      <span style={{ color: C.muted }}>
                        {msg.memory.totalMemories} memories
                      </span>
                    </div>
                  </div>

                  {msg.memory.relevantMemoriesUsed > 0 && (
                    <div style={{
                      color: C.green,
                      marginBottom: "8px",
                    }}>
                      ✓ {msg.memory.relevantMemoriesUsed} past{" "}
                      {msg.memory.relevantMemoriesUsed === 1 ? "memory" : "memories"}{" "}
                      recalled
                    </div>
                  )}

                  <a
                    href={msg.memory.solanaExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: C.green,
                      textDecoration: "none",
                      display: "block",
                      transition: "color 150ms",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.greenBright)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.green)}
                  >
                    ✓ view on solana explorer →
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "24px",
            }}>
              <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                padding: "14px 18px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: C.green,
                      animation: "dot-pulse 1.2s ease-in-out infinite",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: C.bg,
          padding: "16px 48px",
          position: "sticky",
          bottom: 0,
          flexShrink: 0,
        }}>
          <div style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            gap: "12px",
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message to the agent..."
              disabled={loading}
              style={{
                flex: 1,
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.ink,
                fontFamily: MONO,
                fontSize: "13px",
                padding: "14px 16px",
                opacity: loading ? 0.5 : 1,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              onMouseEnter={() => setSendHover(true)}
              onMouseLeave={() => setSendHover(false)}
              style={{
                background: loading || !input.trim()
                  ? C.subtle
                  : sendHover ? C.green : C.ink,
                color: loading || !input.trim() ? C.border : C.bg,
                fontFamily: MONO,
                fontSize: "12px",
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                padding: "14px 20px",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 150ms, color 150ms",
                whiteSpace: "nowrap" as const,
              }}
            >
              {loading ? "···" : "Send →"}
            </button>
          </div>

          <p style={{
            fontFamily: MONO,
            fontSize: "10px",
            color: C.subtle,
            textAlign: "center" as const,
            paddingTop: "12px",
          }}>
            Every message stored as a vector · Merkle root posted to Solana devnet · Memory resets on server restart
          </p>
        </div>
      </div>
    </>
  );
}