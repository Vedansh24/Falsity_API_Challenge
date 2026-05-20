"use client";

export default function AccessDeniedState() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold">Access denied</h2>
      <p className="text-sm text-neutral-600 mt-2">Your account does not have permission to view this area.</p>
    </div>
  );
}
