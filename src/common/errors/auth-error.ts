import { AppError } from './app-error';

export class AuthError extends AppError {
  constructor(statusCode: number, message: string, details?: unknown) {
    super(statusCode, message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}
