'use client';

import React, { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Column definition                                                   */
/* ------------------------------------------------------------------ */
export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  accessor?: (row: T) => string | number;
}

/* ------------------------------------------------------------------ */
/*  DataTable props                                                     */
/* ------------------------------------------------------------------ */
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T & string)[];
  pageSize?: number;
  emptyMessage?: string;
  headerRight?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  DataTable                                                           */
/* ------------------------------------------------------------------ */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  pageSize = 10,
  emptyMessage = 'No records found.',
  headerRight,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      if (searchKeys?.length) {
        return searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q));
      }
      return Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [data, search, searchKeys]);

  /* ── Sorting ── */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      const aVal = col?.accessor?.(a) ?? (a as Record<string, unknown>)[sortKey] ?? '';
      const bVal = col?.accessor?.(b) ?? (b as Record<string, unknown>)[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      {(searchable || headerRight) && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {searchable && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all w-48 sm:w-56"
              />
            </div>
          )}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700' : ''} ${col.headerClassName ?? ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-50/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(row, (safePage - 1) * pageSize + i)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sorted.length > pageSize && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)}{' '}
            of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
