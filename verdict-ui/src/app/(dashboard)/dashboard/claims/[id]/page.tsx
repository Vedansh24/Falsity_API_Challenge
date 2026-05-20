"use client";

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Button from '../../../../../components/ui/button';
import VerdictSummaryCard from '../../../../../components/public/verdict-summary-card';
import EvidencePreviewCard from '../../../../../components/public/evidence-preview-card';
import PublicTimeline from '../../../../../components/public/public-timeline';
import ClaimStatusTimeline from '../../../../../components/workflow/claim-status-timeline';
import WorkflowProgress from '../../../../../components/workflow/workflow-progress';
import ClaimWorkflowCard from '../../../../../components/workflow/claim-workflow-card';
import StatusBadge from '../../../../../components/workflow/status-badge';
import VerdictBadge from '../../../../../components/workflow/verdict-badge';
import ConfidenceIndicator from '../../../../../components/workflow/confidence-indicator';
import ClaimsLoading from '../../../../../components/claims/claims-loading';
import { useClaimEvidenceQuery, useClaimQuery } from '../../../../../hooks/use-claims';
import { useRole } from '../../../../../hooks/use-role';
import { useClaimsQuery } from '../../../../../hooks/use-claims';
import { normalizeClaim, normalizeClaims } from '../../../../../types/claims';


export default function DashboardClaimDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const role = useRole();
  const claimId = params.id;

  const claimQuery = useClaimQuery(claimId);
  const claim = claimQuery.data ? normalizeClaim(claimQuery.data as Record<string, unknown>) : null;
  const evidenceQuery = useClaimEvidenceQuery(claimId);
  const evidence = (evidenceQuery.data as any)?.data ?? [];

  const relatedQuery = useClaimsQuery(
    useMemo(
      () => ({
        page: 1,
        pageSize: 8,
        filters: {
          category: claim?.category || undefined,
          status: claim?.status || undefined
        }
      }),
      [claim?.category, claim?.status]
    ) as any
  );
  const relatedPayload = (relatedQuery.data as any)?.data;
  const relatedClaims = normalizeClaims(relatedPayload?.items ?? []).filter((item) => item.id !== claim?.id).slice(0, 4);

  if (claimQuery.isLoading || !claim) {
    return <ClaimsLoading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={claim.title}
        subtitle="Workflow-ready claim detail foundation with operational visibility and future review hooks."
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={claim.status} />
                {claim.verdict && <VerdictBadge verdict={claim.verdict} />}
              </div>
              <div className="space-y-1">
                <div className="text-sm text-neutral-500">Claim ID: {claim.id}</div>
                <p className="text-base text-neutral-700">{claim.statement}</p>
              </div>
            </div>
            <div className="text-right text-sm text-neutral-600">
              <div>Category: {claim.category ?? 'Uncategorized'}</div>
              <div>Assigned analyst: {claim.assignedAnalyst ?? 'Unassigned'}</div>
              <div>Assigned reviewer: {claim.assignedReviewer ?? 'Unassigned'}</div>
              <div>Published: {claim.publishedAt ? new Date(claim.publishedAt).toLocaleDateString() : 'Not published'}</div>
            </div>
          </div>
        </Card>

        <WorkflowProgress status={claim.status} confidence={claim.confidence} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ClaimWorkflowCard status={claim.status} verdict={claim.verdict} confidence={claim.confidence} events={claim.timeline} />

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Verdict summary</h3>
                <p className="mt-1 text-sm text-neutral-600">Current operational verdict context and confidence posture.</p>
              </div>
              {claim.confidence !== undefined && <ConfidenceIndicator value={claim.confidence / 100} />}
            </div>
            <div className="mt-4">
              <VerdictSummaryCard verdict={{ verdict: claim.verdict, confidence: claim.confidence, evidenceCount: claim.evidenceCount }} />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Evidence preview</h3>
            <p className="mt-1 text-sm text-neutral-600">Operational preview only. Evidence workflow remains out of scope for this phase.</p>
            <div className="mt-4 space-y-3">
              {evidenceQuery.isLoading && <div className="text-sm text-neutral-600">Loading evidence...</div>}
              {!evidenceQuery.isLoading && evidence.length === 0 && <div className="text-sm text-neutral-600">No evidence records available.</div>}
              {!evidenceQuery.isLoading && evidence.slice(0, 3).map((item: any) => <EvidencePreviewCard key={item.id} evidence={item} />)}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Activity timeline</h3>
            <div className="mt-4">
              <PublicTimeline events={claim.timeline.map((event) => ({ id: event.id, title: event.title, description: event.description, date: event.date ?? claim.updatedAt ?? claim.createdAt ?? new Date().toISOString() }))} />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Claim history</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Created</div>
                <div className="mt-1">{claim.createdAt ? new Date(claim.createdAt).toLocaleString() : 'Unavailable'}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Last updated</div>
                <div className="mt-1">{claim.updatedAt ? new Date(claim.updatedAt).toLocaleString() : 'Unavailable'}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Submitted</div>
                <div className="mt-1">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleString() : 'Not submitted'}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Archived</div>
                <div className="mt-1">{claim.archivedAt ? new Date(claim.archivedAt).toLocaleString() : 'Not archived'}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Metadata</h3>
            <dl className="mt-4 space-y-3 text-sm text-neutral-700">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Source URL</dt>
                <dd className="mt-1 break-all">{claim.sourceUrl ?? 'Unavailable'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Tags</dt>
                <dd className="mt-1">{claim.tags.length > 0 ? claim.tags.join(', ') : 'No tags'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Confidence</dt>
                <dd className="mt-1">{typeof claim.confidence === 'number' ? `${Math.round(claim.confidence)}%` : 'Unavailable'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Status</dt>
                <dd className="mt-1">{claim.status}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Assigned reviewer</dt>
                <dd className="mt-1">{claim.assignedReviewer ?? 'Unassigned'}</dd>
              </div>
            </dl>
          </Card>

          <ClaimStatusTimeline events={claim.timeline} currentStatus={claim.status} compact />

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Workflow actions</h3>
            <p className="mt-1 text-sm text-neutral-600">Role-aware action scaffolding for future workflow transitions.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => router.back()}>
                Back to queue
              </Button>
              <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100" disabled>
                {role === 'ADMIN' ? 'Admin visibility' : role === 'REVIEWER' ? 'Reviewer visibility' : role === 'ANALYST' ? 'Analyst visibility' : 'User visibility'}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Related claims</h3>
            <div className="mt-4 space-y-3">
              {relatedClaims.length === 0 && <div className="text-sm text-neutral-600">No related claims found.</div>}
              {relatedClaims.map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                      <div className="text-xs text-neutral-500">{item.category ?? 'Uncategorized'}</div>
                    </div>
                    <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100" onClick={() => router.push(`/dashboard/claims/${item.publicSlug ?? item.id}`)}>
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
