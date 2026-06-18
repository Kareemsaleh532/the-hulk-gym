import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from '../feedback/Skeleton';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'right' | 'left' | 'center';
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  rowKey?: (row: T, index: number) => string | number;
}

export function ResponsiveTable<T>({
  columns,
  data,
  isLoading = false,
  emptyState,
  sortKey,
  sortDirection,
  onSort,
  renderMobileCard,
  rowKey = (_, idx) => idx,
}: ResponsiveTableProps<T>) {
  
  const handleSortClick = (column: TableColumn<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const getAlignClass = (align?: 'right' | 'left' | 'center') => {
    if (align === 'left') return 'text-left';
    if (align === 'center') return 'text-center';
    return 'text-right';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Desktop Skeleton */}
        <div className="hidden md:block border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="bg-slate-50 dark:bg-slate-800 h-12 border-b border-slate-100 dark:border-slate-700" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        {/* Mobile Skeleton */}
        <div className="block md:hidden space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl space-y-3">
            <Skeleton className="h-6 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl space-y-3">
            <Skeleton className="h-6 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
        {emptyState || (
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا توجد بيانات لعرضها</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View (Standard Table) */}
      <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSortClick(col)}
                  className={`px-6 py-4 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors' : ''} ${getAlignClass(col.align)}`}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === 'left' ? 'flex-row-reverse' : ''}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
            {data.map((row, rowIdx) => (
              <tr
                key={rowKey(row, rowIdx)}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${getAlignClass(col.align)}`}>
                    {col.render ? col.render(row, rowIdx) : (row as any)[col.key]?.toString() || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Card List) */}
      <div className="block md:hidden space-y-4">
        {data.map((row, rowIdx) => {
          if (renderMobileCard) {
            return (
              <div key={rowKey(row, rowIdx)}>
                {renderMobileCard(row, rowIdx)}
              </div>
            );
          }

          // Fallback Default Card Render
          return (
            <div
              key={rowKey(row, rowIdx)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-3 transition-all active:scale-[0.99]"
            >
              {columns.map((col) => {
                // Skip display of actions in normal stacked keys or display separately
                if (col.key === 'actions' || col.key === 'actions-left' || col.key === 'options') {
                  return col.render ? (
                    <div key={col.key} className="pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                      {col.render(row, rowIdx)}
                    </div>
                  ) : null;
                }

                return (
                  <div key={col.key} className="flex justify-between items-center text-xs gap-4">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {col.header}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-205 text-left">
                      {col.render ? col.render(row, rowIdx) : (row as any)[col.key]?.toString() || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
