import { AppError } from './app-error';

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(404, message, 'NOT_FOUND_ERROR', details);
    this.name = 'NotFoundError';
  }
}
