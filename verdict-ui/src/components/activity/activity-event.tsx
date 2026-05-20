/**
 * Activity Event
 * Individual event display
 */

'use client';

import Link from 'next/link';
import type { ActivityEvent } from '../../stores/realtime.store';

interface ActivityEventProps {
  activity: ActivityEvent;
}

export default function ActivityEvent({ activity }: ActivityEventProps) {
  const roleColors: Record<string, string> = {
    USER: 'bg-blue-100 text-blue-800',
    ANALYST: 'bg-purple-100 text-purple-800',
    REVIEWER: 'bg-amber-100 text-amber-800',
    ADMIN: 'bg-red-100 text-red-800'
  };

  const roleColor = roleColors[activity.userRole] || 'bg-gray-100 text-gray-800';

  return (
    <div className="flex gap-4">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5" />
        <div className="w-0.5 h-12 bg-gray-200" />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {activity.icon && <span className="text-base">{activity.icon}</span>}
              <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{activity.description}</p>

            {/* Metadata links */}
            {activity.metadata && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {activity.metadata.claimId && (
                  <Link
                    href={`/dashboard/claims/${activity.metadata.claimId}`}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    View Claim
                  </Link>
                )}
                {activity.metadata.investigationId && (
                  <Link
                    href={`/dashboard/investigations/${activity.metadata.investigationId}`}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    View Investigation
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Role badge */}
          <div className={`${roleColor} px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0`}>
            {activity.userRole}
          </div>
        </div>

        {/* Timestamp */}
        <time className="text-xs text-gray-500 mt-2 block">
          {formatTime(activity.timestamp)}
        </time>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
