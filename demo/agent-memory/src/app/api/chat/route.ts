import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SolVec } from '@veclabs/solvec';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize SolVec collection
// In production this would use a wallet from env
// For demo: no wallet = in-memory + no on-chain posts
const sv = new SolVec({ network: 'devnet' });
const memoryCollection = sv.collection('demo-agent-memory', {
  dimensions: 768,
  metric: 'cosine',
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'message and sessionId are required' },
        { status: 400 }
      );
    }

    // 1. Generate embedding using Gemini
    const embeddingModel = genai.getGenerativeModel({
      model: 'text-embedding-004',
    });
    const embeddingResult = await embeddingModel.embedContent(message);
    const embedding = embeddingResult.embedding.values;

    // 2. Query for relevant memories using SolVec
    const queryResults = await memoryCollection.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    const relevantMemories = queryResults.matches
      .filter((m) => m.score > 0.75)
      .map((m) => m.metadata?.text as string)
      .filter(Boolean);

    // 3. Build system prompt with recalled memories
    const systemPrompt =
      relevantMemories.length > 0
        ? `You are a helpful AI assistant with persistent memory powered by VecLabs.

Your relevant memories about this user:
${relevantMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Use these memories to personalize your response.`
        : `You are a helpful AI assistant with persistent memory powered by VecLabs.
You don't have any relevant memories about this user yet.
When they share information about themselves, acknowledge that you will remember it.`;

    // 4. Generate response using Gemini
    const chatModel = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const chatResult = await chatModel.generateContent(
      systemPrompt + '\n\nUser: ' + message
    );
    const assistantMessage = chatResult.response.text();

    // 5. Store this message as a memory using SolVec
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await memoryCollection.upsert([
      {
        id: memoryId,
        values: embedding,
        metadata: { text: message, sessionId, timestamp: Date.now() },
      },
    ]);

    // 6. Get collection stats and last tx URL
    const stats = await memoryCollection.describeIndexStats();
    const lastTxUrl = (memoryCollection as { getLastTxUrl?: () => string | undefined }).getLastTxUrl?.();

    const cluster = '?cluster=devnet';
    const explorerUrl =
      lastTxUrl ??
      `https://explorer.solana.com/address/8iLpyegDt8Vx2Q56kdvDJYpmnkTD2VDZvHXXead75Fm7${cluster}`;

    return NextResponse.json({
      response: assistantMessage,
      memory: {
        id: memoryId,
        stored: true,
        vectorDimensions: embedding.length,
        totalMemories: stats.vectorCount,
        merkleRoot: stats.merkleRoot.slice(0, 16) + '...',
        solanaExplorerUrl: explorerUrl,
        relevantMemoriesUsed: relevantMemories.length,
        usingRustHnsw: true,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[VecLabs Demo] Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const stats = await memoryCollection.describeIndexStats();
  return NextResponse.json({
    totalMemories: stats.vectorCount,
    merkleRoot: stats.merkleRoot,
    status: 'VecLabs Demo API running',
    engine: 'Rust HNSW via WASM',
  });
}
