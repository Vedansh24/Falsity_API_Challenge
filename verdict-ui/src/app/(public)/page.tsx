"use client";

import PublicLayout from '../../layouts/public-layout';
import HeroSection from '../../components/public/hero-section';
import { useClaimsQuery } from '../../hooks/use-claims';
import { useVerdictsQuery } from '../../hooks/use-verdicts';
import ClaimCard from '../../components/public/claim-card';
import VerdictSummaryCard from '../../components/public/verdict-summary-card';
import MethodologySection from '../../components/public/methodology-section';
import TransparencyBanner from '../../components/public/transparency-banner';

export default function Page() {
  const { data: claims, isLoading: claimsLoading } = useClaimsQuery({ perPage: 5 } as any);
  const { data: verdicts, isLoading: verdictsLoading } = useVerdictsQuery();
  const claimItems = (claims as any)?.data ?? [];
  const verdictItems = (verdicts as any)?.data ?? [];

  return (
    <PublicLayout>
      <HeroSection />

      <section className="py-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold">Trending claims</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimsLoading && <div>Loading trending claims…</div>}
            {!claimsLoading && claimItems.slice(0, 4).map((c: any) => <ClaimCard key={c.id} claim={c} />)}
          </div>
        </div>
      </section>

      <section className="py-8 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold">Latest verdicts</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {verdictsLoading && <div>Loading verdicts…</div>}
            {!verdictsLoading && verdictItems.slice(0, 3).map((v: any) => (
              <VerdictSummaryCard key={v.id} verdict={{ verdict: v.verdict, confidence: v.confidence, evidenceCount: v.evidenceCount }} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold">Methodology preview</h2>
          <div className="mt-4">
            <MethodologySection />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-5xl mx-auto">
          <TransparencyBanner />
        </div>
      </section>
    </PublicLayout>
  );
}

