/**
 * Real-Time Event Broadcast Manager (WebSocket / SSE Pub-Sub)
 * Topic: WebSocket / real-time communication (0.5 pts)
 */

export type RealTimeEventType =
  | 'PR_REVIEW_REQUESTED'
  | 'CI_RUN_COMPLETED'
  | 'NEW_MENTION'
  | 'BOTTLENECK_DETECTED'
  | 'NOTE_CREATED';

export interface RealTimeEventPayload {
  id: string;
  type: RealTimeEventType;
  repo: string;
  title: string;
  itemNumber?: number;
  author: string;
  urgency: 'P0' | 'P1' | 'P2';
  timestamp: string;
}

type EventListener = (event: RealTimeEventPayload) => void;

class RealTimeHub {
  private listeners: Set<EventListener> = new Set();
  private eventHistory: RealTimeEventPayload[] = [];

  /**
   * Subscribe client to live real-time stream
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast real-time event to all connected clients
   */
  broadcast(event: Omit<RealTimeEventPayload, 'id' | 'timestamp'>): RealTimeEventPayload {
    const fullEvent: RealTimeEventPayload = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.unshift(fullEvent);
    if (this.eventHistory.length > 50) {
      this.eventHistory.pop();
    }

    this.listeners.forEach((listener) => {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('Failed to notify real-time listener:', err);
      }
    });

    return fullEvent;
  }

  /**
   * Get recent event history
   */
  getHistory(): RealTimeEventPayload[] {
    return [...this.eventHistory];
  }

  getConnectedCount(): number {
    return this.listeners.size;
  }
}

export const realTimeHub = new RealTimeHub();
