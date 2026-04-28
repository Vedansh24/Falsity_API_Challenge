import type { AuthenticatedUser } from './auth';

export interface RequestContext {
  requestId: string;
  user?: AuthenticatedUser;
}
