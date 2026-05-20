import { apiRequest } from './request';
import type { LoginPayload, SignupPayload } from '../../types/auth.types';
import type { User } from '../../types/user.types';

export type LoginResponse = {
  accessToken: string;
  expiresIn: string;
};

export const authService = {
  login(payload: LoginPayload) {
    return apiRequest.post<LoginResponse, LoginPayload>('/auth/login', payload);
  },
  signup(payload: SignupPayload) {
    return apiRequest.post<User, SignupPayload>('/auth/register', payload);
  },
  getCurrentUser() {
    return apiRequest.get<User>('/auth/me');
  },
  logout() {
    return Promise.resolve();
  }
};
