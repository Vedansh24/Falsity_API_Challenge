"use client";

import Link from 'next/link';

export default function MobileDashboardNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 md:hidden">
      <div className="flex justify-around">
        <Link href="/dashboard" className="text-sm">Overview</Link>
        <Link href="/claims" className="text-sm">Claims</Link>
        <Link href="/search" className="text-sm">Search</Link>
      </div>
    </nav>
  );
}
