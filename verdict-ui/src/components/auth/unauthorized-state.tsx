"use client";

import Link from 'next/link';

export default function UnauthorizedState() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold">Access required</h2>
      <p className="text-sm text-neutral-600 mt-2">You must be signed in to access this area.</p>
      <div className="mt-4">
        <Link href="/login" className="inline-block px-3 py-2 bg-neutral-900 text-white rounded">Sign in</Link>
      </div>
    </div>
  );
}
