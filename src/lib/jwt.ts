import jwt, { type JwtPayload } from 'jsonwebtoken';

import { config } from '../config/env';
import type { Role } from '../common/types';

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: { userId: string; role: Role }): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const verified = jwt.verify(token, config.JWT_SECRET);

    if (typeof verified === 'string') {
      return null;
    }

    return verified;
  } catch {
    return null;
  }
}
