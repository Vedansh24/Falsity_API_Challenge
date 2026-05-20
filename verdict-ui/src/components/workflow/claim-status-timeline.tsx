"use client";

import Badge from '../ui/badge';
import Card from '../ui/card';
import type { ClaimTimelineEvent, ClaimWorkflowStatus } from '../../types/claims';
import { CLAIM_WORKFLOW_STATUSES } from '../../types/claims';

type Props = {
  events: ClaimTimelineEvent[];
  currentStatus?: ClaimWorkflowStatus;
  compact?: boolean;
};

const statusTone: Record<ClaimWorkflowStatus, string> = {
  DRAFT: 'bg-neutral-200 text-neutral-800',
  SUBMITTED: 'bg-sky-100 text-sky-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-900',
  NEEDS_MORE_EVIDENCE: 'bg-orange-100 text-orange-900',
  READY_FOR_VERDICT: 'bg-emerald-100 text-emerald-900',
  PUBLISHED: 'bg-teal-100 text-teal-900',
  ARCHIVED: 'bg-neutral-100 text-neutral-700'
};

export default function ClaimStatusTimeline({ events, currentStatus, compact = false }: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Workflow timeline</h3>
          <p className="mt-1 text-sm text-neutral-600">Status progression and operational readiness.</p>
        </div>
        {currentStatus && <Badge className={statusTone[currentStatus]}>{currentStatus.replaceAll('_', ' ')}</Badge>}
      </div>

      <ol className={`mt-4 ${compact ? 'space-y-3' : 'space-y-4'}`} aria-label="Claim workflow timeline">
        {CLAIM_WORKFLOW_STATUSES.map((status) => {
          const event = events.find((item) => item.status === status);
          const active = status === currentStatus;
          const completed = Boolean(event?.completed || event?.date || (currentStatus && CLAIM_WORKFLOW_STATUSES.indexOf(status) <= CLAIM_WORKFLOW_STATUSES.indexOf(currentStatus)));

          return (
            <li key={status} className="flex gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span className={`h-3 w-3 rounded-full border ${completed ? 'border-transparent bg-neutral-900' : 'border-neutral-300 bg-white'}`} />
                {status !== CLAIM_WORKFLOW_STATUSES[CLAIM_WORKFLOW_STATUSES.length - 1] && <span className="mt-1 h-full w-px bg-neutral-200" />}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">{event?.title ?? status.replaceAll('_', ' ')}</span>
                  <Badge className={statusTone[status]}>{status.replaceAll('_', ' ')}</Badge>
                  {active && <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Current</span>}
                </div>
                <p className="mt-1 text-sm text-neutral-600">{event?.description ?? 'Workflow checkpoint available for future operational steps.'}</p>
                {event?.date && <p className="mt-1 text-xs text-neutral-500">{new Date(event.date).toLocaleString()}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
