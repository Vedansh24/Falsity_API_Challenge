"use client";

import Link from 'next/link';
import PageHeader from '../../../../components/shared/page-header';
import Card from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import StatusBadge from '../../../../components/workflow/status-badge';
import VerdictBadge from '../../../../components/workflow/verdict-badge';
import { useClaimsQuery } from '../../../../hooks/use-claims';
import { useNotificationsQuery } from '../../../../hooks/use-notifications';
import { normalizeClaims } from '../../../../types/claims';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toDate(value: unknown): string {
  if (typeof value === 'string') return value;
  return '';
}

export default function UserWorkspacePage() {
  const claimsQuery = useClaimsQuery({ page: 1, pageSize: 50 } as any);
  const notificationsQuery = useNotificationsQuery({ page: 1, pageSize: 20 } as any);

  const claimsPayload = asRecord((claimsQuery.data as any)?.data);
  const claimItems = Array.isArray(claimsPayload.items) ? claimsPayload.items : [];
  const claims = normalizeClaims(claimItems as Array<Record<string, unknown>>);

  const notificationsPayload = asRecord((notificationsQuery.data as any)?.data);
  const notifications = Array.isArray(notificationsPayload.items)
    ? notificationsPayload.items
    : Array.isArray((notificationsQuery.data as any)?.data)
      ? (notificationsQuery.data as any).data
      : [];

  const submittedCount = claims.filter((c) => c.status === 'SUBMITTED').length;
  const inProgressCount = claims.filter((c) => ['UNDER_REVIEW', 'NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT'].includes(c.status)).length;
  const publishedCount = claims.filter((c) => c.status === 'PUBLISHED').length;

  const recentClaims = [...claims]
    .sort((a, b) => (new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()))
    .slice(0, 5);

  const publishedUpdates = [...claims]
    .filter((c) => c.publishedAt || c.status === 'PUBLISHED')
    .sort((a, b) => (new Date(b.publishedAt ?? b.updatedAt ?? 0).getTime() - new Date(a.publishedAt ?? a.updatedAt ?? 0).getTime()))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My workspace"
        subtitle="Track your submitted claims, monitor publication outcomes, and manage trust workflow transparency."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">Total claims</div>
          <div className="text-2xl font-semibold mt-1">{claims.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">Submitted</div>
          <div className="text-2xl font-semibold mt-1">{submittedCount}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">In progress</div>
          <div className="text-2xl font-semibold mt-1">{inProgressCount}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">Published</div>
          <div className="text-2xl font-semibold mt-1">{publishedCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Recent claims</h2>
            <Link href="/dashboard/user/claims" className="text-sm underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentClaims.length === 0 && <div className="text-sm text-neutral-600">No claims yet.</div>}
            {recentClaims.map((claim) => (
              <div key={claim.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/dashboard/user/claims/${claim.id}`} className="font-medium hover:underline">
                      {claim.title}
                    </Link>
                    <div className="text-xs text-neutral-500 mt-1">
                      Submitted {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium">Quick actions</h2>
          <div className="mt-3 space-y-2">
            <Link href="/dashboard/user/claims/new" className="block">
              <Button className="w-full">Submit new claim</Button>
            </Link>
            <Link href="/dashboard/user/notifications" className="block">
              <Button variant="outline" className="w-full">Open notifications</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-medium">Published verdict updates</h2>
          <div className="mt-4 space-y-3">
            {publishedUpdates.length === 0 && <div className="text-sm text-neutral-600">No published updates yet.</div>}
            {publishedUpdates.map((claim) => (
              <div key={claim.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/dashboard/user/claims/${claim.id}`} className="font-medium hover:underline">
                      {claim.title}
                    </Link>
                    <div className="text-xs text-neutral-500 mt-1">
                      {claim.publishedAt ? `Published ${new Date(claim.publishedAt).toLocaleDateString()}` : 'Published'}
                    </div>
                  </div>
                  {claim.verdict ? <VerdictBadge verdict={claim.verdict} /> : <StatusBadge status={claim.status} />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Recent notifications</h2>
            <Link href="/dashboard/user/notifications" className="text-sm underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 && <div className="text-sm text-neutral-600">You're all caught up.</div>}
            {notifications.slice(0, 5).map((item: any, idx: number) => (
              <div key={String(item.id ?? idx)} className="rounded-lg border border-neutral-200 p-3">
                <div className="text-sm font-medium">{String(item.title ?? item.type ?? 'Update')}</div>
                <div className="text-sm text-neutral-600 mt-1">{String(item.message ?? item.description ?? 'Operational update available.')}</div>
                <div className="text-xs text-neutral-500 mt-2">
                  {toDate(item.createdAt) ? new Date(toDate(item.createdAt)).toLocaleString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
