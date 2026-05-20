import './globals.css';
import '../styles/tokens.css';
import type { ReactNode } from 'react';
import ClientRoot from '../providers/client-root';

export const metadata = {
  title: 'Verdict — Platform',
  description: 'Investigative intelligence platform'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
