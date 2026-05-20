"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Input from '../../../../../components/ui/input';
import Button from '../../../../../components/ui/button';
import StatusBadge from '../../../../../components/workflow/status-badge';
import VerdictBadge from '../../../../../components/workflow/verdict-badge';
import { useClaimsQuery } from '../../../../../hooks/use-claims';
import { normalizeClaims, getClaimSearchableText } from '../../../../../types/claims';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export default function UserClaimsPage() {
  const [search, setSearch] = useState('');

  const claimsQuery = useClaimsQuery({ page: 1, pageSize: 100 } as any);
  const claimsPayload = asRecord((claimsQuery.data as any)?.data);
  const claimItems = Array.isArray(claimsPayload.items) ? claimsPayload.items : [];
  const claims = normalizeClaims(claimItems as Array<Record<string, unknown>>);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return claims;
    return claims.filter((claim) => getClaimSearchableText(claim).includes(q));
  }, [claims, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="My claims" subtitle="Track your submitted claims and monitor operational workflow progress." />

      <Card>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <Input
            className="max-w-md"
            placeholder="Search your claims"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search my claims"
          />
          <Link href="/dashboard/user/claims/new">
            <Button>Submit claim</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          {claimsQuery.isLoading && <div className="text-sm text-neutral-600">Loading claims…</div>}
          {!claimsQuery.isLoading && rows.length === 0 && (
            <div className="text-sm text-neutral-600">No claims found for the current search.</div>
          )}

          {!claimsQuery.isLoading && rows.map((claim) => (
            <div key={claim.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/dashboard/user/claims/${claim.id}`} className="font-medium hover:underline">
                    {claim.title}
                  </Link>
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{claim.statement}</p>
                  <div className="text-xs text-neutral-500 mt-2">
                    Submitted {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'recently'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={claim.status} />
                  {claim.verdict && <VerdictBadge verdict={claim.verdict} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
