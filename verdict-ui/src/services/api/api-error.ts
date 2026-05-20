import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError, ApiFieldErrors } from '../../types/error.types';

function extractFieldErrors(payload: unknown): ApiFieldErrors | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const fields = (payload as { errors?: unknown; fieldErrors?: unknown }).fieldErrors ?? (payload as { errors?: unknown }).errors;
  if (!fields || typeof fields !== 'object') {
    return undefined;
  }

  const normalized: ApiFieldErrors = {};
  for (const [field, value] of Object.entries(fields as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      normalized[field] = value.map((item) => String(item));
    } else if (typeof value === 'string') {
      normalized[field] = [value];
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return {
      kind: 'unknown',
      message: 'Request cancelled',
      retryable: false,
      isAuthError: false,
      isForbiddenError: false,
      isValidationError: false,
      isNetworkError: false,
      isTimeoutError: false,
      raw: error
    };
  }

  if (!axios.isAxiosError(error)) {
    return {
      kind: 'unknown',
      message: error instanceof Error ? error.message : 'Unexpected error',
      retryable: false,
      isAuthError: false,
      isForbiddenError: false,
      isValidationError: false,
      isNetworkError: false,
      isTimeoutError: false,
      raw: error
    };
  }

  const axiosError = error as AxiosError<Record<string, unknown>>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const fieldErrors = extractFieldErrors(payload);
  const messageFromPayload =
    (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
      ? payload.message
      : undefined) ??
    axiosError.message ??
    'Request failed';

  const isTimeout = axiosError.code === 'ECONNABORTED' || /timeout/i.test(messageFromPayload);
  const isNetwork = !axiosError.response || axiosError.code === 'ERR_NETWORK';
  const isAuth = status === 401;
  const isForbidden = status === 403;
  const isValidation = status === 400 || status === 422 || Boolean(fieldErrors);
  const kind = isValidation
    ? 'validation'
    : isAuth
      ? 'auth'
      : isForbidden
        ? 'forbidden'
        : isTimeout
          ? 'timeout'
          : isNetwork
            ? 'network'
            : status && status >= 500
              ? 'server'
              : 'unknown';

  return {
    kind,
    status,
    code: axiosError.code,
    message: messageFromPayload,
    fieldErrors,
    retryable: kind === 'network' || kind === 'timeout' || kind === 'server',
    isAuthError: isAuth,
    isForbiddenError: isForbidden,
    isValidationError: isValidation,
    isNetworkError: isNetwork,
    isTimeoutError: isTimeout,
    raw: error
  };
}

export function shouldRetryApiError(error: unknown): boolean {
  const normalized = normalizeApiError(error);
  return normalized.retryable;
}
