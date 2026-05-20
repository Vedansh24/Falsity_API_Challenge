'use client';

import { Clock, AlertCircle, CheckCircle2, User, FileText } from 'lucide-react';
import type { InvestigationTimelineEvent } from '../../types/investigations';

interface InvestigationTimelineProps {
  events: InvestigationTimelineEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <FileText className="w-5 h-5" />,
  assigned: <User className="w-5 h-5" />,
  evidence_added: <CheckCircle2 className="w-5 h-5" />,
  evidence_requested: <AlertCircle className="w-5 h-5" />,
  status_changed: <Clock className="w-5 h-5" />,
  verdict_ready: <CheckCircle2 className="w-5 h-5" />,
  published: <CheckCircle2 className="w-5 h-5" />,
  archived: <FileText className="w-5 h-5" />
};

const EVENT_COLORS: Record<string, string> = {
  created: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  evidence_added: 'bg-green-100 text-green-700',
  evidence_requested: 'bg-yellow-100 text-yellow-700',
  status_changed: 'bg-gray-100 text-gray-700',
  verdict_ready: 'bg-teal-100 text-teal-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700'
};

export function InvestigationTimeline({ events }: InvestigationTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const color = EVENT_COLORS[event.type] || 'bg-gray-100 text-gray-700';
        const icon = EVENT_ICONS[event.type] || <Clock className="w-5 h-5" />;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${color}`}>{icon}</div>
              {!isLast && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                {event.date && <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>}
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
              {event.metadata && (
                <div className="text-xs text-gray-500 mt-2">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
