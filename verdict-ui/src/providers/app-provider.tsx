"use client";
import type { ReactNode } from 'react';
import ThemeProvider from './theme-provider';
import QueryProvider from './query-provider';
import AuthProvider from './auth-provider';
import { RealtimeProvider } from './realtime-provider';

import ProductivityHost from '../components/productivity/productivity-host';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RealtimeProvider>
            {children}
            <ProductivityHost />
          </RealtimeProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
