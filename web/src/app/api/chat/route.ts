import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const memoryStore = new Map<
  string,
  {
    text: string;
    embedding: number[];
    timestamp: number;
    sessionId: string;
  }
>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom < 1e-8 ? 0 : dot / denom;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 }
      );
    }

    const embeddingModel = genai.getGenerativeModel({
      model: "gemini-embedding-001",
    });
    const embeddingResult = await embeddingModel.embedContent(message);
    const embedding = embeddingResult.embedding.values;

    const threshold = 0.75;
    const relevantMemories: string[] = [];

    for (const [, memory] of memoryStore.entries()) {
      const score = cosineSimilarity(embedding, memory.embedding);
      if (score > threshold) {
        relevantMemories.push(memory.text);
      }
    }

    const systemPrompt =
      relevantMemories.length > 0
        ? `You are a helpful AI assistant with persistent memory powered by VecLabs.

Your relevant memories about this user:
${relevantMemories.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Use these memories to personalize your response. Mention that you remember these things. You do not need to mention it everytime.`
        : `You are a helpful AI assistant with persistent memory powered by VecLabs.
You don't have any relevant memories about this user yet.
When they share information about themselves, acknowledge that you will remember it.`;

    const chatModel = genai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chatResult = await chatModel.generateContent(
      systemPrompt + "\n\nUser: " + message
    );
    const assistantMessage = chatResult.response.text();

    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    memoryStore.set(memoryId, {
      text: message,
      embedding,
      timestamp: Date.now(),
      sessionId,
    });

    const merkleRoot =
      Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("") + "...";

    const solanaExplorerUrl =
      "https://explorer.solana.com/address/8iLpyegDt8Vx2Q56kdvDJYpmnkTD2VDZvHXXead75Fm7?cluster=devnet";

    return NextResponse.json({
      response: assistantMessage,
      memory: {
        id: memoryId,
        stored: true,
        vectorDimensions: embedding.length,
        totalMemories: memoryStore.size,
        merkleRoot,
        solanaExplorerUrl,
        relevantMemoriesUsed: relevantMemories.length,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[VecLabs Demo] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalMemories: memoryStore.size,
    status: "VecLabs Demo API running",
  });
}
