import Badge from '../ui/badge';

export type Verdict = string;

const mapColor: Record<string, string> = {
  TRUE: 'bg-emerald-100 text-emerald-800',
  FALSE: 'bg-red-100 text-red-800',
  MIXED: 'bg-amber-100 text-amber-800',
  MISLEADING: 'bg-amber-100 text-amber-800',
  PARTLY_FALSE: 'bg-orange-100 text-orange-800',
  SEVERELY_FALSE: 'bg-red-100 text-red-800',
  UNVERIFIABLE: 'bg-gray-100 text-gray-700'
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge className={mapColor[verdict] ?? 'bg-gray-100 text-gray-700'}>{verdict.replaceAll('_', ' ')}</Badge>;
}
