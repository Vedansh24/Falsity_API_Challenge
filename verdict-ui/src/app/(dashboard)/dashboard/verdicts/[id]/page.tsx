'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Button from '../../../../../components/ui/button';
import Badge from '../../../../../components/ui/badge';
import { useClaimQuery } from '../../../../../hooks/use-claims';
import { useClaimEvidenceQuery } from '../../../../../hooks/use-evidence';
import { useVerdictHistoryQuery, useVerdictQuery, useApproveVerdictMutation, useRejectVerdictMutation, usePublishVerdictMutation } from '../../../../../hooks/use-verdicts';
import { normalizeClaim } from '../../../../../types/claims';
import { normalizeEvidenceList } from '../../../../../types/investigations';
import { normalizeVerdict } from '../../../../../types/review';
import VerdictSummaryCard from '../../../../../components/verdict/verdict-summary-card';
import VerdictPreviewPanel from '../../../../../components/verdict/verdict-preview-panel';
import VerdictMetadataCard from '../../../../../components/verdict/verdict-metadata-card';
import ModerationTimeline from '../../../../../components/timeline/moderation-timeline';

export default function VerdictDetailPage() {
  const params = useParams();
  const claimId = params.id as string;

  const claimQuery = useClaimQuery(claimId);
  const verdictQuery = useVerdictQuery(claimId);
  const historyQuery = useVerdictHistoryQuery(claimId);
  const evidenceQuery = useClaimEvidenceQuery(claimId);

  const claim = claimQuery.data?.data ? normalizeClaim(claimQuery.data.data as any) : null;
  const verdict = verdictQuery.data?.data ? normalizeVerdict(verdictQuery.data.data as any) : null;
  const evidence = evidenceQuery.data?.data ? normalizeEvidenceList(evidenceQuery.data.data as any) : [];

  const approveMutation = useApproveVerdictMutation(verdict?.id, claim?.id);
  const rejectMutation = useRejectVerdictMutation(verdict?.id);
  const publishMutation = usePublishVerdictMutation(claim?.id);

  if (claimQuery.isLoading || verdictQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-neutral-100" />;
  }

  if (!claim || !verdict) {
    return <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600">No verdict record found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Verdict detail" subtitle="Publication-facing verdict record with moderation controls." />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{claim.title}</h2>
            <p className="mt-1 text-sm text-neutral-600">{claim.statement}</p>
          </div>
          <div className="flex gap-2">
            <Badge>{verdict.verdictType.replaceAll('_', ' ')}</Badge>
            <Badge>{claim.status.replaceAll('_', ' ')}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <VerdictSummaryCard verdict={verdict} />
          <VerdictPreviewPanel verdict={verdict} />
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Evidence sources</h3>
            <div className="mt-4 text-sm text-neutral-600">{evidence.length} evidence items attached.</div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Moderation history</h3>
            <div className="mt-4"><ModerationTimeline events={(historyQuery.data?.data ?? []) as any} /></div>
          </Card>
        </div>

        <div className="space-y-6">
          <VerdictMetadataCard verdict={verdict} />
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Publication actions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => approveMutation.mutate(undefined)} disabled={approveMutation.isPending}>Approve</Button>
              <Button variant="outline" onClick={() => rejectMutation.mutate(undefined)} disabled={rejectMutation.isPending}>Reject</Button>
              <Button variant="outline" onClick={() => publishMutation.mutate(undefined)} disabled={publishMutation.isPending}>Publish</Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Operational links</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/dashboard/review/${claim.id}`}><Button variant="outline">Open review workspace</Button></Link>
              <Link href={`/dashboard/investigations/${claim.id}`}><Button variant="outline">Open investigation</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
