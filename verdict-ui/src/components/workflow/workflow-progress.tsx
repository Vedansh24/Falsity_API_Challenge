"use client";

import Card from '../ui/card';
import type { ClaimWorkflowStatus } from '../../types/claims';
import { CLAIM_WORKFLOW_STATUSES } from '../../types/claims';

type Props = {
  status: ClaimWorkflowStatus;
  confidence?: number;
};

export default function WorkflowProgress({ status, confidence }: Props) {
  const currentIndex = CLAIM_WORKFLOW_STATUSES.indexOf(status);
  const percent = Math.max(0, currentIndex >= 0 ? Math.round(((currentIndex + 1) / CLAIM_WORKFLOW_STATUSES.length) * 100) : 0);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Operational readiness</h3>
          <p className="mt-1 text-sm text-neutral-600">Claim lifecycle progress and publication readiness.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-neutral-900">{percent}%</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">Workflow complete</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-neutral-100">
          <div className="h-2 rounded-full bg-neutral-900 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CLAIM_WORKFLOW_STATUSES.map((item, index) => {
            const active = index <= currentIndex;
            return (
              <span
                key={item}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
              >
                {item.replaceAll('_', ' ')}
              </span>
            );
          })}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Confidence</dt>
          <dd className="mt-1 text-base font-semibold text-neutral-900">{typeof confidence === 'number' ? `${Math.round(confidence)}%` : 'Unavailable'}</dd>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Current state</dt>
          <dd className="mt-1 text-base font-semibold text-neutral-900">{status.replaceAll('_', ' ')}</dd>
        </div>
      </dl>
    </Card>
  );
}
