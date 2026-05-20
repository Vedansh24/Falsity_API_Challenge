"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/button';
import Card from '../ui/card';
import Input from '../ui/input';
import FormField from './form-field';
import { loginSchema, type LoginDto } from '../../schemas/auth.schema';
import { useLoginMutation } from '../../hooks/use-auth';
import { getRoleHomePath } from '../../config/roles';
import { ROUTES } from '../../config/routes';
import type { LoginPayload } from '../../types/auth.types';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unable to sign in. Please try again.';
}

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginDto) => {
    try {
      const session = await loginMutation.mutateAsync(values as LoginPayload);
      router.replace(getRoleHomePath(session.role));
    } catch {
      // handled in UI
    }
  };

  return (
    <Card>
      <div className="space-y-2 mb-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-600">Access the operational platform with your work account.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register('password')} />
        </FormField>

        {loginMutation.isError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getErrorMessage(loginMutation.error)}
          </div>
        )}

        <Button type="submit" disabled={loginMutation.isLoading} className="w-full">
          {loginMutation.isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        New here?{' '}
        <button type="button" className="font-medium text-neutral-900 underline underline-offset-4" onClick={() => router.push(ROUTES.SIGNUP)}>
          Create an account
        </button>
      </div>
    </Card>
  );
}
