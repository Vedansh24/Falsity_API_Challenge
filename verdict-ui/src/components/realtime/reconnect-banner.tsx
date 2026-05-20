/**
 * Reconnect Banner
 * Shows reconnection status
 */

'use client';

import { useRealtimeStatus } from '../../lib/realtime/realtime-hooks';

export default function ReconnectBanner() {
  const { isReconnecting } = useRealtimeStatus();

  if (!isReconnecting) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 left-4 right-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg max-w-md mx-auto z-40">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Reconnecting...</p>
          <p className="text-xs text-amber-700 mt-0.5">Please wait while we restore your connection</p>
        </div>
      </div>
    </div>
  );
}
