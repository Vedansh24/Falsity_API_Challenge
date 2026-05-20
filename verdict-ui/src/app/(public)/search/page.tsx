"use client";

import PublicLayout from '../../../layouts/public-layout';
import SearchHero from '../../../components/public/search-hero';
import { useState } from 'react';
import ClaimCard from '../../../components/public/claim-card';
import { useClaimsQuery } from '../../../hooks/use-claims';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { data, isLoading } = useClaimsQuery({ q: submitted } as any);
  const results = (data as any)?.data ?? [];

  return (
    <PublicLayout>
      <div className="py-6">
        <SearchHero />
        <div className="mt-4 max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="border rounded px-3 py-2 flex-1" placeholder="Search claims, evidence, verdicts" />
            <button onClick={() => setSubmitted(q)} className="px-3 py-2 border rounded">Search</button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {isLoading && <div>Searching…</div>}
            {!isLoading && results.length === 0 && <div>No results found.</div>}
            {!isLoading && results.map((c: any) => <ClaimCard key={c.id} claim={c} />)}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
