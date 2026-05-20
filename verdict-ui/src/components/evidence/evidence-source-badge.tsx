import type { EvidenceSourceType } from '../../types/investigations';

interface EvidenceSourceBadgeProps {
  sourceType: EvidenceSourceType | string;
  size?: 'sm' | 'md' | 'lg';
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  GOVERNMENT: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Government' },
  NEWS: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'News' },
  RESEARCH_PAPER: { bg: 'bg-green-100', text: 'text-green-700', label: 'Research' },
  BLOG: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Blog' },
  SOCIAL_MEDIA: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Social' },
  INTERNAL_REPORT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Internal' }
};

export function EvidenceSourceBadge({ sourceType, size = 'md' }: EvidenceSourceBadgeProps) {
  const config = SOURCE_COLORS[sourceType] || { bg: 'bg-gray-100', text: 'text-gray-700', label: sourceType };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-block rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}
