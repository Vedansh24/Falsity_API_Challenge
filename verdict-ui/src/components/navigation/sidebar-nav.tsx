"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../../hooks/use-role';

export default function SidebarNav() {
  const role = useRole();
  const pathname = usePathname();

  const itemClass = (href: string) =>
    `block rounded px-2 py-2 text-sm transition-colors ${pathname?.startsWith(href) ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`;

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      <Link href="/dashboard" className={itemClass('/dashboard')}>Overview</Link>
      <Link href="/dashboard/claims" className={itemClass('/dashboard/claims')}>Claims</Link>
      {role && (role === 'ANALYST' || role === 'ADMIN') && <Link href="/dashboard/analyst" className={itemClass('/dashboard/analyst')}>Analyst</Link>}
      {role && (role === 'REVIEWER' || role === 'ADMIN') && <Link href="/dashboard/reviewer" className={itemClass('/dashboard/reviewer')}>Reviewer</Link>}
      {role === 'ADMIN' && <Link href="/dashboard/admin" className={itemClass('/dashboard/admin')}>Admin</Link>}
    </nav>
  );
}
