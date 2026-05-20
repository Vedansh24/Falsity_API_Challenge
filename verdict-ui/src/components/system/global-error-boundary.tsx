'use client';

import React, { type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../lib/logger';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('GlobalErrorBoundary', error.message, info.componentStack ?? '');
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-neutral-50 p-8">
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-lg font-semibold text-neutral-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-neutral-600">Please reload the page to continue.</p>
            <button
              type="button"
              className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
