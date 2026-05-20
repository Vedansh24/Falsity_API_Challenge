"use client";

import { useAuthState } from '../../hooks/use-auth';
import NotificationDropdown from '../notifications/notification-dropdown';
import ConnectionStatus from '../realtime/connection-status';

export default function DashboardTopbar({ onToggle }: { onToggle?: () => void }) {
  const { user } = useAuthState();

  return (
    <header className="border-b bg-white px-4 py-3 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} aria-label="Toggle sidebar" className="px-2 py-1">☰</button>
        <div className="text-sm font-medium">Dashboard</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-neutral-600">{user ? `Signed in as ${user.name}` : 'Not signed in'}</div>
        <ConnectionStatus compact showLabel={false} />
        <NotificationDropdown />
      </div>
    </header>
  );
}
