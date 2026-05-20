'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '../../../../components/shared/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Badge from '../../../../components/ui/badge';
import { useClaimsQuery } from '../../../../hooks/use-claims';
import { useVerdictsQuery } from '../../../../hooks/use-verdicts';
import { normalizeClaims } from '../../../../types/claims';
import { normalizeVerdicts } from '../../../../types/review';

export default function VerdictsPage() {
  const [search, setSearch] = useState('');
  const claimsQuery = useClaimsQuery();
  const verdictsQuery = useVerdictsQuery();
  const claims = normalizeClaims(((claimsQuery.data as any)?.data?.items ?? []) as any);
  const verdicts = normalizeVerdicts(((verdictsQuery.data as any)?.data ?? []) as any);
  const verdictByClaimId = useMemo(() => new Map(verdicts.map((item) => [item.claimId, item])), [verdicts]);

  const rows = useMemo(() => claims.map((claim) => ({ claim, verdict: verdictByClaimId.get(claim.id) })).filter(({ claim, verdict }) => [claim.title, claim.statement, verdict?.verdictType].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())), [claims, verdictByClaimId, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Verdict register" subtitle="Moderation and publication overview for claim verdict records." />
      <div className="flex flex-wrap gap-3">
        <Input className="max-w-md" placeholder="Search verdicts" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Link href="/dashboard/review"><Button variant="outline">Open review queue</Button></Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Claim</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map(({ claim, verdict }) => (
              <tr key={claim.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3"><div className="font-medium text-neutral-900">{claim.title}</div><div className="text-xs text-neutral-500">{claim.category ?? 'Uncategorized'}</div></td>
                <td className="px-4 py-3"><Badge>{verdict?.verdictType ?? 'PENDING'}</Badge></td>
                <td className="px-4 py-3 text-sm text-neutral-700">{Math.round((verdict?.confidenceScore ?? 0) * 100)}%</td>
                <td className="px-4 py-3 text-sm text-neutral-700">{verdict?.isApproved ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right"><Link href={`/dashboard/verdicts/${claim.id}`}><Button size="sm">Open</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
