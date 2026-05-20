import Card from '../ui/card';
import VerdictBadge from '../workflow/verdict-badge';
import ConfidenceBandIndicator from './confidence-band-indicator';
import FalsityScoreIndicator from './falsity-score-indicator';
import type { VerdictViewModel } from '../../types/review';

export default function VerdictSummaryCard({ verdict }: { verdict: VerdictViewModel }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Verdict Summary</h3>
          <p className="mt-1 text-sm text-neutral-600">Backend verdict engine output for moderation and publication review.</p>
        </div>
        <VerdictBadge verdict={verdict.verdictType} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FalsityScoreIndicator falsityScore={verdict.falsityScore} />
        <ConfidenceBandIndicator confidenceBand={verdict.confidenceBand} confidenceScore={verdict.confidenceScore} />
      </div>
    </Card>
  );
}
