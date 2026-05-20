/**
 * Live Activity Hook
 * Subscribe to activity feed events
 */

import { useRealtimeEvents } from '../../lib/realtime/realtime-hooks';
import { EVENT_CATEGORIES } from '../../lib/realtime/realtime-events';

export function useRealtimeLiveActivity() {
  // Subscribe to all activity-relevant events
  const allActivityEvents = [
    ...EVENT_CATEGORIES.CLAIMS,
    ...EVENT_CATEGORIES.EVIDENCE,
    ...EVENT_CATEGORIES.VERDICTS,
    ...EVENT_CATEGORIES.INVESTIGATIONS,
    ...EVENT_CATEGORIES.MODERATION
  ];

  const events = useRealtimeEvents(allActivityEvents, 200);

  return {
    activities: events.map((event) => ({
      id: `${event.timestamp}_${event.type}`,
      type: event.type,
      timestamp: event.timestamp,
      userId: event.userId,
      userRole: event.userRole,
      payload: event.payload
    })),
    count: events.length
  };
}
