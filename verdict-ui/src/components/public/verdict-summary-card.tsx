type Props = {
  verdict: { verdict?: string; confidence?: number; evidenceCount?: number };
};

export default function VerdictSummaryCard({ verdict }: Props) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Verdict</h4>
        <div className="text-sm text-neutral-600">Confidence: {verdict.confidence ? `${Math.round(verdict.confidence)}%` : '—'}</div>
      </div>
      <p className="mt-3 text-neutral-700">{verdict.verdict ?? 'No verdict available.'}</p>
      <div className="mt-3 text-xs text-neutral-500">Evidence: {verdict.evidenceCount ?? 0}</div>
    </div>
  );
}
