"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth.schema';
import type { LoginDto } from '../../schemas/auth.schema';
import Button from '../ui/button';
import Input from '../ui/input';
import { useLoginMutation } from '../../hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from '../../hooks/use-auth';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params?.get('returnUrl') ?? '/dashboard';

  const { isHydrated } = useAuthState();

  const mutation = useLoginMutation();

  const { register, handleSubmit } = useForm<LoginDto>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!isHydrated) return;
    // nothing
  }, [isHydrated]);

  async function onSubmit(data: LoginDto) {
    try {
      await mutation.mutateAsync(data as any);
      // redirect based on role via server-provided role in session (useAuthRedirectPath elsewhere)
      router.push(returnUrl ?? '/dashboard');
    } catch (err) {
      // errors surfaced via mutation
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
        <Input {...register('email')} aria-label="Email" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Password</label>
        <Input {...register('password')} type="password" aria-label="Password" />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">&nbsp;</div>
        <Button type="submit" variant="default" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>

      {mutation.isError && <div className="text-sm text-red-600">{(mutation.error as any)?.message ?? 'Login failed'}</div>}
    </form>
  );
}
