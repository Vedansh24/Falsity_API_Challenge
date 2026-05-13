import { AppError } from './app-error';

export class ExternalServiceError extends AppError {
  constructor(message = 'External service error', details?: unknown) {
    super(502, message, 'EXTERNAL_SERVICE_ERROR', details);
    this.name = 'ExternalServiceError';
  }
}
