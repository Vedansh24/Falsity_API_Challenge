import type { FastifyReply, FastifyRequest } from 'fastify';

import type { AuthenticatedUser } from '../types/auth';

declare module 'fastify' {
  interface FastifyRequest {
    authContext?: AuthenticatedUser;
  }
}

export async function authContextHook(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (request.user !== undefined) {
    request.authContext = request.user;
  }
}
