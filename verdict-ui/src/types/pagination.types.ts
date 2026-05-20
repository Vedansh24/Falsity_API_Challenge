export type PaginationMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  prevCursor?: string | null;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
};
