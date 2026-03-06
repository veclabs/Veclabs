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

const SESSION_ID = `session_${Date.now()}`;

export default function Home() {
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
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-sm text-green-400 tracking-widest uppercase">
            VecLabs
          </span>
          <span className="text-gray-600 text-sm">/ AI Agent Demo</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
          <span>{totalMemories} memories stored</span>
          <span className="text-purple-400">Solana Devnet</span>
          <a
            href="https://github.com/veclabs/veclabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-6 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
          >
            <div
              className={`max-w-2xl ${msg.role === "user" ? "w-auto" : "w-full"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white ml-auto"
                    : "bg-gray-900 border border-gray-800 text-gray-100"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>

              {msg.memory && (
                <div className="mt-2 bg-gray-900/50 border border-green-900/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
                      Memory Stored On-Chain
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500">
                    <div>
                      <span className="text-gray-600">ID: </span>
                      <span className="text-gray-400">
                        {msg.memory.id.slice(0, 20)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dims: </span>
                      <span className="text-gray-400">
                        {msg.memory.vectorDimensions}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Root: </span>
                      <span className="text-gray-400">
                        {msg.memory.merkleRoot}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total: </span>
                      <span className="text-gray-400">
                        {msg.memory.totalMemories} memories
                      </span>
                    </div>
                  </div>
                  {msg.memory.relevantMemoriesUsed > 0 && (
                    <div className="mt-2 text-xs font-mono text-purple-400">
                      {msg.memory.relevantMemoriesUsed} past memories used in
                      response
                    </div>
                  )}
                  <a
                    href={msg.memory.solanaExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs font-mono text-purple-400 hover:text-purple-300 transition"
                  >
                    View on Solana Explorer
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Tell the agent something about yourself..."
            disabled={loading}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-600 transition disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl px-5 py-3 text-sm font-medium transition"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-center text-xs font-mono text-gray-700 mt-3">
          Every message stored as a vector · Merkle root posted to Solana ·
          veclabs.xyz
        </p>
      </div>
    </div>
  );
}
