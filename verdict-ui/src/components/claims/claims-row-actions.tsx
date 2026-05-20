"use client";

import Link from 'next/link';
import Button from '../ui/button';
import type { Role } from '../../config/roles';

const buttonLikeClass = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100';

type Props = {
  claimId: string;
  claimSlug?: string;
  role?: Role | null;
};

export default function ClaimsRowActions({ claimId, claimSlug, role }: Props) {
  const href = claimSlug ? `/dashboard/claims/${claimSlug}` : `/dashboard/claims/${claimId}`;

  const copyValue = async () => {
    const value = claimSlug ?? claimId;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
    }
  };

  const showWorkflowHint = role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN';

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={href} className={buttonLikeClass}>
        Open
      </Link>
      <Button type="button" onClick={copyValue} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
        Copy ID
      </Button>
      {showWorkflowHint && (
        <Button type="button" disabled className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
          Workflow visibility
        </Button>
      )}
    </div>
  );
}
