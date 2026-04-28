export interface ApiResponse<T> {
  status: 'ok';
  data: T;
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    status: 'ok',
    data
  };
}
