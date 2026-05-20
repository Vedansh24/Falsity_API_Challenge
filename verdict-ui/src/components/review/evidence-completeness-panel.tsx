import type { EvidenceViewModel } from '../../types/investigations';

export default function EvidenceCompletenessPanel({ evidence }: { evidence: EvidenceViewModel[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold text-neutral-900">Evidence Completeness</div>
      <div className="mt-3 text-sm text-neutral-600">Collected sources: {evidence.length}</div>
    </div>
  );
}
