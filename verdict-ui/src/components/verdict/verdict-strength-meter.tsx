export default function VerdictStrengthMeter({ supportScore = 0, contradictScore = 0 }: { supportScore?: number; contradictScore?: number }) {
  const total = supportScore + contradictScore || 1;
  const supportPct = (supportScore / total) * 100;
  const contradictPct = (contradictScore / total) * 100;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
        <span>Verdict Strength</span>
        <span className="text-neutral-600">Support vs contradiction</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="flex h-full w-full">
          <div className="bg-emerald-500" style={{ width: `${supportPct}%` }} />
          <div className="bg-rose-500" style={{ width: `${contradictPct}%` }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
        <span>Support {supportScore.toFixed(2)}</span>
        <span>Contradiction {contradictScore.toFixed(2)}</span>
      </div>
    </div>
  );
}
