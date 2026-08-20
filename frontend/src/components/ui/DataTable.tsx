'use client';

import React, { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Column Definition                                                 */
/* ------------------------------------------------------------------ */
export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  accessor?: (row: T) => string | number;
}

/* ------------------------------------------------------------------ */
/*  DataTable Props (Figma-Matched Unified Standard)                   */
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
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  rowKey?: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Reusable Unified Figma DataTable Component                        */
/* ------------------------------------------------------------------ */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search records...',
  searchKeys,
  pageSize = 10,
  emptyMessage = 'No records found.',
  headerRight,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  rowKey = 'id',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Get Key Helper ── */
  const getRowId = (row: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(row);
    if (row[rowKey] !== undefined) return String(row[rowKey]);
    return String(index);
  };

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

  /* ── Selection ── */
  const allCurrentSelected =
    paged.length > 0 &&
    paged.every((row, idx) => selectedKeys.includes(getRowId(row, (safePage - 1) * pageSize + idx)));

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const currentIds = paged.map((row, idx) =>
        getRowId(row, (safePage - 1) * pageSize + idx)
      );
      const union = Array.from(new Set([...selectedKeys, ...currentIds]));
      onSelectionChange(union);
    } else {
      const currentIds = new Set(
        paged.map((row, idx) => getRowId(row, (safePage - 1) * pageSize + idx))
      );
      onSelectionChange(selectedKeys.filter((id) => !currentIds.has(id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(id)) {
      onSelectionChange(selectedKeys.filter((k) => k !== id));
    } else {
      onSelectionChange([...selectedKeys, id]);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden font-sans ${className}`}>
      {/* Optional Search / Header Right */}
      {(searchable || headerRight) && (
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 shadow-2xs transition-all font-medium"
              />
            </div>
          )}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      {/* ── Core Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {selectable && (
                <th className="py-4.5 pl-6 pr-3 w-14">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    className={`py-4.5 px-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider ${alignClass} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-slate-900' : ''
                    } ${col.headerClassName ?? ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className={`inline-flex items-center gap-1 ${alignClass}`}>
                      <span>{col.header}</span>
                      {sortKey === col.key && (
                        <span className="text-blue-600 font-black">
                          {sortDir === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100/90 text-sm">
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-slate-400 text-xs font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const rowIdx = (safePage - 1) * pageSize + i;
                const rowId = getRowId(row, rowIdx);
                const isSelected = selectedKeys.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-blue-50/25' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td
                        className="py-5 pl-6 pr-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(rowId)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      return (
                        <td
                          key={col.key}
                          className={`py-5 px-4 ${alignClass} ${col.className ?? ''}`}
                        >
                          {col.render
                            ? col.render(row, rowIdx)
                            : String((row as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Unified Figma Pagination Footer ── */}
      <div className="px-6 py-4.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="font-medium text-[13px] text-slate-500">
          Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 select-none">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => {
              // Show pages if total is small, or smart ellipsis
              if (
                totalPages > 6 &&
                pNum !== 1 &&
                pNum !== totalPages &&
                Math.abs(pNum - safePage) > 1
              ) {
                if (pNum === 2 || pNum === totalPages - 1) {
                  return (
                    <span key={pNum} className="px-1 text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all ${
                    safePage === pNum
                      ? 'bg-[#1D68F2] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
