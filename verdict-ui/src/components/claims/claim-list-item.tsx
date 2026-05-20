"use client";

import Link from 'next/link';
import Card from '../ui/card';
import StatusBadge from '../workflow/status-badge';
import VerdictBadge from '../workflow/verdict-badge';
import ConfidenceIndicator from '../workflow/confidence-indicator';
import type { ClaimViewModel } from '../../types/claims';
import ClaimsRowActions from './claims-row-actions';
import type { Role } from '../../config/roles';

type Props = {
  claim: ClaimViewModel;
  role?: Role | null;
};

export default function ClaimListItem({ claim, role }: Props) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={claim.status} />
              {claim.verdict && <VerdictBadge verdict={claim.verdict} />}
            </div>
            <Link href={`/dashboard/claims/${claim.publicSlug ?? claim.id}`} className="block text-lg font-semibold text-neutral-900 hover:underline">
              {claim.title}
            </Link>
            <p className="line-clamp-2 text-sm text-neutral-600">{claim.statement}</p>
          </div>
          <div className="hidden min-w-28 text-right text-xs text-neutral-500 sm:block">
            {claim.publishedAt ? <div>Published {new Date(claim.publishedAt).toLocaleDateString()}</div> : <div>Not published</div>}
            {claim.category && <div className="mt-1">{claim.category}</div>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Confidence</div>
            <ConfidenceIndicator value={typeof claim.confidence === 'number' ? claim.confidence / 100 : 0} />
          </div>
          <div className="text-sm text-neutral-600">
            <div className="text-xs uppercase tracking-wide text-neutral-500">Assigned</div>
            <div>{claim.assignedAnalyst ?? 'Unassigned'}</div>
          </div>
          <div className="text-sm text-neutral-600">
            <div className="text-xs uppercase tracking-wide text-neutral-500">Evidence</div>
            <div>{typeof claim.evidenceCount === 'number' ? claim.evidenceCount : '—'}</div>
          </div>
        </div>

        <ClaimsRowActions claimId={claim.id} claimSlug={claim.publicSlug} role={role} />
      </div>
    </Card>
  );
}
