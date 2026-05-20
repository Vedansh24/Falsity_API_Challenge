"use client";

import type { ReactNode } from 'react';
import ProtectedRoute from '../components/shared/protected-route';
import SidebarShell from '../components/layout/sidebar-shell';
import TopbarShell from '../components/layout/topbar-shell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-neutral-50">
        <SidebarShell />
        <div className="flex-1">
          <TopbarShell />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
