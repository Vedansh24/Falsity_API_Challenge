'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../../../../components/ui/button';
import Card from '../../../../../components/ui/card';
import { useInvestigationQuery } from '../../../../../hooks/use-investigations';
import { useClaimQuery, useClaimEvidenceQuery } from '../../../../../hooks/use-claims';
import { EvidenceList } from '../../../../../components/evidence/evidence-list';
import { InvestigationTimeline } from '../../../../../components/investigation-timeline/investigation-timeline';
import { VerdictReadinessCard } from '../../../../../components/verdict/verdict-readiness-card';
import { WorkflowActionButtons } from '../../../../../components/workflow/workflow-action-buttons';
import { normalizeInvestigation, normalizeEvidenceList } from '../../../../../types/investigations';
import { normalizeClaim } from '../../../../../types/claims';
import Badge from '../../../../../components/ui/badge';
import { SectionErrorBoundary } from '../../../../../components/system/section-error-boundary';
import StaleDataWarning from '../../../../../components/system/stale-data-warning';
import EmptyState from '../../../../../components/system/empty-state';
import { useUiStore } from '../../../../../stores/ui.store';
import { useRealtimeStatus } from '../../../../../lib/realtime/realtime-hooks';

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investigationId = params.id as string;

  const splitPercent = useUiStore((s) => s.workspacePreferences.investigationSplitPercent);
  const activeTab = useUiStore((s) => s.workspacePreferences.investigationActiveTab);
  const setWorkspacePreferences = useUiStore((s) => s.setWorkspacePreferences);

  const { isConnected } = useRealtimeStatus();
  const openedAt = useRef(Date.now());
  const [minutesOpen, setMinutesOpen] = useState(0);

  useEffect(() => {
    const tick = () => setMinutesOpen(Math.floor((Date.now() - openedAt.current) / 60_000));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const investigationQuery = useInvestigationQuery(investigationId, {
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true
  });
  const investigation = investigationQuery.data?.data ? normalizeInvestigation(investigationQuery.data.data as never) : null;

  const claimQuery = useClaimQuery(investigation?.claimId, {
    staleTime: 30_000,
    refetchOnWindowFocus: true
  });
  const claim = claimQuery.data?.data ? normalizeClaim(claimQuery.data.data as never) : null;

  const evidenceQuery = useClaimEvidenceQuery(investigation?.claimId, undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true
  });
  const evidence = evidenceQuery.data?.data ? normalizeEvidenceList(evidenceQuery.data.data as never) : [];

  const isLoading = investigationQuery.isLoading || claimQuery.isLoading || evidenceQuery.isLoading;
  const isError = investigationQuery.isError || claimQuery.isError || evidenceQuery.isError;

  const refetchAll = useCallback(() => {
    void investigationQuery.refetch();
    void claimQuery.refetch();
    void evidenceQuery.refetch();
  }, [investigationQuery, claimQuery, evidenceQuery]);

  const lastUpdatedAt = useMemo(() => {
    const times = [investigationQuery.dataUpdatedAt, claimQuery.dataUpdatedAt, evidenceQuery.dataUpdatedAt].filter(Boolean);
    return times.length ? Math.min(...times) : undefined;
  }, [investigationQuery.dataUpdatedAt, claimQuery.dataUpdatedAt, evidenceQuery.dataUpdatedAt]);

  if (isError) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Failed to load investigation</p>
            <p className="mt-1 text-sm text-red-700">Please try again or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !investigation || !claim) {
    return (
      <div className="space-y-6">
        <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="space-y-3">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />
          <div className="h-20 animate-pulse rounded bg-gray-100 motion-reduce:animate-none" />
          <div className="h-40 animate-pulse rounded bg-gray-100 motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div aria-live="polite" className="sr-only">
        {claim.status.replace(/_/g, ' ')}
      </div>

      <StaleDataWarning
        lastUpdatedAt={lastUpdatedAt}
        isRealtimeDown={!isConnected}
        minutesWorkspaceOpen={minutesOpen}
        onRefresh={refetchAll}
      />

      <div className="flex items-center gap-2">
        <Link href="/dashboard/investigations">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Investigations
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">{investigation.id}</span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-xl font-semibold text-gray-900">{claim.title}</h1>
            <p className="mb-3 text-sm text-gray-600">{claim.statement}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={claim.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {claim.status.replace(/_/g, ' ')}
              </Badge>
              {claim.verdict ? <Badge className="bg-purple-100 text-purple-800">{claim.verdict.replace(/_/g, ' ')}</Badge> : null}
              {claim.category ? <Badge className="bg-gray-100 text-gray-800">{claim.category}</Badge> : null}
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="mb-1 text-sm text-gray-600">ID</div>
            <div className="break-all font-mono text-xs text-gray-900">{claim.id}</div>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          Panel split
          <input
            type="range"
            min={50}
            max={75}
            value={splitPercent}
            onChange={(e) => setWorkspacePreferences({ investigationSplitPercent: Number(e.target.value) })}
            aria-valuemin={50}
            aria-valuemax={75}
            aria-valuenow={splitPercent}
          />
        </label>
      </div>

      <div role="tablist" aria-label="Investigation workspace" className="flex gap-2 border-b border-gray-200 pb-2">
        {(['evidence', 'timeline', 'comments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeTab === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            onClick={() => setWorkspacePreferences({ investigationActiveTab: tab })}
          >
            {tab === 'evidence' ? 'Evidence' : tab === 'timeline' ? 'Timeline' : 'Comments'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 space-y-6" style={{ flex: `${splitPercent} 1 0%` }}>
          {activeTab === 'evidence' ? (
            <Card className="p-6" id="investigation-panel-evidence" tabIndex={-1}>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Evidence workspace</h2>
              <SectionErrorBoundary title="Evidence workspace">
                <EvidenceList
                  evidence={evidence}
                  loading={evidenceQuery.isLoading}
                  error={evidenceQuery.isError ? 'Failed to load evidence' : null}
                  onRetry={() => void evidenceQuery.refetch()}
                />
              </SectionErrorBoundary>
              <button type="button" id="investigation-add-evidence" className="sr-only">
                Add evidence shortcut target
              </button>
            </Card>
          ) : null}

          {activeTab === 'timeline' ? (
            <Card className="p-6" id="investigation-panel-timeline" tabIndex={-1}>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Investigation timeline</h2>
              <SectionErrorBoundary title="Investigation timeline">
                <InvestigationTimeline events={investigation.timeline} />
              </SectionErrorBoundary>
            </Card>
          ) : null}

          {activeTab === 'comments' ? (
            <Card className="p-6">
              <EmptyState title="No discussion yet" description="Comments will appear here when collaboration is enabled for this investigation." />
            </Card>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6 lg:max-w-md" style={{ flex: `${100 - splitPercent} 1 0%` }} role="complementary" aria-label="Verdict and workflow">
          <div id="investigation-panel-verdict" tabIndex={-1}>
            <SectionErrorBoundary title="Verdict readiness">
              <VerdictReadinessCard investigation={investigation} evidence={evidence} />
            </SectionErrorBoundary>
          </div>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Workflow actions</h2>
            <WorkflowActionButtons
              investigation={investigation}
              onAssignAnalyst={() => {
                /* routed via command palette / queue */
              }}
              onRequestEvidence={() => {
                /* routed via investigation workspace */
              }}
              onMarkReady={() => {
                /* backend transitions invoked from dedicated flows */
              }}
              onPublish={() => {
                router.push(`/dashboard/review/${claim.id}`);
              }}
              onArchive={() => {
                router.push(`/dashboard/claims/${claim.publicSlug ?? claim.id}`);
              }}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Investigation metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 text-gray-600">Status</div>
                <div className="font-medium text-gray-900">{investigation.status.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div className="mb-1 text-gray-600">Assigned analyst</div>
                <div className="font-medium text-gray-900">{investigation.assignedAnalyst || 'Unassigned'}</div>
              </div>
              <div>
                <div className="mb-1 text-gray-600">Reviewer</div>
                <div className="font-medium text-gray-900">{investigation.reviewer || 'Not assigned'}</div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
