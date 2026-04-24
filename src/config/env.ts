import dotenv from 'dotenv';
import { resolve } from 'node:path';

import type { EnvConfig } from '../common/types';

dotenv.config({ path: resolve(process.cwd(), '.env') });

if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET.trim().length === 0) {
  dotenv.config({ path: resolve(process.cwd(), 'src', '.env') });
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value.trim().length === 0) {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}. Expected an integer between 1 and 65535.`);
  }

  return port;
}

function parseHost(value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    return '0.0.0.0';
  }

  return value;
}

function parseNodeEnv(value: string | undefined): EnvConfig['NODE_ENV'] {
  if (value === undefined || value.trim().length === 0) {
    return 'development';
  }

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error(`Invalid NODE_ENV value: ${value}. Expected development, test, or production.`);
}

function parseJwtSecret(value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error('Missing required environment variable JWT_SECRET.');
  }

  return value;
}

export const config: EnvConfig = {
  PORT: parsePort(process.env.PORT),
  HOST: parseHost(process.env.HOST),
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  JWT_SECRET: parseJwtSecret(process.env.JWT_SECRET)
};
