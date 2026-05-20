"use client";

export default function ClaimDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-100" />
        <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-neutral-100" />
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
