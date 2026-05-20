/**
 * Realtime Error
 * Error state display
 */

'use client';

interface RealtimeErrorProps {
  error?: Error | null;
  message?: string;
  retry?: () => void;
}

export default function RealtimeError({
  error,
  message = 'Failed to connect to realtime updates',
  retry
}: RealtimeErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
          {error && (
            <p className="text-xs text-red-700 mt-1">{error.message}</p>
          )}
          {retry && (
            <button
              onClick={retry}
              className="text-xs font-medium text-red-600 hover:text-red-700 mt-2 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
