"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '../../../../../../components/shared/page-header';
import Card from '../../../../../../components/ui/card';
import StatusBadge from '../../../../../../components/workflow/status-badge';
import VerdictBadge from '../../../../../../components/workflow/verdict-badge';
import ConfidenceIndicator from '../../../../../../components/workflow/confidence-indicator';
import ClaimStatusTimeline from '../../../../../../components/workflow/claim-status-timeline';
import { useClaimQuery, useClaimEvidenceQuery } from '../../../../../../hooks/use-claims';
import { useVerdictQuery } from '../../../../../../hooks/use-verdicts';
import { useNotificationsQuery } from '../../../../../../hooks/use-notifications';
import { normalizeClaim } from '../../../../../../types/claims';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function extractClaimIdFromNotification(item: Record<string, unknown>): string {
  const metadata = asRecord(item.metadata);
  return (
    toStringValue(item.claimId) ||
    toStringValue(item.entityId) ||
    toStringValue(item.resourceId) ||
    toStringValue(metadata.claimId)
  );
}

export default function UserClaimDetailPage() {
  const params = useParams<{ id: string }>();
  const claimId = params.id;

  const claimQuery = useClaimQuery(claimId);
  const claim = claimQuery.data ? normalizeClaim(claimQuery.data as Record<string, unknown>) : null;

  const evidenceQuery = useClaimEvidenceQuery(claimId);
  const evidencePayload = asRecord((evidenceQuery.data as any)?.data);
  const evidenceItems = Array.isArray(evidencePayload.items)
    ? evidencePayload.items
    : Array.isArray((evidenceQuery.data as any)?.data)
      ? (evidenceQuery.data as any).data
      : [];

  const verdictQuery = useVerdictQuery(claimId);
  const verdict = verdictQuery.data ? asRecord(verdictQuery.data as Record<string, unknown>) : null;

  const notificationsQuery = useNotificationsQuery({ page: 1, pageSize: 100 } as any);
  const notificationsPayload = asRecord((notificationsQuery.data as any)?.data);
  const allNotifications = Array.isArray(notificationsPayload.items)
    ? notificationsPayload.items
    : Array.isArray((notificationsQuery.data as any)?.data)
      ? (notificationsQuery.data as any).data
      : [];

  const claimNotifications = useMemo(
    () => allNotifications.filter((n: any) => extractClaimIdFromNotification(asRecord(n)) === claimId),
    [allNotifications, claimId]
  );

  const evidenceSummary = useMemo(() => {
    let supports = 0;
    let contradicts = 0;
    let neutral = 0;
    for (const item of evidenceItems as Array<Record<string, unknown>>) {
      const stance = toStringValue(item.stance).toUpperCase();
      if (stance === 'SUPPORTS') supports += 1;
      else if (stance === 'CONTRADICTS') contradicts += 1;
      else neutral += 1;
    }
    return { total: evidenceItems.length, supports, contradicts, neutral };
  }, [evidenceItems]);

  if (claimQuery.isLoading || !claim) {
    return <div className="text-sm text-neutral-600">Loading claim details…</div>;
  }

  const verdictType = toStringValue(verdict?.verdictType ?? claim.verdict);
  const confidenceRaw = verdict?.confidenceScore ?? claim.confidence;
  const confidence = typeof confidenceRaw === 'number' ? confidenceRaw : Number(confidenceRaw);

  return (
    <div className="space-y-6">
      <PageHeader
        title={claim.title}
        subtitle="Transparent claim lifecycle and publication status for public trust visibility."
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={claim.status} />
            {verdictType && <VerdictBadge verdict={verdictType} />}
          </div>
          <p className="text-sm text-neutral-700 mt-4 whitespace-pre-line">{claim.statement}</p>
          <div className="text-xs text-neutral-500 mt-4">
            Submitted {claim.submittedAt ? new Date(claim.submittedAt).toLocaleString() : 'recently'}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium">Verdict transparency</h2>
          <div className="mt-3 text-sm text-neutral-700">
            <div>Verdict: {verdictType || 'Pending'}</div>
            <div className="mt-2">
              Confidence:{' '}
              {Number.isFinite(confidence) ? `${Math.round(confidence > 1 ? confidence : confidence * 100)}%` : 'Unavailable'}
            </div>
            <div className="mt-3">
              <ConfidenceIndicator value={Number.isFinite(confidence) ? (confidence > 1 ? confidence / 100 : confidence) : 0} />
            </div>
          </div>
        </Card>
      </div>

      <ClaimStatusTimeline events={claim.timeline} currentStatus={claim.status} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium">Evidence summary</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded border border-neutral-200 p-3">
              <div className="text-xs text-neutral-500">Total evidence</div>
              <div className="text-lg font-semibold">{evidenceSummary.total}</div>
            </div>
            <div className="rounded border border-neutral-200 p-3">
              <div className="text-xs text-neutral-500">Supports</div>
              <div className="text-lg font-semibold">{evidenceSummary.supports}</div>
            </div>
            <div className="rounded border border-neutral-200 p-3">
              <div className="text-xs text-neutral-500">Contradicts</div>
              <div className="text-lg font-semibold">{evidenceSummary.contradicts}</div>
            </div>
            <div className="rounded border border-neutral-200 p-3">
              <div className="text-xs text-neutral-500">Neutral</div>
              <div className="text-lg font-semibold">{evidenceSummary.neutral}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium">Notification history</h2>
          <div className="mt-3 space-y-2">
            {claimNotifications.length === 0 && <div className="text-sm text-neutral-600">No notifications for this claim yet.</div>}
            {claimNotifications.slice(0, 10).map((item: any, index: number) => {
              const record = asRecord(item);
              const title = toStringValue(record.title || record.type || 'Update');
              const message = toStringValue(record.message || record.description || 'Operational update available.');
              const createdAt = toStringValue(record.createdAt);
              return (
                <div key={toStringValue(record.id) || String(index)} className="rounded border border-neutral-200 p-3">
                  <div className="text-sm font-medium">{title}</div>
                  <div className="text-sm text-neutral-600 mt-1">{message}</div>
                  <div className="text-xs text-neutral-500 mt-2">{createdAt ? new Date(createdAt).toLocaleString() : 'Recent'}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/user/claims" className="text-sm underline">Back to my claims</Link>
          <Link href="/dashboard/user/notifications" className="text-sm underline">Open notifications</Link>
        </div>
      </Card>
    </div>
  );
}
