export default function FalsityScoreIndicator({ falsityScore }: { falsityScore: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(falsityScore)));
  const tone = pct >= 75 ? 'bg-rose-500' : pct >= 45 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
        <span>Falsity Score</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className={`${tone} h-full`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-neutral-600">Backend-derived falsity score only.</p>
    </div>
  );
}
