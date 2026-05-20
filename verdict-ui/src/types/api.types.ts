export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
};

export type ApiEnvelope<T = unknown> = ApiResponse<T>;

export type QueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  cursor?: string;
  filters?: Record<string, string | number | boolean | null | undefined>;
};

export type MutationResult<T = unknown> = ApiResponse<T>;

export type PaginatedData<T> = {
  items: T[];
  meta?: unknown;
};
