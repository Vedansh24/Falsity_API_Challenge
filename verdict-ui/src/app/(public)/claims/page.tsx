"use client";

import { useState } from 'react';
import PublicLayout from '../../../layouts/public-layout';
import ClaimCard from '../../../components/public/claim-card';
import { useClaimsQuery } from '../../../hooks/use-claims';

export default function ClaimsPage() {
  const [q, setQ] = useState('');
  const [verdict, setVerdict] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    q: q || undefined,
    verdict: verdict || undefined,
    page
  } as any;

  const { data, isLoading } = useClaimsQuery(params);
  const claims = (data as any)?.data ?? [];

  return (
    <PublicLayout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold">Claims</h1>
        <div className="mt-4 flex gap-3">
          <input aria-label="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search claims" className="border rounded px-3 py-2 w-full" />
          <select value={verdict} onChange={(e) => setVerdict(e.target.value)} className="border rounded px-2 py-2">
            <option value="">All verdicts</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && <div>Loading claims…</div>}
          {!isLoading && claims.length === 0 && <div>No claims found.</div>}
          {!isLoading && claims.map((c: any) => <ClaimCard key={c.id} claim={c} />)}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Previous</button>
          <div>Page {page}</div>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </PublicLayout>
  );
}
