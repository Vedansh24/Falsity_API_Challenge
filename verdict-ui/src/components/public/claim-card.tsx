import Link from 'next/link';

type Props = {
  claim: { id: string; title: string; verdict?: string; confidence?: number; publishedAt?: string; slug?: string };
};

export default function ClaimCard({ claim }: Props) {
  const href = `/claims/${claim.slug ?? claim.id}`;
  return (
    <article className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium">
        <Link href={href} className="text-neutral-900 hover:underline">
          {claim.title}
        </Link>
      </h3>
      <div className="mt-2 text-sm text-neutral-600 flex items-center justify-between">
        <div>
          <span className="inline-block mr-3 px-2 py-0.5 text-xs rounded bg-neutral-100">{claim.verdict ?? 'Unknown'}</span>
          <span className="text-xs">Confidence: {typeof claim.confidence === 'number' ? `${Math.round(claim.confidence)}%` : '—'}</span>
        </div>
        <time dateTime={claim.publishedAt ?? ''} className="text-xs text-neutral-500">
          {claim.publishedAt ? new Date(claim.publishedAt).toLocaleDateString() : '—'}
        </time>
      </div>
    </article>
  );
}
