"use client";

import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AuthCard({ title, children }: Props) {
  return (
    <div className="p-6">
      {title && <h1 className="text-xl font-semibold mb-4">{title}</h1>}
      <div>{children}</div>
    </div>
  );
}
