'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import Button from '../../../../../../components/ui/button';
import Card from '../../../../../../components/ui/card';
import Input from '../../../../../../components/ui/input';
import Badge from '../../../../../../components/ui/badge';
import { EvidenceList } from '../../../../../../components/evidence/evidence-list';
import { InvestigationTimeline } from '../../../../../../components/investigation-timeline/investigation-timeline';
import { VerdictReadinessCard } from '../../../../../../components/verdict/verdict-readiness-card';
import { WorkflowActionButtons } from '../../../../../../components/workflow/workflow-action-buttons';
import { SectionErrorBoundary } from '../../../../../../components/system/section-error-boundary';
import StaleDataWarning from '../../../../../../components/system/stale-data-warning';
import { InvestigationErrorState, InvestigationLoadingState } from '../../../../../../components/analyst/investigation-states';
import { useInvestigationsQuery, useInvestigationQuery, useUpdateInvestigationMutation } from '../../../../../../hooks/use-investigations';
import { useClaimQuery, useClaimEvidenceQuery, useUpdateClaimMutation } from '../../../../../../hooks/use-claims';
import { useClaimCommentsQuery, useCreateCommentMutation } from '../../../../../../hooks/use-comments';
import { useRealtimeStatus } from '../../../../../../lib/realtime/realtime-hooks';
import { normalizeClaim } from '../../../../../../types/claims';
import { normalizeEvidenceList, normalizeInvestigation } from '../../../../../../types/investigations';
import { useUiStore } from '../../../../../../stores/ui.store';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

export default function AnalystInvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investigationId = params.id as string;

  const splitPercent = useUiStore((state) => state.workspacePreferences.investigationSplitPercent);
  const activeTab = useUiStore((state) => state.workspacePreferences.investigationActiveTab);
  const setWorkspacePreferences = useUiStore((state) => state.setWorkspacePreferences);

  const { isConnected } = useRealtimeStatus();
  const openedAt = useRef(Date.now());
  const [minutesOpen, setMinutesOpen] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

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

  const commentsQuery = useClaimCommentsQuery(claim?.id);
  const commentsPayload = (commentsQuery.data as any)?.data;
  const comments = Array.isArray(commentsPayload?.items)
    ? commentsPayload.items
    : Array.isArray(commentsPayload)
      ? commentsPayload
      : [];

  const updateInvestigation = useUpdateInvestigationMutation(investigationId);
  const updateClaim = useUpdateClaimMutation(claim?.id ?? '');
  const createComment = useCreateCommentMutation(claim?.id);

  const setStatus = useCallback(
    async (claimStatus: 'NEEDS_MORE_EVIDENCE' | 'READY_FOR_VERDICT', investigationStatus: 'AWAITING_EVIDENCE' | 'READY_FOR_REVIEW') => {
      if (!claim?.id) return;
      setActionError(null);

      try {
        await updateClaim.mutateAsync({ status: claimStatus });
        await updateInvestigation.mutateAsync({ status: investigationStatus });
        await Promise.all([investigationQuery.refetch(), claimQuery.refetch()]);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Workflow transition failed.');
      }
    },
    [claim?.id, claimQuery, investigationQuery, updateClaim, updateInvestigation]
  );

  const submitComment = useCallback(async () => {
    if (!claim?.id || !commentText.trim()) return;

    setActionError(null);
    try {
      await createComment.mutateAsync({ claimId: claim.id, content: commentText.trim(), visibility: 'INTERNAL' });
      setCommentText('');
      await commentsQuery.refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to post note.');
    }
  }, [claim?.id, commentText, commentsQuery, createComment]);

  const refetchAll = useCallback(() => {
    void investigationQuery.refetch();
    void claimQuery.refetch();
    void evidenceQuery.refetch();
    void commentsQuery.refetch();
  }, [investigationQuery, claimQuery, evidenceQuery, commentsQuery]);

  const listQuery = useInvestigationsQuery({ page: 1, pageSize: 100 } as any);
  const showNotAssigned = useMemo(() => {
    const items = (listQuery.data as any)?.data?.items ?? [];
    const found = (items as any[]).find((item) => String(item.id) === investigationId);
    return found && !found.assignedAnalystId;
  }, [investigationId, listQuery.data]);

  const lastUpdatedAt = useMemo(() => {
    const times = [investigationQuery.dataUpdatedAt, claimQuery.dataUpdatedAt, evidenceQuery.dataUpdatedAt, commentsQuery.dataUpdatedAt].filter(Boolean);
    return times.length ? Math.min(...times) : undefined;
  }, [investigationQuery.dataUpdatedAt, claimQuery.dataUpdatedAt, evidenceQuery.dataUpdatedAt, commentsQuery.dataUpdatedAt]);

  const isLoading = investigationQuery.isLoading || claimQuery.isLoading || evidenceQuery.isLoading;
  const isError = investigationQuery.isError || claimQuery.isError || evidenceQuery.isError;

  if (isError) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <InvestigationErrorState
          message="The investigation details are currently unavailable."
          onRetry={() => {
            refetchAll();
          }}
        />
      </div>
    );
  }

  if (isLoading || !investigation || !claim) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <InvestigationLoadingState message="Loading analyst workspace..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaleDataWarning
        lastUpdatedAt={lastUpdatedAt}
        isRealtimeDown={!isConnected}
        minutesWorkspaceOpen={minutesOpen}
        onRefresh={refetchAll}
      />

      <div className="flex items-center gap-2">
        <Link href="/dashboard/analyst/investigations">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Assigned investigations
          </Button>
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-600">{investigation.id}</span>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-xl font-semibold text-neutral-900">{claim.title}</h1>
            <p className="text-sm text-neutral-600">{claim.statement}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">{claim.status.replace(/_/g, ' ')}</Badge>
              <Badge className="bg-neutral-100 text-neutral-700">Investigation: {investigation.status.replace(/_/g, ' ')}</Badge>
              {showNotAssigned ? <Badge className="bg-amber-100 text-amber-800">Unassigned</Badge> : null}
            </div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <div>Claim ID: {claim.id}</div>
            <div className="mt-1">Investigation ID: {investigation.id}</div>
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
          Panel split
          <input
            type="range"
            min={50}
            max={75}
            value={splitPercent}
            onChange={(event) => setWorkspacePreferences({ investigationSplitPercent: Number(event.target.value) })}
            aria-valuemin={50}
            aria-valuemax={75}
            aria-valuenow={splitPercent}
          />
        </label>
      </div>

      <div role="tablist" aria-label="Analyst investigation workspace" className="flex gap-2 border-b border-neutral-200 pb-2">
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
            {tab === 'evidence' ? 'Evidence' : tab === 'timeline' ? 'Timeline' : 'Notes'}
          </button>
        ))}
      </div>

      {actionError ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div> : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 space-y-6" style={{ flex: `${splitPercent} 1 0%` }}>
          {activeTab === 'evidence' ? (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">Evidence workspace</h2>
              <SectionErrorBoundary title="Evidence workspace">
                <EvidenceList
                  evidence={evidence}
                  loading={evidenceQuery.isLoading}
                  error={evidenceQuery.isError ? 'Failed to load evidence' : null}
                  onRetry={() => {
                    void evidenceQuery.refetch();
                  }}
                  onPreview={(item) => {
                    if (item.sourceUrl) {
                      window.open(item.sourceUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              </SectionErrorBoundary>
            </Card>
          ) : null}

          {activeTab === 'timeline' ? (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">Investigation timeline</h2>
              <SectionErrorBoundary title="Investigation timeline">
                <InvestigationTimeline events={investigation.timeline} />
              </SectionErrorBoundary>
            </Card>
          ) : null}

          {activeTab === 'comments' ? (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">Analyst notes</h2>

              <div className="mb-4 space-y-3">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Add context for reviewers: conflicting evidence, source concerns, or next steps."
                />
                <div className="flex justify-end">
                  <Button onClick={() => void submitComment()} disabled={createComment.isLoading || !commentText.trim()}>
                    {createComment.isLoading ? 'Posting note...' : 'Post note'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {commentsQuery.isLoading && <div className="text-sm text-neutral-600">Loading notes...</div>}
                {!commentsQuery.isLoading && comments.length === 0 && (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                    No analyst notes yet.
                  </div>
                )}

                {!commentsQuery.isLoading && comments.map((item: unknown, index: number) => {
                  const record = asRecord(item);
                  const content = toStringValue(record.content || record.message || '');
                  const visibility = toStringValue(record.visibility || 'INTERNAL');
                  const createdAt = toStringValue(record.createdAt);

                  return (
                    <div key={toStringValue(record.id) || String(index)} className="rounded-lg border border-neutral-200 p-3">
                      <p className="text-sm text-neutral-900">{content || 'No content'}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                        <span>{visibility}</span>
                        <span>{createdAt ? new Date(createdAt).toLocaleString() : 'Recent'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6 lg:max-w-md" style={{ flex: `${100 - splitPercent} 1 0%` }}>
          <SectionErrorBoundary title="Verdict readiness">
            <VerdictReadinessCard investigation={investigation} evidence={evidence} />
          </SectionErrorBoundary>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">Workflow actions</h2>
            <WorkflowActionButtons
              investigation={investigation}
              onRequestEvidence={() => {
                void setStatus('NEEDS_MORE_EVIDENCE', 'AWAITING_EVIDENCE');
              }}
              onMarkReady={() => {
                void setStatus('READY_FOR_VERDICT', 'READY_FOR_REVIEW');
              }}
              isLoading={updateClaim.isLoading || updateInvestigation.isLoading}
            />
            <p className="mt-3 text-xs text-neutral-500">
              Analyst actions update claim workflow status and investigation readiness for reviewer handoff.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Quick actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/analyst/evidence">
                <Button variant="outline" className="w-full justify-start">Review evidence library</Button>
              </Link>
              <Link href="/dashboard/analyst/notifications">
                <Button variant="outline" className="w-full justify-start">Open analyst notifications</Button>
              </Link>
              <Input readOnly value={`Claim status: ${claim.status}`} aria-label="Current claim status" />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
