export function loading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full max-w-2xl bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Toolbar skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-40 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-40 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>

      {/* Count skeleton */}
      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />

      {/* Table skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {/* Header */}
          <div className="bg-gray-50 p-4 flex gap-4">
            <div className="flex-1 h-4 bg-gray-200 animate-pulse rounded w-1/6" />
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex gap-4">
              <div className="flex-1 h-4 bg-gray-100 animate-pulse rounded w-1/6" />
              <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
