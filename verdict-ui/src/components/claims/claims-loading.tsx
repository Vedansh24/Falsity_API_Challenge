"use client";

export default function ClaimsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-xl border border-neutral-200 bg-white" />
      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
