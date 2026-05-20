"use client";

import type { ReactNode } from 'react';
import Card from '../ui/card';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="max-w-md w-full">{children}</Card>
    </div>
  );
}
