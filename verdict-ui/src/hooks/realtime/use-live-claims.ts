/**
 * Live Claims Hook
 * Subscribe to real-time claim updates
 */

import { useEffect } from 'react';
import { useRealtimeEvents } from '../../lib/realtime/realtime-hooks';
import { RealtimeEventType } from '../../lib/realtime/realtime-events';
import { useNotificationStore, useActivityStore } from '../../stores/realtime.store';

export function useRealTimeLiveClaims() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addActivity = useActivityStore((s) => s.addActivity);

  const events = useRealtimeEvents([
    RealtimeEventType.CLAIM_CREATED,
    RealtimeEventType.CLAIM_UPDATED,
    RealtimeEventType.CLAIM_ASSIGNED,
    RealtimeEventType.CLAIM_STATUS_CHANGED,
    RealtimeEventType.CLAIM_ARCHIVED
  ]);

  useEffect(() => {
    events.forEach((event) => {
      switch (event.type) {
        case RealtimeEventType.CLAIM_CREATED:
          addNotification({
            type: 'claim_created',
            title: 'New Claim',
            message: event.payload.statement || 'A new claim has been created',
            icon: '📝',
            level: 'info'
          });
          addActivity({
            type: 'claim_created',
            title: 'Claim Created',
            description: `New claim: ${event.payload.statement}`,
            userId: event.userId,
            userRole: event.userRole,
            category: 'claims',
            icon: '📝'
          });
          break;

        case RealtimeEventType.CLAIM_ASSIGNED:
          addNotification({
            type: 'claim_assigned',
            title: 'Claim Assigned',
            message: `Claim assigned to ${event.payload.assignedTo}`,
            icon: '👤',
            level: 'info'
          });
          addActivity({
            type: 'claim_assigned',
            title: 'Claim Assigned',
            description: `Assigned to ${event.payload.assignedTo}`,
            userId: event.userId,
            userRole: event.userRole,
            category: 'claims',
            metadata: { claimId: event.claimId },
            icon: '👤'
          });
          break;

        case RealtimeEventType.CLAIM_STATUS_CHANGED:
          addNotification({
            type: 'claim_status_changed',
            title: 'Claim Status Updated',
            message: `Status changed from ${event.payload.oldStatus} to ${event.payload.newStatus}`,
            icon: '🔄',
            level: 'info'
          });
          addActivity({
            type: 'claim_status_changed',
            title: 'Claim Status Changed',
            description: `${event.payload.oldStatus} → ${event.payload.newStatus}`,
            userId: event.userId,
            userRole: event.userRole,
            category: 'claims',
            metadata: { claimId: event.claimId },
            icon: '🔄'
          });
          break;

        case RealtimeEventType.CLAIM_ARCHIVED:
          addNotification({
            type: 'claim_archived',
            title: 'Claim Archived',
            message: 'A claim has been archived',
            icon: '📦',
            level: 'info'
          });
          addActivity({
            type: 'claim_archived',
            title: 'Claim Archived',
            description: 'Claim has been archived',
            userId: event.userId,
            userRole: event.userRole,
            category: 'claims',
            icon: '📦'
          });
          break;
      }
    });
  }, [events, addNotification, addActivity]);

  return events;
}
