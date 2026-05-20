"use client";

import { useRouter } from 'next/navigation';
import Button from '../ui/button';
import { useAuthState, useLogoutMutation } from '../../hooks/use-auth';

export default function UserMenu() {
  const router = useRouter();
  const { user, role, isAuthenticated } = useAuthState();
  const logoutMutation = useLogoutMutation();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium">{user?.name ?? 'Signed in'}</div>
        <div className="text-xs text-gray-500">{role ?? 'USER'}</div>
      </div>
      <Button
        type="button"
        disabled={logoutMutation.isLoading}
        onClick={async () => {
          await logoutMutation.mutateAsync(undefined);
          router.replace('/login');
        }}
      >
        {logoutMutation.isLoading ? 'Signing out...' : 'Logout'}
      </Button>
    </div>
  );
}
