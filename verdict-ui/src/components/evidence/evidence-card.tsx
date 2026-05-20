'use client';

import { Trash2, Edit, Eye, Copy, ExternalLink } from 'lucide-react';
import Button from '../ui/button';
import { EvidenceSourceBadge } from './evidence-source-badge';
import { EvidenceQualityIndicator } from './evidence-quality-indicator';
import type { EvidenceViewModel } from '../../types/investigations';

interface EvidenceCardProps {
  evidence: EvidenceViewModel;
  onEdit?: (evidence: EvidenceViewModel) => void;
  onDelete?: (id: string) => void;
  onPreview?: (evidence: EvidenceViewModel) => void;
  isLoading?: boolean;
}

export function EvidenceCard({ evidence, onEdit, onDelete, onPreview, isLoading }: EvidenceCardProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(evidence.sourceUrl);
  };

  const stanceColor: Record<string, string> = {
    SUPPORTS: 'text-green-700',
    CONTRADICTS: 'text-red-700',
    NEUTRAL: 'text-gray-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <EvidenceSourceBadge sourceType={evidence.sourceType} size="sm" />
            <span className={`text-xs font-medium ${stanceColor[evidence.stance] || 'text-gray-600'}`}>
              {evidence.stance}
            </span>
          </div>
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block group"
          >
            <span className="line-clamp-2 break-words">{evidence.sourceUrl}</span>
            <ExternalLink className="w-3 h-3 inline ml-1 group-hover:inline" />
          </a>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onPreview(evidence)}
              title="Preview"
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={handleCopyUrl}
            title="Copy URL"
            className="h-8 w-8 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onEdit(evidence)}
              title="Edit"
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onDelete(evidence.id)}
              title="Delete"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600 mb-1">Credibility</div>
          <div className="font-semibold">{(evidence.scoring.credibilityScore * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600 mb-1">Relevance</div>
          <div className="font-semibold">{(evidence.scoring.relevanceScore * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600 mb-1">Freshness</div>
          <div className="font-semibold">{(evidence.scoring.freshnessScore * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600 mb-1">Confidence</div>
          <div className="font-semibold">{(evidence.scoring.reviewerConfidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="inline-block">
          <EvidenceQualityIndicator evidence={evidence} compact={true} />
        </div>
      </div>

      {evidence.createdAt && (
        <div className="text-xs text-gray-500 mt-2">Added {new Date(evidence.createdAt).toLocaleDateString()}</div>
      )}
    </div>
  );
}
