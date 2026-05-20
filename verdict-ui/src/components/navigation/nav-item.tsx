import Link from 'next/link';
import type { ReactNode } from 'react';

export default function NavItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block px-2 py-2 rounded hover:bg-neutral-100">{children}</Link>
  );
}
