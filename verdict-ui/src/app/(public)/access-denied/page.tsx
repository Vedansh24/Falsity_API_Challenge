"use client";

import AuthLayout from '../../../components/auth/auth-layout';
import AccessDeniedState from '../../../components/auth/access-denied-state';

export default function AccessDeniedPage() {
  return (
    <AuthLayout>
      <AccessDeniedState />
    </AuthLayout>
  );
}
