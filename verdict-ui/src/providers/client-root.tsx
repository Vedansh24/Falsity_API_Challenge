'use client';

import type { ReactNode } from 'react';
import { GlobalErrorBoundary } from '../components/system/global-error-boundary';
import AppProvider from './app-provider';

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <AppProvider>{children}</AppProvider>
    </GlobalErrorBoundary>
  );
}
