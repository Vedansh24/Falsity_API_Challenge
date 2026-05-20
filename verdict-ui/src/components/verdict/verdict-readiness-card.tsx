'use client';

import { Check, AlertCircle, TrendingUp } from 'lucide-react';
import type { InvestigationViewModel, EvidenceViewModel } from '../../types/investigations';

interface VerdictReadinessCardProps {
  investigation: InvestigationViewModel;
  evidence?: EvidenceViewModel[];
}

export function VerdictReadinessCard({ investigation, evidence = [] }: VerdictReadinessCardProps) {
  const readiness = investigation.verdictReadiness || 0;
  const evidenceQuality = evidence.length > 0 ? (evidence.reduce((sum, e) => sum + e.scoring.credibilityScore, 0) / evidence.length) * 100 : 0;

  const getReadinessLabel = (value: number) => {
    if (value >= 85) return 'Ready for Review';
    if (value >= 50) return 'In Progress';
    if (value >= 25) return 'Early Stage';
    return 'Just Started';
  };

  const getReadinessColor = (value: number) => {
    if (value >= 85) return 'bg-green-100 text-green-700';
    if (value >= 50) return 'bg-blue-100 text-blue-700';
    if (value >= 25) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const checklistItems = [
    { label: 'Claim submitted', complete: investigation.status !== 'PENDING' },
    { label: 'Analyst assigned', complete: Boolean(investigation.assignedAnalystId) },
    { label: 'Evidence collected', complete: evidence.length >= 3 },
    { label: 'Evidence quality threshold', complete: evidenceQuality >= 60 },
    { label: 'Ready for reviewer', complete: readiness >= 85 }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Verdict Readiness
          </h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getReadinessColor(readiness)}`}>
            {getReadinessLabel(readiness)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(readiness, 100)}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-600 mt-1">{Math.min(readiness, 100)}%</div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Readiness Checklist</h4>
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {item.complete ? (
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={item.complete ? 'text-green-700 line-through' : 'text-gray-600'}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">Evidence Count</div>
            <div className="font-semibold text-lg">{evidence.length}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Avg. Credibility</div>
            <div className="font-semibold text-lg">{evidenceQuality.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {readiness >= 85 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            This claim is <strong>ready for reviewer</strong> to make a verdict decision.
          </p>
        </div>
      )}

      {readiness >= 50 && readiness < 85 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">Additional evidence or analysis may help accelerate the verdict decision.</p>
        </div>
      )}
    </div>
  );
}

function Circle({ className }: { className: string }) {
  return <div className={`rounded-full ${className}`} style={{ width: '16px', height: '16px' }} />;
}
