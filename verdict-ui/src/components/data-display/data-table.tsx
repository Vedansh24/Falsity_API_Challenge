import React from 'react';

export type Column<T> = {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  /** Optional advanced filter region rendered above the table (does not change row rendering). */
  filterConfig?: React.ReactNode;
  /** Optional bulk actions region (e.g. selection toolbar). */
  bulkActions?: React.ReactNode;
};

export default function DataTable<T>({ columns, data, loading, filterConfig, bulkActions }: DataTableProps<T>) {
  if (loading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div className="p-4">No rows</div>;

  return (
    <div className="space-y-3">
      {filterConfig}
      {bulkActions}
      <div className="overflow-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left text-sm font-medium text-gray-700" style={{ width: c.width }}>
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-sm text-gray-700">
                    {c.render ? c.render(row) : (row as Record<string, React.ReactNode>)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
