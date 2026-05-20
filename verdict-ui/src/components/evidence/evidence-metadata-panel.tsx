import type { EvidenceViewModel } from '../../types/investigations';

interface EvidenceMetadataPanelProps {
  evidence: EvidenceViewModel;
}

export default function EvidenceMetadataPanel({ evidence }: EvidenceMetadataPanelProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
      <div className="font-medium text-neutral-900 mb-3">Evidence Metadata</div>
      <dl className="space-y-2 text-neutral-600">
        <div className="flex justify-between gap-4"><dt>Source Type</dt><dd>{evidence.sourceType}</dd></div>
        <div className="flex justify-between gap-4"><dt>Stance</dt><dd>{evidence.stance}</dd></div>
        <div className="flex justify-between gap-4"><dt>Quality</dt><dd>{evidence.qualityIndicator ?? 'medium'}</dd></div>
        <div className="flex justify-between gap-4"><dt>Created</dt><dd>{evidence.createdAt ? new Date(evidence.createdAt).toLocaleString() : 'Unknown'}</dd></div>
      </dl>
    </div>
  );
}
