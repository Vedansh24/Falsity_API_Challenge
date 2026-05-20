"use client";

import AuthLayout from '../../../components/auth/auth-layout';
import AuthCard from '../../../components/auth/auth-card';
import SignupForm from '../../../components/auth/signup-form';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard title="Create an account">
        <SignupForm />
        <div className="mt-4 text-sm text-neutral-600">
          Already have an account? <Link href="/login" className="text-neutral-900">Sign in</Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
