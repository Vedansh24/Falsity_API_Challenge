/**
 * Live Verdicts Hook
 * Subscribe to real-time verdict updates
 */

import { useEffect } from 'react';
import { useRealtimeEvents } from '../../lib/realtime/realtime-hooks';
import { RealtimeEventType } from '../../lib/realtime/realtime-events';
import { useNotificationStore, useActivityStore } from '../../stores/realtime.store';
import { useRole } from '../use-role';

export function useRealtimeLiveVerdicts() {
  const userRole = useRole();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addActivity = useActivityStore((s) => s.addActivity);

  const events = useRealtimeEvents([
    RealtimeEventType.VERDICT_COMPUTED,
    RealtimeEventType.VERDICT_READY,
    RealtimeEventType.VERDICT_APPROVED,
    RealtimeEventType.VERDICT_REJECTED,
    RealtimeEventType.VERDICT_PUBLISHED,
    RealtimeEventType.VERDICT_RECOMPUTED
  ]);

  useEffect(() => {
    events.forEach((event) => {
      switch (event.type) {
        case RealtimeEventType.VERDICT_COMPUTED:
        case RealtimeEventType.VERDICT_RECOMPUTED:
          addNotification({
            type: 'verdict_computed',
            title: 'Verdict Computed',
            message: `Verdict: ${event.payload.verdictType}`,
            icon: '⚖️',
            level: 'info',
            action: event.claimId
              ? {
                  label: 'Review',
                  href: `/dashboard/review/${event.claimId}`
                }
              : undefined
          });
          addActivity({
            type: 'verdict_computed',
            title: 'Verdict Computed',
            description: `Verdict type: ${event.payload.verdictType}`,
            userId: event.userId,
            userRole: event.userRole,
            category: 'verdicts',
            metadata: { claimId: event.claimId },
            icon: '⚖️'
          });
          break;

        case RealtimeEventType.VERDICT_READY:
          addNotification({
            type: 'verdict_ready',
            title: 'Verdict Ready for Review',
            message: 'A verdict is ready for reviewer approval',
            icon: '✅',
            level: 'success',
            action: event.claimId
              ? {
                  label: 'Review',
                  href: `/dashboard/review/${event.claimId}`
                }
              : undefined
          });
          addActivity({
            type: 'verdict_ready',
            title: 'Verdict Ready',
            description: 'Verdict is ready for review',
            userId: event.userId,
            userRole: event.userRole,
            category: 'verdicts',
            metadata: { claimId: event.claimId },
            icon: '✅'
          });
          break;

        case RealtimeEventType.VERDICT_APPROVED:
          if (userRole === 'REVIEWER' || userRole === 'ADMIN') {
            addNotification({
              type: 'verdict_approved',
              title: 'Verdict Approved',
              message: 'A verdict has been approved for publication',
              icon: '👍',
              level: 'success'
            });
          }
          addActivity({
            type: 'verdict_approved',
            title: 'Verdict Approved',
            description: 'Verdict approved for publication',
            userId: event.userId,
            userRole: event.userRole,
            category: 'verdicts',
            metadata: { claimId: event.claimId },
            icon: '👍'
          });
          break;

        case RealtimeEventType.VERDICT_REJECTED:
          addNotification({
            type: 'verdict_rejected',
            title: 'Verdict Rejected',
            message: 'A verdict has been rejected',
            icon: '❌',
            level: 'warning'
          });
          addActivity({
            type: 'verdict_rejected',
            title: 'Verdict Rejected',
            description: 'Verdict rejected',
            userId: event.userId,
            userRole: event.userRole,
            category: 'verdicts',
            metadata: { claimId: event.claimId },
            icon: '❌'
          });
          break;

        case RealtimeEventType.VERDICT_PUBLISHED:
          addNotification({
            type: 'verdict_published',
            title: 'Verdict Published',
            message: 'A verdict has been published',
            icon: '🚀',
            level: 'success',
            action: event.claimId
              ? {
                  label: 'View',
                  href: `/dashboard/verdicts/${event.claimId}`
                }
              : undefined
          });
          addActivity({
            type: 'verdict_published',
            title: 'Verdict Published',
            description: 'Verdict published to audience',
            userId: event.userId,
            userRole: event.userRole,
            category: 'verdicts',
            metadata: { claimId: event.claimId },
            icon: '🚀'
          });
          break;
      }
    });
  }, [events, addNotification, addActivity, userRole]);

  return events;
}
