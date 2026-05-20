"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/button';
import Card from '../ui/card';
import Input from '../ui/input';
import FormField from './form-field';
import { signupSchema, type SignupDto } from '../../schemas/auth.schema';
import { useSignupMutation } from '../../hooks/use-auth';
import { ROUTES } from '../../config/routes';
import type { SignupPayload } from '../../types/auth.types';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unable to create the account. Please try again.';
}

export default function SignupForm() {
  const router = useRouter();
  const signupMutation = useSignupMutation();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupDto>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: SignupDto) => {
    try {
      await signupMutation.mutateAsync(values as SignupPayload);
      router.replace(`${ROUTES.LOGIN}?registered=1`);
    } catch {
      // handled in UI
    }
  };

  return (
    <Card>
      <div className="space-y-2 mb-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-gray-600">Join the operational platform with a trusted work account.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Name" error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword?.message}>
          <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>

        {signupMutation.isError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getErrorMessage(signupMutation.error)}
          </div>
        )}

        <Button type="submit" disabled={signupMutation.isLoading} className="w-full">
          {signupMutation.isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <button type="button" className="font-medium text-neutral-900 underline underline-offset-4" onClick={() => router.push(ROUTES.LOGIN)}>
          Sign in
        </button>
      </div>
    </Card>
  );
}
