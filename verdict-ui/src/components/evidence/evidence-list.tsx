'use client';

import { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Plus, Search } from 'lucide-react';
import Button from '../ui/button';
import Input from '../ui/input';
import { EvidenceCard } from './evidence-card';
import { EvidenceLoading, EvidenceEmpty, EvidenceError } from './evidence-states';
import { getEvidenceSearchableText } from '../../types/investigations';
import type { EvidenceViewModel, EvidenceTableState } from '../../types/investigations';

interface EvidenceListProps {
  evidence: EvidenceViewModel[];
  loading?: boolean;
  error?: string | null;
  onAdd?: () => void;
  onEdit?: (evidence: EvidenceViewModel) => void;
  onDelete?: (id: string) => void;
  onPreview?: (evidence: EvidenceViewModel) => void;
  isActionLoading?: boolean;
  onRetry?: () => void;
}

export function EvidenceList({
  evidence,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onPreview,
  isActionLoading,
  onRetry
}: EvidenceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EvidenceTableState>({
    search: '',
    sourceType: '',
    stance: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10
  });

  const filtered = useMemo(() => {
    let results = [...evidence];

    // Apply search
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      results = results.filter((e) => getEvidenceSearchableText(e).includes(searchLower));
    }

    // Apply source type filter
    if (state.sourceType) {
      results = results.filter((e) => e.sourceType === state.sourceType);
    }

    // Apply stance filter
    if (state.stance) {
      results = results.filter((e) => e.stance === state.stance);
    }

    // Apply sorting
    results.sort((a, b) => {
      const direction = state.sortOrder === 'asc' ? 1 : -1;

      if (state.sortBy === 'createdAt') {
        return direction * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      }
      if (state.sortBy === 'credibility') {
        return direction * (a.scoring.credibilityScore - b.scoring.credibilityScore);
      }
      if (state.sortBy === 'relevance') {
        return direction * (a.scoring.relevanceScore - b.scoring.relevanceScore);
      }
      if (state.sortBy === 'freshness') {
        return direction * (a.scoring.freshnessScore - b.scoring.freshnessScore);
      }

      return 0;
    });

    return results;
  }, [evidence, state]);

  const useVirtual = filtered.length > 50;
  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? filtered.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 4
  });

  if (loading) {
    return <EvidenceLoading />;
  }

  if (error) {
    return <EvidenceError message={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search evidence..."
            value={state.search}
            onChange={(e) => setState({ ...state, search: e.target.value, page: 1 })}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <select
          value={state.sourceType}
          onChange={(e) => setState({ ...state, sourceType: e.target.value, page: 1 })}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value="">All Sources</option>
          <option value="GOVERNMENT">Government</option>
          <option value="NEWS">News</option>
          <option value="RESEARCH_PAPER">Research</option>
          <option value="BLOG">Blog</option>
          <option value="SOCIAL_MEDIA">Social Media</option>
          <option value="INTERNAL_REPORT">Internal</option>
        </select>

        <select
          value={state.stance}
          onChange={(e) => setState({ ...state, stance: e.target.value, page: 1 })}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value="">All Stances</option>
          <option value="SUPPORTS">Supports</option>
          <option value="CONTRADICTS">Contradicts</option>
          <option value="NEUTRAL">Neutral</option>
        </select>

        {onAdd && (
          <Button onClick={onAdd} disabled={isActionLoading} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Evidence</span>
          </Button>
        )}
      </div>

      {/* Count */}
      <div className="text-sm text-gray-600">
        {filtered.length} of {evidence.length} evidence {evidence.length === 1 ? 'source' : 'sources'}
      </div>

      {/* Evidence cards */}
      {filtered.length === 0 ? (
        <EvidenceEmpty />
      ) : useVirtual ? (
        <div ref={parentRef} className="h-[640px] overflow-auto rounded-lg border border-gray-200" aria-busy={Boolean(loading)}>
          <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = filtered[virtualRow.index];
              return (
                <div
                  key={item.id}
                  className="absolute left-0 top-0 w-full px-1"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <EvidenceCard evidence={item} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} isLoading={isActionLoading} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <EvidenceCard
              key={item.id}
              evidence={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
              isLoading={isActionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
