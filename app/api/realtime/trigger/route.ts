import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { BadRequestError } from '@/lib/errors/AppError';
import { realTimeHub, RealTimeEventType } from '@/lib/realtime/broadcast';

/**
 * Trigger Real-Time Broadcast Event
 * Topic: WebSocket / real-time communication (0.5 pts)
 */
export const POST = withErrorHandler(async (req: Request) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const {
    type = 'PR_REVIEW_REQUESTED',
    repo = 'parveendhaka72/Gittower',
    title = 'Fix Memory Leak in Production WebSocket Gateway',
    itemNumber = 104,
    author = 'lead_architect',
    urgency = 'P0',
  } = body;

  const validTypes: RealTimeEventType[] = [
    'PR_REVIEW_REQUESTED',
    'CI_RUN_COMPLETED',
    'NEW_MENTION',
    'BOTTLENECK_DETECTED',
    'NOTE_CREATED',
  ];

  if (!validTypes.includes(type)) {
    throw new BadRequestError(`Invalid event type. Must be one of: ${validTypes.join(', ')}`);
  }

  const emittedEvent = realTimeHub.broadcast({
    type,
    repo,
    title,
    itemNumber,
    author,
    urgency,
  });

  return jsonResponse({
    message: 'Event broadcasted to all connected real-time clients',
    event: emittedEvent,
    subscribersNotified: realTimeHub.getConnectedCount(),
  }, 201);
});
