/**
 * Activity Stream
 * Stream container for activity events
 */

'use client';

import ActivityEventComponent from './activity-event';
import type { ActivityEvent } from '../../stores/realtime.store';

interface ActivityStreamProps {
  activities: ActivityEvent[];
}

export default function ActivityStream({ activities }: ActivityStreamProps) {
  // Group activities by date
  const groupedByDate = activities.reduce(
    (acc, activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    },
    {} as Record<string, ActivityEvent[]>
  );

  const dates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-8">
      {dates.map((date) => (
        <div key={date}>
          <div className="text-sm font-semibold text-gray-900 mb-4">{date}</div>
          <div className="space-y-3">
            {groupedByDate[date].map((activity) => (
              <ActivityEventComponent key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
