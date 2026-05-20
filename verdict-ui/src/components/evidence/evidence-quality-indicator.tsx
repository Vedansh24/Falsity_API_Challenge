import { Check, AlertCircle, AlertTriangle } from 'lucide-react';
import type { EvidenceViewModel } from '../../types/investigations';

interface EvidenceQualityIndicatorProps {
  evidence: EvidenceViewModel;
  compact?: boolean;
}

export function EvidenceQualityIndicator({ evidence, compact }: EvidenceQualityIndicatorProps) {
  const qualityLevel = evidence.qualityIndicator || 'medium';
  const qualityScores = [evidence.scoring.credibilityScore, evidence.scoring.relevanceScore, evidence.scoring.freshnessScore];
  const average = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

  const qualityConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    excellent: {
      label: 'Excellent',
      color: 'text-green-700',
      bg: 'bg-green-50 border border-green-200',
      icon: <Check className="w-4 h-4" />
    },
    good: {
      label: 'Good',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border border-blue-200',
      icon: <Check className="w-4 h-4" />
    },
    medium: {
      label: 'Medium',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50 border border-yellow-200',
      icon: <AlertCircle className="w-4 h-4" />
    },
    low: {
      label: 'Low',
      color: 'text-red-700',
      bg: 'bg-red-50 border border-red-200',
      icon: <AlertTriangle className="w-4 h-4" />
    }
  };

  const config = qualityConfig[qualityLevel];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${config.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${config.color}`}>Quality Assessment</h4>
        <span className="text-sm font-medium">{(average * 100).toFixed(0)}%</span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="font-medium mb-1">Credibility</div>
            <div className="w-full bg-white rounded h-2">
              <div className="bg-green-500 h-2 rounded" style={{ width: `${evidence.scoring.credibilityScore * 100}%` }} />
            </div>
            <div className="mt-1 text-gray-600">{(evidence.scoring.credibilityScore * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="font-medium mb-1">Relevance</div>
            <div className="w-full bg-white rounded h-2">
              <div className="bg-blue-500 h-2 rounded" style={{ width: `${evidence.scoring.relevanceScore * 100}%` }} />
            </div>
            <div className="mt-1 text-gray-600">{(evidence.scoring.relevanceScore * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="font-medium mb-1">Freshness</div>
            <div className="w-full bg-white rounded h-2">
              <div className="bg-purple-500 h-2 rounded" style={{ width: `${evidence.scoring.freshnessScore * 100}%` }} />
            </div>
            <div className="mt-1 text-gray-600">{(evidence.scoring.freshnessScore * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {evidence.isDuplicate && (
        <div className="mt-2 text-sm font-medium text-orange-700">⚠️ Potential duplicate detected</div>
      )}
      {evidence.isNovelty && <div className="mt-2 text-sm font-medium text-green-700">✓ Novel evidence</div>}
    </div>
  );
}
