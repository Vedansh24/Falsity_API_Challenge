import type { EvidenceViewModel } from '../../types/investigations';

interface EvidencePreviewProps {
  evidence: EvidenceViewModel;
}

export default function EvidencePreview({ evidence }: EvidencePreviewProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
      <div className="font-medium text-neutral-900 mb-2">Evidence Preview</div>
      <div className="break-all text-neutral-700">{evidence.sourceUrl}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
        <div>Source: {evidence.sourceType}</div>
        <div>Stance: {evidence.stance}</div>
        <div>Credibility: {(evidence.scoring.credibilityScore * 100).toFixed(0)}%</div>
        <div>Confidence: {(evidence.scoring.reviewerConfidence * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}
