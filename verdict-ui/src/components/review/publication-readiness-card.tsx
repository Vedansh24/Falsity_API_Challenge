import Card from '../ui/card';
import type { VerdictViewModel } from '../../types/review';

export default function PublicationReadinessCard({ verdict }: { verdict: VerdictViewModel }) {
  const eligible = Boolean(verdict.isApproved && verdict.publishedAt);

  return (
    <Card>
      <div className="text-sm font-semibold text-neutral-900">Publication Readiness</div>
      <p className="mt-1 text-sm text-neutral-600">Visualizes backend moderation state without re-implementing publication rules.</p>
      <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm">
        <div className="flex items-center justify-between"><span>Eligible</span><span className="font-medium">{eligible ? 'Yes' : 'No'}</span></div>
        <div className="mt-2 flex items-center justify-between"><span>Status</span><span className="font-medium">{verdict.isApproved ? 'Approved' : 'Pending'}</span></div>
      </div>
    </Card>
  );
}
