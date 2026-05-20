import Badge from '../ui/badge';

export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_MORE_EVIDENCE' | 'READY_FOR_VERDICT' | 'PUBLISHED' | 'ARCHIVED';

const mapColor: Record<ClaimStatus, string> = {
  DRAFT: 'bg-gray-200 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  NEEDS_MORE_EVIDENCE: 'bg-orange-100 text-orange-800',
  READY_FOR_VERDICT: 'bg-green-100 text-green-800',
  PUBLISHED: 'bg-teal-100 text-teal-800',
  ARCHIVED: 'bg-gray-100 text-gray-600'
};

export default function StatusBadge({ status }: { status: ClaimStatus }){
  return <Badge className={mapColor[status]}>{status.replaceAll('_',' ')}</Badge>;
}
