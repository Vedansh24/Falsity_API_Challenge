export type { AuthenticatedUser, PublicUser, Role } from './types/auth';

export interface HealthResponse {
  status: 'ok';
}

export interface PingResponse {
  message: 'pong';
}

export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'test' | 'production';
  JWT_SECRET: string;
}
