import { AuthError } from '../../common/errors/auth-error';
import type { AuthenticatedUser, PublicUser } from '../../common/types';
import { comparePassword, hashPassword } from '../../common/utils/hashing';

import {
  createUser,
  findUserByEmail,
  findUserById
} from './auth.repository';
import type {
  AuthUserRecord,
  CurrentUser,
  LoginInput,
  LoginUserPayload,
  RegisterInput,
  RegisterResponse
} from './auth.types';



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
    throw new AuthError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    name: input.name.trim(),
    email,
    passwordHash,
    role: 'USER'
  });

  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<LoginUserPayload> {
  const email = normalizeEmail(input.email);
  const user = await findUserByEmail(email);

  if (user === null) {
    throw new AuthError(401, 'Invalid credentials');
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthError(401, 'Invalid credentials');
  }

  return {
    userId: user.id,
    role: user.role
  };
}

export async function getCurrentUser(user: AuthenticatedUser): Promise<CurrentUser> {
  const freshUser = await findUserById(user.userId);

  if (freshUser === null) {
    throw new AuthError(404, 'User not found');
  }

  return toPublicUser(freshUser);
}
