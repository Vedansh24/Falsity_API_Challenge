import type { Role } from '../config/roles';
import type { User } from './user.types';
import type { ApiResponse } from './api.types';

export type AuthSession = {
  accessToken: string | null;
  user: User | null;
  role: Role | null;
  expiresIn?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse<T = unknown> = ApiResponse<T>;

export type AuthState = {
  accessToken: string | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
};
