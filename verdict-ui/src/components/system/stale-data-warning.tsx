'use client';

type Props = {
  lastUpdatedAt: number | undefined;
  isRealtimeDown: boolean;
  minutesWorkspaceOpen: number;
  onRefresh: () => void;
};

export default function StaleDataWarning({ lastUpdatedAt, isRealtimeDown, minutesWorkspaceOpen, onRefresh }: Props) {
  const staleByAge = minutesWorkspaceOpen >= 10 && isRealtimeDown;
  const staleByData =
    typeof lastUpdatedAt === 'number' && Date.now() - lastUpdatedAt > 5 * 60 * 1000 && isRealtimeDown;

  if (!staleByAge && !staleByData) return null;

  const minutesAgo =
    typeof lastUpdatedAt === 'number' ? Math.max(1, Math.round((Date.now() - lastUpdatedAt) / 60_000)) : null;

  return (
    <div
      className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
      role="status"
      aria-live="polite"
    >
      {minutesAgo !== null ? (
        <span>Data last updated about {minutesAgo} minute{minutesAgo === 1 ? '' : 's'} ago. </span>
      ) : (
        <span>Live updates appear paused. </span>
      )}
      <button type="button" className="font-medium underline" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
