/**
 * Live Notifications Hook
 * Subscribe to notification events
 */

import { useRealtimeEvents } from '../../lib/realtime/realtime-hooks';
import { EVENT_CATEGORIES } from '../../lib/realtime/realtime-events';

export function useRealtimeLiveNotifications() {
  // Subscribe to all notification-relevant events
  const allNotifiableEvents = [
    ...EVENT_CATEGORIES.CLAIMS,
    ...EVENT_CATEGORIES.EVIDENCE,
    ...EVENT_CATEGORIES.VERDICTS,
    ...EVENT_CATEGORIES.INVESTIGATIONS,
    ...EVENT_CATEGORIES.MODERATION
  ];

  const events = useRealtimeEvents(allNotifiableEvents, 100);

  return {
    events,
    count: events.length,
    recentNotifications: events.slice(0, 10)
  };
}
