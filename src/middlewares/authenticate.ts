import type { FastifyReply, FastifyRequest } from 'fastify';
import type { JwtPayload } from 'jsonwebtoken';

import type { AuthenticatedUser, Role } from '../common/types';
import { verifyToken } from '../lib/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

function isRole(value: unknown): value is Role {
  return value === 'USER' || value === 'ANALYST' || value === 'REVIEWER' || value === 'ADMIN';
}

function extractToken(authorizationHeader: string): string | null {
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return null;
  }

  const token = match[1]?.trim();
  return token && token.length > 0 ? token : null;
}

function isAuthenticatedPayload(payload: JwtPayload | null): payload is JwtPayload & { userId: string; role: Role } {
  return (
    payload !== null &&
    typeof payload.userId === 'string' &&
    typeof payload.role === 'string' &&
    isRole(payload.role)
  );
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authorizationHeader = request.headers.authorization;

  if (authorizationHeader === undefined) {
    void reply.code(401).send({ error: 'Authorization header missing' });
    return;
  }

  const token = extractToken(authorizationHeader);

  if (token === null) {
    void reply.code(401).send({ error: 'Invalid or expired token' });
    return;
  }

  const payload = verifyToken(token);

  if (!isAuthenticatedPayload(payload)) {
    void reply.code(401).send({ error: 'Invalid or expired token' });
    return;
  }

  request.user = {
    userId: payload.userId,
    role: payload.role
  };
}
