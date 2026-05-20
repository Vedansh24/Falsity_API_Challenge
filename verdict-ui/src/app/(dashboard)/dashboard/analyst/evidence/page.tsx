'use client';

import { useMemo } from 'react';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import { EvidenceList } from '../../../../../components/evidence/evidence-list';
import { useEvidenceQuery } from '../../../../../hooks/use-evidence';
import { useAuthState } from '../../../../../hooks/use-auth';
import { normalizeEvidenceList } from '../../../../../types/investigations';

export default function AnalystEvidencePage() {
  const { user } = useAuthState();
  const evidenceQuery = useEvidenceQuery({ page: 1, pageSize: 200 } as any);

  const evidence = useMemo(() => {
    const payload = (evidenceQuery.data as any)?.data;
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const normalized = normalizeEvidenceList(items as never);

    if (!user?.id) return normalized;
    return normalized.filter((item) => {
      const owner = String((item as any).investigatorId || (item as any).assignedAnalystId || '');
      return !owner || owner === user.id;
    });
  }, [evidenceQuery.data, user?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyst evidence library"
        subtitle="Cross-claim evidence workspace for quality checks, source verification, and retrieval shortcuts."
      />

      <Card>
        <EvidenceList
          evidence={evidence}
          loading={evidenceQuery.isLoading}
          error={evidenceQuery.isError ? 'Failed to load evidence library' : null}
          onRetry={() => {
            void evidenceQuery.refetch();
          }}
          onPreview={(item) => {
            if (item.sourceUrl) {
              window.open(item.sourceUrl, '_blank', 'noopener,noreferrer');
            }
          }}
        />
      </Card>
    </div>
  );
}
