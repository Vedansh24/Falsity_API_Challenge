export function loading() {
  return (
    <div className="space-y-6">
      {/* Navigation skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        <span className="text-gray-300">/</span>
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Header skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
        <div className="h-8 w-2/3 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 min-h-96">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 min-h-64">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
