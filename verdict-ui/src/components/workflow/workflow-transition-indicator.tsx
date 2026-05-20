"use client";

import Badge from '../ui/badge';
import type { ClaimWorkflowStatus } from '../../types/claims';

type Props = {
  from: ClaimWorkflowStatus;
  to: ClaimWorkflowStatus;
  label?: string;
};

export default function WorkflowTransitionIndicator({ from, to, label = 'Transition ready' }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
      <Badge className="bg-neutral-200 text-neutral-800">{from.replaceAll('_', ' ')}</Badge>
      <span aria-hidden="true">→</span>
      <Badge className="bg-neutral-900 text-white">{to.replaceAll('_', ' ')}</Badge>
      <span className="ml-1 text-xs uppercase tracking-wide text-neutral-500">{label}</span>
    </div>
  );
}
