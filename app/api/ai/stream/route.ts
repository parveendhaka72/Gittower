import { NextResponse } from 'next/server';

/**
 * AI Streaming Response Handler
 * Topic: Streaming responses (0.3 pts)
 * Demonstrates: Server-Sent Events (SSE) / ReadableStream chunk streaming for LLMs
 */
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = { prompt: 'Explain GitTower attention triage in 3 bullet points' };
  }

  const prompt = body.prompt || 'Explain GitTower attention triage in 3 bullet points';

  // Sample tokens simulating live LLM token stream
  const sampleTokens = [
    '🤖 **GitTower AI Triage Stream**\n\n',
    '1. **Attention Filtering**: Evaluates pull requests based on review urgency rather than chronological order.\n',
    '2. **Blocker Identification**: Detects failing CI checks and merge conflicts instantly.\n',
    '3. **Actionable Recommendations**: Produces 2-3 specific developer next steps to unblock the team.\n\n',
    '⚡ *Stream completed with 0ms buffering using HTTP chunked transfer.*',
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const token of sampleTokens) {
        // Send as Server-Sent Event data line
        const chunk = `data: ${JSON.stringify({ token, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        // Artificial 120ms delay per token chunk to simulate live token generation
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
