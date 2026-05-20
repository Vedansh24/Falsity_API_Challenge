/**
 * Connection Status
 * Connection indicator
 */

'use client';

import { useRealtimeStatus } from '../../lib/realtime/realtime-hooks';

interface ConnectionStatusProps {
  showLabel?: boolean;
  compact?: boolean;
}

export default function ConnectionStatus({ showLabel = true, compact = false }: ConnectionStatusProps) {
  const { status, isConnected, isReconnecting } = useRealtimeStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isReconnecting ? 'bg-amber-500 animate-pulse' : isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isReconnecting ? 'bg-amber-500 animate-pulse' : isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      {showLabel && (
        <span className="text-xs font-medium text-gray-700 capitalize">{status}</span>
      )}
    </div>
  );
}
