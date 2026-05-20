"use client";

import PublicLayout from '../../../../layouts/public-layout';
import { useClaimQuery, useClaimEvidenceQuery } from '../../../../hooks/use-claims';
import VerdictSummaryCard from '../../../../components/public/verdict-summary-card';
import EvidencePreviewCard from '../../../../components/public/evidence-preview-card';
import PublicTimeline from '../../../../components/public/public-timeline';
import { normalizeClaim } from '../../../../types/claims';

type Props = { params: { slug: string } };

export default function ClaimDetailPage({ params }: Props) {
  const { slug } = params;
  const claimQ = useClaimQuery(slug);
  const evidenceQ = useClaimEvidenceQuery(slug);
  const claim = claimQ.data ? normalizeClaim(claimQ.data as Record<string, unknown>) : null;
  const evidence = (evidenceQ.data as any)?.data ?? [];

  return (
    <PublicLayout>
      <div className="py-6">
        {!claimQ.isLoading && !claim && <div>Claim not found.</div>}
        {claim && (
          <article>
            <header className="mb-4">
              <h1 className="text-2xl font-semibold">{claim.title}</h1>
              <div className="mt-2 text-sm text-neutral-600">Published: {claim.publishedAt ? new Date(String(claim.publishedAt)).toLocaleDateString() : '—'}</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <section className="mb-6">
                  <h3 className="font-semibold">Verdict summary</h3>
                  <div className="mt-2">
                    <VerdictSummaryCard verdict={{ verdict: String(claim.verdict ?? ''), confidence: Number(claim.confidence ?? 0), evidenceCount: Number(claim.evidenceCount ?? 0) }} />
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold">Evidence</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {evidenceQ.isLoading && <div>Loading evidence…</div>}
                    {!evidenceQ.isLoading && evidence.length === 0 && <div>No public evidence available.</div>}
                    {!evidenceQ.isLoading && evidence.map((ev: any) => <EvidencePreviewCard key={ev.id} evidence={ev} />)}
                  </div>
                </section>
              </div>

              <aside>
                <section className="mb-4">
                  <h4 className="font-semibold">Timeline</h4>
                  <div className="mt-2">
                    <PublicTimeline events={((claim.timeline ?? []) as any[]).slice(0, 5).map((t: any) => ({ id: t.id ?? t.date, date: t.date ?? new Date().toISOString(), title: t.title, description: t.description }))} />
                  </div>
                </section>

                <section className="mb-4">
                  <h4 className="font-semibold">Metadata</h4>
                  <dl className="mt-2 text-sm text-neutral-700">
                    <div><dt className="font-medium">Category</dt><dd>{String(claim.category ?? '—')}</dd></div>
                    <div className="mt-1"><dt className="font-medium">Status</dt><dd>{String(claim.status ?? '—')}</dd></div>
                  </dl>
                </section>
              </aside>
            </div>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}
