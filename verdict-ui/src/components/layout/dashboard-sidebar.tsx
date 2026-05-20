"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../../hooks/use-role';

export default function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const role = useRole();
  const pathname = usePathname();

  const itemClass = (href: string) =>
    `block px-2 py-2 rounded transition-colors ${pathname?.startsWith(href) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'}`;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-semibold">Verdict</div>
        <button aria-label="Toggle sidebar" onClick={onToggle} className="text-sm">{collapsed ? '→' : '←'}</button>
      </div>

      <nav aria-label="Sidebar" className="p-4 space-y-2 flex-1 overflow-auto">
        <Link href="/dashboard" className={itemClass('/dashboard')}>Overview</Link>
        {role === 'USER' && (
          <>
            <Link href="/dashboard/user" className={itemClass('/dashboard/user')}>My Workspace</Link>
            <Link href="/dashboard/user/claims" className={itemClass('/dashboard/user/claims')}>My Claims</Link>
            <Link href="/dashboard/user/notifications" className={itemClass('/dashboard/user/notifications')}>Notifications</Link>
          </>
        )}
        <Link href="/dashboard/claims" className={itemClass('/dashboard/claims')}>Claims</Link>
          <Link href="/dashboard/investigations" className={itemClass('/dashboard/investigations')}>Investigations</Link>
        {role && (role === 'REVIEWER' || role === 'ADMIN') && (
          <>
            <Link href="/dashboard/review" className={itemClass('/dashboard/review')}>Review</Link>
            <Link href="/dashboard/verdicts" className={itemClass('/dashboard/verdicts')}>Verdicts</Link>
          </>
        )}
        {role && (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN') && (
          <>
            <Link href="/dashboard/analyst" className={itemClass('/dashboard/analyst')}>Analyst</Link>
            <Link href="/dashboard/analyst/investigations" className={itemClass('/dashboard/analyst/investigations')}>Analyst Investigations</Link>
            <Link href="/dashboard/analyst/evidence" className={itemClass('/dashboard/analyst/evidence')}>Evidence Library</Link>
            <Link href="/dashboard/analyst/notifications" className={itemClass('/dashboard/analyst/notifications')}>Analyst Notifications</Link>
          </>
        )}
        {role && (role === 'REVIEWER' || role === 'ADMIN') && (
          <Link href="/dashboard/reviewer" className={itemClass('/dashboard/reviewer')}>Reviewer</Link>
        )}
        {role === 'ADMIN' && (
          <Link href="/dashboard/admin" className={itemClass('/dashboard/admin')}>Admin</Link>
        )}
      </nav>

      <div className="p-4 border-t text-xs text-neutral-500">Operational</div>
    </div>
  );
}
