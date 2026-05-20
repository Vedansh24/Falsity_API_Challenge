"use client";

import AuthLayout from '../../../components/auth/auth-layout';
import AuthCard from '../../../components/auth/auth-card';
import LoginForm from '../../../components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard title="Sign in to Verdict">
        <LoginForm />
        <div className="mt-4 text-sm text-neutral-600">
          New to the platform? <Link href="/signup" className="text-neutral-900">Create an account</Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
