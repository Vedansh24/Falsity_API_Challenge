import type { Role, PublicUser, AuthenticatedUser } from '../../../common/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterResponse extends PublicUser {}

export interface LoginResponse {
  accessToken: string;
  expiresIn: '1d';
}

export type CurrentUser = PublicUser;
export type TokenUser = AuthenticatedUser;

export type LoginUserPayload = AuthenticatedUser;
