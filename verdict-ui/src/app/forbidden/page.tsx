import Link from 'next/link';
import PublicLayout from '../../layouts/public-layout';

export default function ForbiddenPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-lg rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Forbidden</h1>
          <p className="mt-2 text-sm text-gray-600">Your account does not have permission to access this area.</p>
          <div className="mt-6">
            <Link className="text-sm font-medium text-neutral-900 underline underline-offset-4" href="/dashboard">
              Return to dashboard
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
