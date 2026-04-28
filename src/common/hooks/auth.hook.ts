import type { FastifyRequest } from 'fastify';

import { AuthError } from '../errors/auth-error';

export async function authenticate(request: FastifyRequest): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new AuthError(401, 'Invalid or expired token');
  }
}
