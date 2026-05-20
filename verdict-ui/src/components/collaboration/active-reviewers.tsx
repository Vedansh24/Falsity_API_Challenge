/**
 * Active Reviewers
 * Show who is currently reviewing
 */

'use client';

import { usePresenceStore } from '../../stores/realtime.store';

interface ActiveReviewersProps {
  claimId?: string;
  investigationId?: string;
  maxDisplay?: number;
}

export default function ActiveReviewers({
  claimId,
  investigationId,
  maxDisplay = 3
}: ActiveReviewersProps) {
  const activeUsers = usePresenceStore((s) =>
    claimId
      ? s.getActiveUsersOnPage(`/dashboard/review/${claimId}`)
      : investigationId
        ? s.getActiveUsersOnPage(`/dashboard/investigations/${investigationId}`)
        : s.getActiveUsers()
  );

  const displayUsers = activeUsers.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, activeUsers.length - maxDisplay);

  if (displayUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">Active:</span>
      <div className="flex items-center gap-1">
        {displayUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900"
            title={`${user.userName} (${user.userRole})`}
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="font-medium">{user.userName}</span>
          </div>
        ))}
        {hiddenCount > 0 && (
          <span className="text-xs text-gray-600 px-2">+{hiddenCount} more</span>
        )}
      </div>
    </div>
  );
}
