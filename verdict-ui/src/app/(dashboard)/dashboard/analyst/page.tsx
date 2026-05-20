'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import PageHeader from '../../../../components/shared/page-header';
import Card from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import Badge from '../../../../components/ui/badge';
import { useInvestigationsQuery } from '../../../../hooks/use-investigations';
import { useNotificationsQuery } from '../../../../hooks/use-notifications';
import { useAuthState } from '../../../../hooks/use-auth';
import { normalizeInvestigations } from '../../../../types/investigations';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export default function AnalystWorkspaceHomePage() {
  const { user } = useAuthState();
  const investigationsQuery = useInvestigationsQuery({ page: 1, pageSize: 100 } as any);
  const notificationsQuery = useNotificationsQuery({ page: 1, pageSize: 50 } as any);

  const assigned = useMemo(() => {
    const raw = asRecord((investigationsQuery.data as any)?.data);
    const list = normalizeInvestigations((raw.items as any[]) ?? []);
    if (!user?.id) return list;
    return list.filter((item) => item.assignedAnalystId === user.id || item.assignedAnalyst?.toLowerCase() === user.name?.toLowerCase());
  }, [investigationsQuery.data, user?.id, user?.name]);

  const readyForReview = assigned.filter((item) => item.status === 'READY_FOR_REVIEW').length;
  const inProgress = assigned.filter((item) => item.status === 'IN_PROGRESS').length;
  const awaitingEvidence = assigned.filter((item) => item.status === 'AWAITING_EVIDENCE').length;

  const notificationsPayload = asRecord((notificationsQuery.data as any)?.data);
  const notifications = Array.isArray(notificationsPayload.items) ? notificationsPayload.items : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyst workspace"
        subtitle="Investigate assigned claims, assess evidence quality, and prepare verdict-ready submissions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="text-sm text-neutral-600">Assigned cases</div>
          <div className="mt-2 text-3xl font-semibold text-neutral-900">{assigned.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">In progress</div>
          <div className="mt-2 text-3xl font-semibold text-blue-700">{inProgress}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">Needs evidence follow-up</div>
          <div className="mt-2 text-3xl font-semibold text-amber-700">{awaitingEvidence}</div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-600">Ready for reviewer handoff</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">{readyForReview}</div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">My active investigations</h2>
              <p className="text-sm text-neutral-600">Prioritized by latest workflow activity.</p>
            </div>
            <Link href="/dashboard/analyst/investigations">
              <Button variant="outline">Open queue</Button>
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {investigationsQuery.isLoading && <div className="text-sm text-neutral-600">Loading assignments...</div>}
            {!investigationsQuery.isLoading && assigned.length === 0 && (
              <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                No investigations are currently assigned to you.
              </div>
            )}

            {!investigationsQuery.isLoading && assigned.slice(0, 5).map((item) => (
              <Link key={item.id} href={`/dashboard/analyst/investigations/${item.id}`} className="block">
                <div className="rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Claim {item.claimId}</div>
                      <div className="text-xs text-neutral-500">Investigation {item.id}</div>
                    </div>
                    <Badge className="bg-neutral-100 text-neutral-800">{item.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">Evidence sources: {item.evidenceCount}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-neutral-900">Recent notifications</h2>
            <Link href="/dashboard/analyst/notifications" className="text-xs underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {notificationsQuery.isLoading && <div className="text-sm text-neutral-600">Loading updates...</div>}
            {!notificationsQuery.isLoading && notifications.length === 0 && (
              <div className="text-sm text-neutral-600">No recent updates.</div>
            )}
            {!notificationsQuery.isLoading && notifications.slice(0, 4).map((item: any, index: number) => {
              const record = asRecord(item);
              const title = String(record.title || record.type || 'Operational update');
              const createdAt = typeof record.createdAt === 'string' ? new Date(record.createdAt).toLocaleString() : 'Recent';

              return (
                <div key={String(record.id || index)} className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-sm font-medium text-neutral-900">{title}</div>
                  <div className="mt-1 text-xs text-neutral-500">{createdAt}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
