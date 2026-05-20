"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../schemas/auth.schema';
import type { SignupDto } from '../../schemas/auth.schema';
import Button from '../ui/button';
import Input from '../ui/input';
import { useSignupMutation } from '../../hooks/use-auth';

export default function SignupForm() {
  const router = useRouter();
  const mutation = useSignupMutation();

  const { register, handleSubmit } = useForm<SignupDto>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupDto) {
    try {
      await mutation.mutateAsync({ name: data.name, email: data.email, password: data.password });
      router.push('/login');
    } catch (err) {
      // handled by mutation
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Full name</label>
        <Input {...register('name')} aria-label="Full name" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
        <Input {...register('email')} aria-label="Email" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Password</label>
        <Input {...register('password')} type="password" aria-label="Password" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Confirm password</label>
        <Input {...register('confirmPassword')} type="password" aria-label="Confirm password" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="default" disabled={mutation.isLoading}>{mutation.isLoading ? 'Creating…' : 'Create account'}</Button>
      </div>

      {mutation.isError && <div className="text-sm text-red-600">{(mutation.error as any)?.message ?? 'Signup failed'}</div>}
    </form>
  );
}
