"use client";

import type { ReactNode } from 'react';
import PageContainer from '../components/shared/page-container';
import AuthGuard from '../components/shared/auth-guard';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <PageContainer>
          <div className="mx-auto w-full max-w-md">{children}</div>
        </PageContainer>
      </div>
    </AuthGuard>
  );
}
