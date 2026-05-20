/**
 * Notification Item
 * Individual notification display
 */

'use client';

import Link from 'next/link';
import type { Notification } from '../../stores/realtime.store';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const levelClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const level = notification.level || 'info';

  return (
    <div
      className={`${levelClasses[level]} border rounded-lg p-4 pointer-events-auto max-w-sm shadow-lg animate-in fade-in slide-in-from-right-full duration-300`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {notification.icon && <span className="text-lg mt-0.5">{notification.icon}</span>}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{notification.title}</h3>
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            {notification.action && (
              <Link
                href={notification.action.href}
                className="inline-block text-xs font-medium mt-2 underline hover:opacity-75 transition-opacity"
              >
                {notification.action.label} →
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
