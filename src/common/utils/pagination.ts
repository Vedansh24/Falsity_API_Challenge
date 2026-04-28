export function getPaginationOffset(page: number, pageSize: number): number {
  return Math.max(0, (page - 1) * pageSize);
}
