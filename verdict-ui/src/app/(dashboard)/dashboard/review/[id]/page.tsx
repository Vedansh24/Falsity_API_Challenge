'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Button from '../../../../../components/ui/button';
import Badge from '../../../../../components/ui/badge';
import { useClaimQuery } from '../../../../../hooks/use-claims';
import { useClaimEvidenceQuery } from '../../../../../hooks/use-evidence';
import { useInvestigationQuery } from '../../../../../hooks/use-investigations';
import { useVerdictHistoryQuery, useVerdictQuery, useApproveVerdictMutation, useRejectVerdictMutation, usePublishVerdictMutation, useRecomputeVerdictMutation } from '../../../../../hooks/use-verdicts';
import { useUpdateClaimMutation } from '../../../../../hooks/use-claims';
import { useRole } from '../../../../../hooks/use-role';
import { normalizeClaim } from '../../../../../types/claims';
import { normalizeEvidenceList } from '../../../../../types/investigations';
import { normalizeVerdict } from '../../../../../types/review';
import { EvidenceList } from '../../../../../components/evidence/evidence-list';
import VerdictSummaryCard from '../../../../../components/verdict/verdict-summary-card';
import VerdictStrengthMeter from '../../../../../components/verdict/verdict-strength-meter';
import FalsityScoreIndicator from '../../../../../components/verdict/falsity-score-indicator';
import ConfidenceBandIndicator from '../../../../../components/verdict/confidence-band-indicator';
import VerdictPreviewPanel from '../../../../../components/verdict/verdict-preview-panel';
import EvidenceStrengthSummary from '../../../../../components/verdict/evidence-strength-summary';
import ModerationSummary from '../../../../../components/verdict/moderation-summary';
import VerdictMetadataCard from '../../../../../components/verdict/verdict-metadata-card';
import PublicationReadinessCard from '../../../../../components/review/publication-readiness-card';
import ModerationChecklist from '../../../../../components/review/moderation-checklist';
import EvidenceCompletenessPanel from '../../../../../components/review/evidence-completeness-panel';
import ReviewerSummary from '../../../../../components/review/reviewer-summary';
import WorkflowReadinessBanner from '../../../../../components/review/workflow-readiness-banner';
import ModerationTimeline from '../../../../../components/timeline/moderation-timeline';
import ReviewerEvent from '../../../../../components/timeline/reviewer-event';
import PublicationEvent from '../../../../../components/timeline/publication-event';
import WorkflowTransitionEvent from '../../../../../components/timeline/workflow-transition-event';

export default function ReviewWorkspacePage() {
  const params = useParams();
  const claimId = params.id as string;
  const role = useRole();

  const claimQuery = useClaimQuery(claimId);
  const verdictQuery = useVerdictQuery(claimId);
  const historyQuery = useVerdictHistoryQuery(claimId);
  const investigationQuery = useInvestigationQuery(claimId);
  const evidenceQuery = useClaimEvidenceQuery(claimId);

  const claim = claimQuery.data?.data ? normalizeClaim(claimQuery.data.data as any) : null;
  const verdict = verdictQuery.data?.data ? normalizeVerdict(verdictQuery.data.data as any) : null;
  const evidence = evidenceQuery.data?.data ? normalizeEvidenceList(evidenceQuery.data.data as any) : [];
  const history = (historyQuery.data?.data ?? []) as any[];
  const investigation = (investigationQuery.data?.data as any) ?? null;

  const approveMutation = useApproveVerdictMutation(verdict?.id, claim?.id, investigation?.id);
  const rejectMutation = useRejectVerdictMutation(verdict?.id);
  const publishMutation = usePublishVerdictMutation(claim?.id, investigation?.id);
  const recomputeMutation = useRecomputeVerdictMutation(claim?.id);
  const archiveMutation = useUpdateClaimMutation(claim?.id ?? '');

  if (claimQuery.isLoading || verdictQuery.isLoading || evidenceQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-neutral-100" />;
  }

  if (!claim || !verdict) {
    return <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600">No verdict data available.</div>;
  }

  const isReviewer = role === 'REVIEWER' || role === 'ADMIN';
  const checklist = [
    { label: 'Evidence collected', complete: evidence.length > 0 },
    { label: 'Verdict engine run', complete: Boolean(verdict.reasoning) },
    { label: 'Reviewer decision recorded', complete: Boolean(verdict.isApproved) },
    { label: 'Publication completed', complete: Boolean(verdict.publishedAt) }
  ];

  const moderationHistory = [
    ...history.map((item: any) => ({ id: item.id ?? String(item.createdAt), title: 'Verdict history entry', description: item.reasoning ?? 'Historical verdict snapshot', date: item.createdAt, type: 'transition' as const })),
    ...(investigation?.startedAt ? [{ id: 'investigation', title: 'Investigation updated', description: 'Analyst activity and workflow progress are visible in the workspace.', date: investigation.startedAt, type: 'assignment' as const }] : [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reviewer moderation workspace" subtitle="Operational verdict review, approval, and publication controls." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{claim.title}</h2>
                <p className="mt-1 text-sm text-neutral-600">{claim.statement}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{claim.status.replaceAll('_', ' ')}</Badge>
                <Badge>{verdict.verdictType.replaceAll('_', ' ')}</Badge>
              </div>
            </div>
          </Card>

          <VerdictSummaryCard verdict={verdict} />
          <div className="grid gap-4 md:grid-cols-2">
            <VerdictStrengthMeter supportScore={verdict.supportScore} contradictScore={verdict.contradictScore} />
            <EvidenceStrengthSummary evidence={evidence} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FalsityScoreIndicator falsityScore={verdict.falsityScore} />
            <ConfidenceBandIndicator confidenceBand={verdict.confidenceBand} confidenceScore={verdict.confidenceScore} />
          </div>
          <VerdictPreviewPanel verdict={verdict} />

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Evidence review</h3>
            <div className="mt-4">
              <EvidenceList evidence={evidence} />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Moderation timeline</h3>
            <div className="mt-4 space-y-3">
              {moderationHistory.map((event) => (
                <div key={event.id} className="space-y-2">
                  <ModerationTimeline events={[event]} />
                </div>
              ))}
              <div className="grid gap-3 md:grid-cols-3">
                <ReviewerEvent title="Reviewer note" detail={verdict.reasoning ?? 'Backend reasoning only'} />
                <PublicationEvent title="Publication" detail={verdict.publishedAt ? new Date(verdict.publishedAt).toLocaleString() : 'Not published'} />
                <WorkflowTransitionEvent title="Current state" state={claim.status.replaceAll('_', ' ')} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <WorkflowReadinessBanner ready={Boolean(verdict.isApproved || verdict.publishedAt)} />
          <PublicationReadinessCard verdict={verdict} />
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Reviewer actions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {isReviewer ? (
                <>
                  <Button onClick={() => approveMutation.mutate(undefined)} disabled={approveMutation.isPending}>Approve</Button>
                  <Button variant="outline" onClick={() => rejectMutation.mutate(undefined)} disabled={rejectMutation.isPending}>Reject</Button>
                  <Button variant="outline" onClick={() => publishMutation.mutate(undefined)} disabled={publishMutation.isPending}>Publish</Button>
                  <Button variant="outline" onClick={() => recomputeMutation.mutate(undefined)} disabled={recomputeMutation.isPending}>Recompute</Button>
                  <Button variant="outline" onClick={() => archiveMutation.mutate({ status: 'ARCHIVED' } as any)} disabled={archiveMutation.isPending}>Archive</Button>
                </>
              ) : (
                <div className="text-sm text-neutral-600">Read-only review visibility for the current role.</div>
              )}
            </div>
          </Card>
          <ModerationChecklist items={checklist} />
          <EvidenceCompletenessPanel evidence={evidence} />
          <ReviewerSummary verdict={verdict} />
          <ModerationSummary verdict={verdict} />
          <VerdictMetadataCard verdict={verdict} />
          <Card>
            <div className="text-sm font-semibold text-neutral-900">Operational links</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/dashboard/investigations/${claim.id}`}><Button variant="outline">Open investigation</Button></Link>
              <Link href={`/dashboard/verdicts/${claim.id}`}><Button variant="outline">Open verdict record</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
