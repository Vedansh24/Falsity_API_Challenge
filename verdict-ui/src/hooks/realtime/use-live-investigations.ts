/**
 * Live Investigations Hook
 * Subscribe to real-time investigation updates
 */

import { useEffect } from 'react';
import { useRealtimeEvents } from '../../lib/realtime/realtime-hooks';
import { RealtimeEventType } from '../../lib/realtime/realtime-events';
import { useNotificationStore, useActivityStore } from '../../stores/realtime.store';

export function useRealtimeLiveInvestigations() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addActivity = useActivityStore((s) => s.addActivity);

  const events = useRealtimeEvents([
    RealtimeEventType.INVESTIGATION_STARTED,
    RealtimeEventType.INVESTIGATION_UPDATED,
    RealtimeEventType.INVESTIGATION_COMPLETED
  ]);

  useEffect(() => {
    events.forEach((event) => {
      switch (event.type) {
        case RealtimeEventType.INVESTIGATION_STARTED:
          addNotification({
            type: 'investigation_started',
            title: 'Investigation Started',
            message: 'A new investigation has started',
            icon: '🔍',
            level: 'info',
            action: event.investigationId
              ? {
                  label: 'View',
                  href: `/dashboard/investigations/${event.investigationId}`
                }
              : undefined
          });
          addActivity({
            type: 'investigation_started',
            title: 'Investigation Started',
            description: 'New investigation initiated',
            userId: event.userId,
            userRole: event.userRole,
            category: 'investigations',
            metadata: { investigationId: event.investigationId },
            icon: '🔍'
          });
          break;

        case RealtimeEventType.INVESTIGATION_UPDATED:
          addNotification({
            type: 'investigation_updated',
            title: 'Investigation Updated',
            message: 'An investigation has been updated',
            icon: '🔄',
            level: 'info'
          });
          addActivity({
            type: 'investigation_updated',
            title: 'Investigation Updated',
            description: 'Investigation has been updated',
            userId: event.userId,
            userRole: event.userRole,
            category: 'investigations',
            metadata: { investigationId: event.investigationId },
            icon: '🔄'
          });
          break;

        case RealtimeEventType.INVESTIGATION_COMPLETED:
          addNotification({
            type: 'investigation_completed',
            title: 'Investigation Completed',
            message: 'An investigation has been completed',
            icon: '✅',
            level: 'success'
          });
          addActivity({
            type: 'investigation_completed',
            title: 'Investigation Completed',
            description: 'Investigation completed',
            userId: event.userId,
            userRole: event.userRole,
            category: 'investigations',
            metadata: { investigationId: event.investigationId },
            icon: '✅'
          });
          break;
      }
    });
  }, [events, addNotification, addActivity]);

  return events;
}
