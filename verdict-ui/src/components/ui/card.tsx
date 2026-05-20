import type { ReactNode, AriaRole } from 'react';

export default function Card({
  children,
  className,
  id,
  tabIndex,
  role
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tabIndex?: number;
  role?: AriaRole;
}) {
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={role}
      className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
