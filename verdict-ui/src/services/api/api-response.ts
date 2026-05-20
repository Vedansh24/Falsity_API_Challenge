import type { ApiResponse } from '../../types/api.types';

export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  return Boolean(value) && typeof value === 'object' && 'success' in value && 'data' in value && 'message' in value;
}

export function normalizeApiResponse<T = unknown>(value: unknown): ApiResponse<T> {
  if (isApiResponse<T>(value)) {
    return value;
  }

  return {
    success: true,
    message: 'OK',
    data: value as T
  };
}

export function unwrapApiResponse<T = unknown>(value: unknown): T {
  const normalized = normalizeApiResponse<T>(value);
  return normalized.data;
}
