"use client";

import Button from '../ui/button';

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const pageSizes = [10, 20, 50, 100];

export default function ClaimsPagination({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-neutral-600">
        Showing page <span className="font-medium text-neutral-900">{page}</span> of <span className="font-medium text-neutral-900">{totalPages}</span> across <span className="font-medium text-neutral-900">{totalItems}</span> claims
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-neutral-600">
          <span className="mr-2">Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <Button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
          Previous
        </Button>
        <Button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
          Next
        </Button>
      </div>
    </div>
  );
}
