import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '../common/errors/app-error';
import { ValidationError } from '../common/errors/validation-error';

function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  if (typeof error === 'object' && error !== null && 'validation' in error) {
    return 400;
  }

  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === 'number') {
      return statusCode;
    }
  }

  return 500;
}

function getErrorMessage(error: unknown, statusCode: number): string {
  if (error instanceof ZodError) {
    return 'Validation failure';
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (statusCode >= 500) {
    return 'Internal server error';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Internal server error';
}

export function registerPlugins(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error, _request, reply) => {
    const statusCode = getStatusCode(error);
    const message = getErrorMessage(error, statusCode);

    fastify.log.error(error);
    void reply.status(statusCode).send({ error: message });
  });
}
