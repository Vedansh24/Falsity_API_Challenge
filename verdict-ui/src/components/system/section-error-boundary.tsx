'use client';

import React, { type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../lib/logger';
import ErrorState from './error-state';

type Props = {
  children: ReactNode;
  title?: string;
};

type State = { error: Error | null };

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    logger.error('[SectionErrorBoundary]', error.message);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorState
          severity="section"
          title={this.props.title ?? 'This section'}
          description="Something went wrong while rendering this panel."
          retry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
