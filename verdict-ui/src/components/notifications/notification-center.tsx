/**
 * Notification Center
 * Main notification UI component
 */

'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '../../stores/realtime.store';
import NotificationItem from './notification-item';

interface NotificationCenterProps {
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoCloseDuration?: number;
}

export default function NotificationCenter({
  maxNotifications = 5,
  position = 'top-right',
  autoCloseDuration = 5000
}: NotificationCenterProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  // Auto-close notifications after duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.slice(0, maxNotifications).forEach((notif) => {
      if (autoCloseDuration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notif.id);
        }, autoCloseDuration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, maxNotifications, autoCloseDuration, removeNotification]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 pointer-events-none`}>
      {notifications.slice(0, maxNotifications).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
