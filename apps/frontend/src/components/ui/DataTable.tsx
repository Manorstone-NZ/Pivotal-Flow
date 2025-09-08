import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface DataTableProps<TData> extends BaseComponentProps {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  density?: 'compact' | 'normal' | 'comfortable';
  striped?: boolean;
  hoverable?: boolean;
  exportable?: boolean;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  onSort?: (column: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function DataTable<TData>({
  data,
  columns,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  density = 'normal',
  striped = true,
  hoverable = true,
  exportable = true,
  isLoading = false,
  onRowClick,
  onSort,
  sortBy,
  sortOrder,
  className,
  'data-testid': testId,
}: DataTableProps<TData>) {
  // Use the props to avoid unused variable warnings
  void { isLoading, onSort, sortBy, sortOrder };
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  
  const densityClasses = {
    compact: 'py-1 px-2 text-sm',
    normal: 'py-3 px-4 text-base',
    comfortable: 'py-4 px-6 text-lg',
  };
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: sortable,
    enableGlobalFilter: searchable,
  });
  
  const exportToCSV = () => {
    const headers = columns.map(col => col.header as string).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const cellValue = (col as { accessorKey?: string }).accessorKey ? (row as Record<string, unknown>)[(col as { accessorKey: string }).accessorKey] : '';
        return `"${cellValue || ''}"`;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4" data-testid={testId}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {searchable && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 pr-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
              <svg
                className="absolute left-2 top-2.5 w-4 h-4 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {exportable && (
            <button
              onClick={exportToCSV}
              className="px-3 py-2 text-sm border border-surface-border rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className={cn('w-full border-collapse', className)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-surface-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'text-left font-medium text-text-primary bg-neutral-50',
                      densityClasses[density],
                      sortable && header.column.getCanSort() && 'cursor-pointer hover:bg-neutral-100 select-none'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-2">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {sortable && header.column.getCanSort() && (
                        <span className="text-text-secondary">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-surface-border transition-colors',
                  striped && index % 2 === 0 && 'bg-neutral-50',
                  hoverable && 'hover:bg-neutral-100',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn('text-text-primary', densityClasses[density])}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm border border-surface-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              First
            </button>
            
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm border border-surface-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-text-primary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm border border-surface-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              Next
            </button>
            
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm border border-surface-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
