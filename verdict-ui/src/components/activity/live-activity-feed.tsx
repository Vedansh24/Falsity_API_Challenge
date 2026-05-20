/**
 * Live Activity Feed
 * Main activity feed component
 */

'use client';

import { useActivityStore } from '../../stores/realtime.store';
import ActivityStream from './activity-stream';

interface LiveActivityFeedProps {
  maxActivities?: number;
  category?: string;
  userId?: string;
  title?: string;
}

export default function LiveActivityFeed({
  maxActivities = 50,
  category,
  userId,
  title = 'Activity Feed'
}: LiveActivityFeedProps) {
  let activities = useActivityStore((s) => s.activities);

  // Filter by category if provided
  if (category) {
    activities = useActivityStore((s) => s.getActivitiesByCategory(category));
  }

  // Filter by user if provided
  if (userId) {
    activities = useActivityStore((s) => s.getActivitiesByUser(userId));
  }

  const displayActivities = activities.slice(0, maxActivities);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {displayActivities.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">{displayActivities.length} activities</p>
        )}
      </div>

      {displayActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No activities yet</p>
        </div>
      ) : (
        <ActivityStream activities={displayActivities} />
      )}
    </div>
  );
}
