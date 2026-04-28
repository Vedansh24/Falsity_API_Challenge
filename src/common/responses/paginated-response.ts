export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function createPaginatedResponse<T>(input: {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}): PaginatedResponse<T> {
  return {
    items: input.items,
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize))
  };
}
