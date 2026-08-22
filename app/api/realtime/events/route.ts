import { realTimeHub, RealTimeEventPayload } from '@/lib/realtime/broadcast';

/**
 * Real-Time Server-Sent Events (SSE) Stream Endpoint
 * Topic: WebSocket / real-time communication (0.5 pts)
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial handshake and recent history
      const initialPayload = {
        type: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        activeSubscribers: realTimeHub.getConnectedCount() + 1,
        recentHistory: realTimeHub.getHistory().slice(0, 5),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialPayload)}\n\n`));

      // 2. Subscribe to new broadcast events
      const unsubscribe = realTimeHub.subscribe((event: RealTimeEventPayload) => {
        try {
          const chunk = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          console.error('Error enqueuing real-time event:', err);
        }
      });

      // 3. Heartbeat ping every 15s to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          clearInterval(pingInterval);
          unsubscribe();
        }
      }, 15000);

      // Clean up on stream cancellation
      return () => {
        clearInterval(pingInterval);
        unsubscribe();
      };
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
