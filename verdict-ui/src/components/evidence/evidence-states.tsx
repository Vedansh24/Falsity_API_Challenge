'use client';

export function EvidenceLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
      ))}
    </div>
  );
}

export function EvidenceEmpty() {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-gray-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-gray-600 font-medium">No evidence collected yet</p>
      <p className="text-sm text-gray-500 mt-1">Add evidence sources to support or contradict this claim.</p>
    </div>
  );
}

interface EvidenceErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function EvidenceError({ message = 'Failed to load evidence', onRetry }: EvidenceErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-red-600">
          <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-red-800 font-medium">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-sm text-red-600 hover:text-red-800 mt-1 font-medium">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
