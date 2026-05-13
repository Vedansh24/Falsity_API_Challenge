export interface ErrorDetails {
  path?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: ErrorDetails[];
  };
}

export function createErrorResponse(message: string, code = 'ERROR', details: ErrorDetails[] = []): ErrorResponse {
  return {
    success: false,
    message,
    error: {
      code,
      details
    }
  };
}
