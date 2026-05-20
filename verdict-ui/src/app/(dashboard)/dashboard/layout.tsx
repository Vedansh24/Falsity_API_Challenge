"use client";

import DashboardShell from '../../../components/layout/dashboard-shell';
import { useAuthState } from '../../../hooks/use-auth';
import { useRealTimeLiveClaims } from '../../../hooks/realtime/use-live-claims';
import { useRealtimeLiveVerdicts } from '../../../hooks/realtime/use-live-verdicts';
import { useRealtimeLiveInvestigations } from '../../../hooks/realtime/use-live-investigations';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthState();

  // Initialize realtime subscriptions
  useRealTimeLiveClaims();
  useRealtimeLiveVerdicts();
  useRealtimeLiveInvestigations();

  // Keep layout rendering client-only and wait for hydration
  if (!isHydrated) return <div className="p-8">Loading…</div>;
  if (!isAuthenticated) return <div className="p-8">Access denied</div>;

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
