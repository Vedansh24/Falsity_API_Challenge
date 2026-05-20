import type { ReactNode } from 'react';

export default function Form({ children, ...props }: { children: ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className="space-y-4">
      {children}
    </form>
  );
}
