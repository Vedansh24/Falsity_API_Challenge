/**
 * Realtime Hooks
 * Internal hooks for subscribing to realtime events
 * These are wrapped by domain-specific hooks
 */

import { useEffect, useState, useRef } from 'react';
import { useRealtime } from '../../providers/realtime-provider';
import type { RealtimeEvent } from './realtime-events';
import { RealtimeEventType } from './realtime-events';

/**
 * Subscribe to a specific realtime event
 * Returns the most recent event of that type
 */
export function useRealtimeEvent(eventType: RealtimeEventType | 'all'): RealtimeEvent | null {
  const { subscribe } = useRealtime();
  const [event, setEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    return subscribe(eventType, (newEvent) => {
      setEvent(newEvent);
    });
  }, [eventType, subscribe]);

  return event;
}

/**
 * Subscribe to multiple realtime events
 * Returns array of recent events
 */
export function useRealtimeEvents(
  eventTypes: RealtimeEventType[],
  limit: number = 50
): RealtimeEvent[] {
  const { subscribe } = useRealtime();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const eventsRef = useRef<RealtimeEvent[]>([]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    eventTypes.forEach((eventType) => {
      unsubscribers.push(
        subscribe(eventType, (newEvent) => {
          eventsRef.current = [newEvent, ...eventsRef.current].slice(0, limit);
          setEvents([...eventsRef.current]);
        })
      );
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [eventTypes, subscribe, limit]);

  return events;
}

/**
 * Subscribe to events for a specific claim
 */
export function useRealtimeClaimEvents(claimId: string | undefined): RealtimeEvent[] {
  const { subscribe } = useRealtime();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const eventsRef = useRef<RealtimeEvent[]>([]);

  useEffect(() => {
    if (!claimId) return;

    return subscribe('all', (event) => {
      if (event.claimId === claimId) {
        eventsRef.current = [event, ...eventsRef.current].slice(0, 100);
        setEvents([...eventsRef.current]);
      }
    });
  }, [claimId, subscribe]);

  return events;
}

/**
 * Subscribe to events for a specific investigation
 */
export function useRealtimeInvestigationEvents(
  investigationId: string | undefined
): RealtimeEvent[] {
  const { subscribe } = useRealtime();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const eventsRef = useRef<RealtimeEvent[]>([]);

  useEffect(() => {
    if (!investigationId) return;

    return subscribe('all', (event) => {
      if (event.investigationId === investigationId) {
        eventsRef.current = [event, ...eventsRef.current].slice(0, 100);
        setEvents([...eventsRef.current]);
      }
    });
  }, [investigationId, subscribe]);

  return events;
}

/**
 * Get realtime connection status
 */
export function useRealtimeStatus() {
  const { isConnected, isReconnecting } = useRealtime();

  return {
    isConnected,
    isReconnecting,
    status: isReconnecting ? 'reconnecting' : isConnected ? 'connected' : 'disconnected'
  };
}
