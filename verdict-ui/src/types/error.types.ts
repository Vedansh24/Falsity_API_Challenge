export type ApiErrorKind =
  | 'validation'
  | 'auth'
  | 'forbidden'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

export type ApiFieldErrors = Record<string, string[]>;

export type ApiError = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: ApiFieldErrors;
  retryable: boolean;
  isAuthError: boolean;
  isForbiddenError: boolean;
  isValidationError: boolean;
  isNetworkError: boolean;
  isTimeoutError: boolean;
  raw?: unknown;
};
