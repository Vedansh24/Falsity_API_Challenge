export interface HealthResponse {
  status: 'ok';
}

export interface PingResponse {
  message: 'pong';
}

export const roles = ['USER', 'ANALYST', 'REVIEWER', 'ADMIN'] as const;

export type Role = (typeof roles)[number];

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'test' | 'production';
  JWT_SECRET: string;
}
