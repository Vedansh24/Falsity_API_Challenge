'use client';

import type { ReactNode } from 'react';

type Action = { label: string; onClick: () => void };

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: Action;
};

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-neutral-400">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-neutral-600">{description}</p>
      {action ? (
        <button
          type="button"
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
