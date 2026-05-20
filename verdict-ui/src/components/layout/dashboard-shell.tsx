"use client";

import React from 'react';
import DashboardSidebar from './dashboard-sidebar';
import DashboardTopbar from './dashboard-topbar';
import DashboardContent from './dashboard-content';
import NotificationCenter from '../notifications/notification-center';
import ReconnectBanner from '../realtime/reconnect-banner';
import OfflineBanner from '../system/offline-banner';
import SkipLink from '../system/skip-link';
import { useUiStore } from '../../stores/ui.store';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((s) => s.workspacePreferences.sidebarCollapsed);
  const setWorkspacePreferences = useUiStore((s) => s.setWorkspacePreferences);

  const toggle = () => {
    setWorkspacePreferences({ sidebarCollapsed: !collapsed });
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <SkipLink />
      <aside
        className={`transition-all ${collapsed ? 'w-16' : 'w-64'} bg-white border-r`}
        role="navigation"
        aria-label="Main navigation"
      >
        <DashboardSidebar collapsed={collapsed} onToggle={toggle} />
      </aside>

      <div className="flex-1 flex flex-col">
        <DashboardTopbar onToggle={toggle} />
        <OfflineBanner />
        <DashboardContent>{children}</DashboardContent>
      </div>

      <NotificationCenter position="top-right" maxNotifications={5} />
      <ReconnectBanner />
    </div>
  );
}
