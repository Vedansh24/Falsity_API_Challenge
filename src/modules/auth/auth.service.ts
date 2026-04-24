import bcrypt from 'bcrypt';

import { signToken } from '../../lib/jwt';
import type { AuthenticatedUser, PublicUser } from '../../common/types';

import {
  createUser,
  findUserByEmail,
  findUserById
} from './auth.repository';
import type {
  AuthUserRecord,
  CurrentUser,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse
} from './auth.types';

export class AuthServiceError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AuthServiceError';
    this.statusCode = statusCode;
  }
}

function toPublicUser(user: AuthUserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
  const email = normalizeEmail(input.email);
  const existingUser = await findUserByEmail(email);

  if (existingUser !== null) {
    throw new AuthServiceError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await createUser({
    name: input.name.trim(),
    email,
    passwordHash,
    role: 'USER'
  });

  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const email = normalizeEmail(input.email);
  const user = await findUserByEmail(email);

  if (user === null) {
    throw new AuthServiceError(401, 'Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthServiceError(401, 'Invalid credentials');
  }

  const accessToken = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    accessToken,
    expiresIn: '1d'
  };
}

export async function getCurrentUser(user: AuthenticatedUser): Promise<CurrentUser> {
  const freshUser = await findUserById(user.userId);

  if (freshUser === null) {
    throw new AuthServiceError(404, 'User not found');
  }

  return toPublicUser(freshUser);
}
