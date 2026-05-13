import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '../common/errors/app-error';
import { ValidationError } from '../common/errors/validation-error';
import { createErrorResponse } from '../common/responses/error-response';
import { createApiResponse } from '../common/responses/api-response';
import { formatZodErrors } from '../common/utils/validation';

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
  // Standardize successful responses when controllers return raw payloads.
  fastify.addHook('onSend', async (_request, reply, payload) => {
    try {
      // Only wrap successful non-error responses
      const statusCode = reply.statusCode ?? 200;
      if (statusCode >= 400) return payload;

      // If payload is a string, try to parse JSON
      let parsed: any = payload;
      if (typeof payload === 'string') {
        try {
          parsed = JSON.parse(payload);
        } catch {
          // leave as-is (could be HTML or plain text)
          return payload;
        }
      }

      // If already standardized, do nothing
      if (parsed && typeof parsed === 'object' && 'success' in parsed) {
        return payload;
      }

      // Build standardized success envelope
      const envelope = createApiResponse(parsed, 'Operation successful', null);
      return JSON.stringify(envelope);
    } catch (e) {
      fastify.log.error(e);
      return payload;
    }
  });

  fastify.setErrorHandler((error, _request, reply) => {
    const statusCode = getStatusCode(error);

    let message = getErrorMessage(error, statusCode);
    let code = 'ERROR';
    let details: unknown[] = [];

    if (error instanceof AppError) {
      code = error.code ?? code;
      details = error.details ? [error.details] : [];
    }

    if (error instanceof ZodError) {
      details = formatZodErrors(error as unknown as ZodError);
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
    }

    if (typeof error === 'object' && error !== null && 'validation' in error) {
      // fastify-validator style
      // Include raw validation if present
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      details = (error as any).validation || [];
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
    }

    fastify.log.error(error);

    const payload = createErrorResponse(message, String(code), Array.isArray(details) ? details as any[] : []);
    void reply.status(statusCode).send(payload);
  });
}
