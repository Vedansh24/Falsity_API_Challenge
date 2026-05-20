/**
 * Realtime Loading
 * Skeleton loading state for realtime components
 */

'use client';

export interface RealtimeLoadingProps {
  rows?: number;
}

export default function RealtimeLoading({ rows = 3 }: RealtimeLoadingProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-3 h-3 bg-gray-200 rounded-full mt-1.5" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
