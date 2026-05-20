export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => ['auth', 'session'] as const,
    me: () => ['auth', 'me'] as const
  },
  claims: {
    all: ['claims'] as const,
    lists: () => ['claims', 'list'] as const,
    detail: (claimId: string) => ['claims', 'detail', claimId] as const,
    evidence: (claimId: string) => ['claims', 'evidence', claimId] as const
  },
  investigations: {
    all: ['investigations'] as const,
    lists: () => ['investigations', 'list'] as const,
    detail: (investigationId: string) => ['investigations', 'detail', investigationId] as const
  },
  evidence: {
    all: ['evidence'] as const,
    lists: () => ['evidence', 'list'] as const,
    detail: (evidenceId: string) => ['evidence', 'detail', evidenceId] as const,
    byClaim: (claimId: string) => ['evidence', 'claim', claimId] as const
  },
  verdicts: {
    all: ['verdicts'] as const,
    lists: () => ['verdicts', 'list'] as const,
    detail: (claimId: string) => ['verdicts', 'detail', claimId] as const,
    history: (claimId: string) => ['verdicts', 'history', claimId] as const
  },
  comments: {
    all: ['comments'] as const,
    lists: () => ['comments', 'list'] as const,
    byClaim: (claimId: string) => ['comments', 'claim', claimId] as const
  },
  audit: {
    all: ['audit'] as const,
    lists: () => ['audit', 'list'] as const,
    detail: (recordId: string) => ['audit', 'detail', recordId] as const
  },
  notifications: {
    all: ['notifications'] as const,
    lists: () => ['notifications', 'list'] as const
  },
  monitoring: {
    all: ['monitoring'] as const,
    metrics: () => ['monitoring', 'metrics'] as const,
    health: () => ['monitoring', 'health'] as const
  }
} as const;

