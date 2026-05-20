export default function ConfidenceBandIndicator({ confidenceBand, confidenceScore }: { confidenceBand: string; confidenceScore: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(confidenceScore * 100)));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
        <span>Confidence Band</span>
        <span>{confidenceBand.replaceAll('_', ' ')}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-neutral-600">Confidence score {(confidenceScore * 100).toFixed(0)}%.</p>
    </div>
  );
}
