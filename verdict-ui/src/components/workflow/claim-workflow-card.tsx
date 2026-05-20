"use client";

import Button from '../ui/button';
import Card from '../ui/card';
import StatusBadge from './status-badge';
import VerdictBadge from './verdict-badge';
import ConfidenceIndicator from './confidence-indicator';
import ClaimStatusTimeline from './claim-status-timeline';
import WorkflowTransitionIndicator from './workflow-transition-indicator';
import type { ClaimTimelineEvent, ClaimWorkflowStatus } from '../../types/claims';

type Props = {
  status: ClaimWorkflowStatus;
  verdict?: string;
  confidence?: number;
  events: ClaimTimelineEvent[];
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

export default function ClaimWorkflowCard({
  status,
  verdict,
  confidence,
  events,
  onPrimaryAction,
  primaryActionLabel = 'Open workflow'
}: Props) {
  const statusSequence: ClaimWorkflowStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT', 'PUBLISHED', 'ARCHIVED'];
  const currentIndex = statusSequence.indexOf(status);
  const nextStatus = statusSequence[Math.min(statusSequence.length - 1, Math.max(0, currentIndex + 1))];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Workflow actions</h3>
          <p className="mt-1 text-sm text-neutral-600">Role-aware operational visibility for future workflow steps.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {verdict && <VerdictBadge verdict={verdict} />}
        </div>
      </div>

      <div className="mt-4">
        <ConfidenceIndicator value={typeof confidence === 'number' ? confidence / 100 : 0} />
      </div>

      <div className="mt-4">
        <WorkflowTransitionIndicator from={status} to={nextStatus} label="Future state" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={onPrimaryAction} disabled={!onPrimaryAction}>
          {primaryActionLabel}
        </Button>
        <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100" disabled>
          Review steps coming soon
        </Button>
      </div>

      <div className="mt-5">
        <ClaimStatusTimeline events={events} currentStatus={status} compact />
      </div>
    </Card>
  );
}
