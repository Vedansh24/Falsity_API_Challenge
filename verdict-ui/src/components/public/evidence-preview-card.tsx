type Props = {
  evidence: { id: string; title?: string; sourceType?: string; credibility?: number };
};

export default function EvidencePreviewCard({ evidence }: Props) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-sm font-medium">{evidence.title ?? 'Untitled source'}</div>
      <div className="mt-1 text-xs text-neutral-600">{evidence.sourceType ?? 'Source'}</div>
      <div className="mt-2 text-xs text-neutral-500">Credibility: {evidence.credibility ? `${Math.round(evidence.credibility)}%` : '—'}</div>
    </div>
  );
}
