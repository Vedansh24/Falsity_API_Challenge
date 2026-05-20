import type { VerdictHistoryEvent } from '../../types/review';

export default function ModerationTimeline({ events }: { events: VerdictHistoryEvent[] }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-sm font-medium text-neutral-900">{event.title}</div>
          <div className="mt-1 text-sm text-neutral-600">{event.description}</div>
        </div>
      ))}
    </div>
  );
}
