export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta: unknown | null;
  // legacy: keep status/data for backward compatibility with existing preSerialization
  status: 'ok';
}

export function createApiResponse<T = unknown>(data: T, message = 'Operation successful', meta: unknown | null = null): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    status: 'ok'
  } as ApiResponse<T>;
}
