'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealTimeEventPayload } from '@/lib/realtime/broadcast';

export interface UseRealTimeReturn {
  isConnected: boolean;
  latestEvent: RealTimeEventPayload | null;
  events: RealTimeEventPayload[];
  triggerTestEvent: (type?: string, title?: string) => Promise<void>;
}

export function useRealTime(): UseRealTimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<RealTimeEventPayload | null>(null);
  const [events, setEvents] = useState<RealTimeEventPayload[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/realtime/events');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type !== 'CONNECTED') {
            setLatestEvent(parsed);
            setEvents((prev) => [parsed, ...prev.slice(0, 19)]);
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('SSE not supported or failed to initialize:', err);
    }

    return () => {
      eventSource?.close();
      setIsConnected(false);
    };
  }, []);

  const triggerTestEvent = useCallback(async (type = 'PR_REVIEW_REQUESTED', title = 'Live Pull Request Event') => {
    try {
      await fetch('/api/realtime/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title }),
      });
    } catch (e) {
      console.error('Failed to trigger test real-time event:', e);
    }
  }, []);

  return {
    isConnected,
    latestEvent,
    events,
    triggerTestEvent,
  };
}
