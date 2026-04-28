import type { FastifyLoggerOptions } from 'fastify';

import { config } from './env';

export function createLoggerOptions(): FastifyLoggerOptions {
  return {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug'
  };
}
