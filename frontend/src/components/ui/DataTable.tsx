'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────────────
 *  Column Definition
 * ─────────────────────────────────────────────────────────────────── */
export interface Column<T> {
  /** Unique key for this column (must match a data field or be a custom key) */
  key: string;
  /** Display header label */
  header: string;
  /** Custom cell renderer — receives the row and its absolute index */
  render?: (row: T, index: number) => React.ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom accessor for sorting (defaults to row[key]) */
  accessor?: (row: T) => string | number | Date;
  /** Extra class on <td> */
  className?: string;
  /** Extra class on <th> */
  headerClassName?: string;
  /** Whether column is hidden on small screens */
  hideOnMobile?: boolean;
}

/* ───────────────────────────────────────────────────────────────────
 *  DataTable Props
 * ─────────────────────────────────────────────────────────────────── */
export interface DataTableProps<T> {
  /** Row data array */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Enable built-in search bar */
  searchable?: boolean;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Specific keys to search within (defaults to all keys) */
  searchKeys?: (keyof T & string)[];
  /** Rows per page */
  pageSize?: number;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Custom empty state icon */
  emptyIcon?: React.ComponentType<{ className?: string }>;
  /** Content to render in the header-right slot (e.g., badge, export button) */
  headerRight?: React.ReactNode;
  /** Enable checkbox selection column */
  selectable?: boolean;
  /** Controlled selected row keys */
  selectedKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (selectedKeys: string[]) => void;
  /** Row key extractor (string field name or function) */
  rowKey?: keyof T | ((row: T) => string);
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Additional class on the outer wrapper */
  className?: string;
  /** Show loading skeleton instead of data */
  loading?: boolean;
  /** Show compact/dense rows */
  dense?: boolean;
  /** Hide pagination footer */
  hidePagination?: boolean;
  /** Show row numbers in the first column */
  showRowNumbers?: boolean;
  /** Stripe alternating rows */
  striped?: boolean;
  /** Caption text below the table */
  caption?: string;
}

/* ───────────────────────────────────────────────────────────────────
 *  Skeleton Row (loading state)
 * ─────────────────────────────────────────────────────────────────── */
function SkeletonRow({ cols, dense }: { cols: number; dense: boolean }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className={`${dense ? 'py-2' : 'py-3'} px-4`}>
          <div className={`bg-slate-100 rounded ${dense ? 'h-3' : 'h-4'} ${i === 0 ? 'w-20' : 'w-full max-w-[120px]'}`} />
        </td>
      ))}
    </tr>
  );
}

/* ───────────────────────────────────────────────────────────────────
 *  DataTable Component
 * ─────────────────────────────────────────────────────────────────── */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search records...',
  searchKeys,
  pageSize = 10,
  emptyMessage = 'No records found.',
  emptyIcon: EmptyIcon = Inbox,
  headerRight,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  rowKey = 'id',
  onRowClick,
  className = '',
  loading = false,
  dense = false,
  hidePagination = false,
  showRowNumbers = false,
  striped = false,
  caption,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Row ID helper ── */
  const getRowId = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(row);
      if (row[rowKey] !== undefined) return String(row[rowKey]);
      return String(index);
    },
    [rowKey],
  );

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      if (searchKeys?.length) {
        return searchKeys.some((k) =>
          String(row[k] ?? '')
            .toLowerCase()
            .includes(q),
        );
      }
      return Object.values(row).some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(q),
      );
    });
  }, [data, search, searchKeys]);

  /* ── Sorting ── */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      const aVal = col?.accessor?.(a) ?? (a as Record<string, unknown>)[sortKey] ?? '';
      const bVal = col?.accessor?.(b) ?? (b as Record<string, unknown>)[sortKey] ?? '';
      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDir === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
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
    paged.every((row, idx) =>
      selectedKeys.includes(
        getRowId(row, (safePage - 1) * pageSize + idx),
      ),
    );

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const currentIds = paged.map((row, idx) =>
        getRowId(row, (safePage - 1) * pageSize + idx),
      );
      onSelectionChange(
        Array.from(new Set([...selectedKeys, ...currentIds])),
      );
    } else {
      const currentIds = new Set(
        paged.map((row, idx) =>
          getRowId(row, (safePage - 1) * pageSize + idx),
        ),
      );
      onSelectionChange(selectedKeys.filter((id) => !currentIds.has(id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedKeys.includes(id)
        ? selectedKeys.filter((k) => k !== id)
        : [...selectedKeys, id],
    );
  };

  /* ── Helpers ── */
  const alignClass = (align?: string) =>
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  const totalCols =
    columns.length + (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0);

  /* ── Pagination range ── */
  const getPaginationRange = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (safePage > 3) pages.push('...');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  /* ═══════════════════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════════════════ */
  return (
    <div
      className={`bg-white rounded border border-slate-200 overflow-hidden font-sans ${className}`}
    >
      {/* ── Header: Search + Custom Actions ── */}
      {(searchable || headerRight) && (
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
          {searchable ? (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 text-[13px] bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          ) : (
            <div />
          )}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      {/* ── Selection info bar ── */}
      {selectable && selectedKeys.length > 0 && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2 text-[13px]">
          <span className="font-semibold text-primary">
            {selectedKeys.length} selected
          </span>
          <button
            onClick={() => onSelectionChange?.([])}
            className="text-[12px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {/* Checkbox column */}
              {selectable && (
                <th className={`${dense ? 'py-2' : 'py-3'} pl-5 pr-2 w-10`}>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                  />
                </th>
              )}

              {/* Row number column */}
              {showRowNumbers && (
                <th
                  className={`${dense ? 'py-2' : 'py-3'} px-3 w-10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider`}
                >
                  #
                </th>
              )}

              {/* Data columns */}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    ${dense ? 'py-2' : 'py-3'} px-4
                    text-[11px] font-semibold text-slate-500 uppercase tracking-wider
                    ${alignClass(col.align)}
                    ${col.sortable ? 'cursor-pointer select-none hover:text-slate-800' : ''}
                    ${col.headerClassName ?? ''}
                    ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}
                  `}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span
                    className={`inline-flex items-center gap-1.5 ${alignClass(col.align)}`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-300">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Loading state */}
            {loading &&
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <SkeletonRow key={`skel-${i}`} cols={totalCols} dense={dense} />
              ))}

            {/* Empty state */}
            {!loading && paged.length === 0 && (
              <tr>
                <td
                  colSpan={totalCols}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
                      <EmptyIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {emptyMessage}
                      </p>
                      {search && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setPage(1);
                          }}
                          className="text-[12px] text-primary hover:underline mt-1 cursor-pointer"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              paged.map((row, i) => {
                const rowIdx = (safePage - 1) * pageSize + i;
                const rowId = getRowId(row, rowIdx);
                const isSelected = selectedKeys.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`
                      transition-colors
                      ${isSelected ? 'bg-primary/5' : striped && i % 2 === 1 ? 'bg-slate-50/40' : ''}
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/60'}
                    `}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <td
                        className={`${dense ? 'py-2' : 'py-3'} pl-5 pr-2`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(rowId)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Row number */}
                    {showRowNumbers && (
                      <td
                        className={`${dense ? 'py-2' : 'py-3'} px-3 text-[12px] text-slate-400 font-mono`}
                      >
                        {rowIdx + 1}
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`
                          ${dense ? 'py-2' : 'py-3'} px-4
                          ${alignClass(col.align)}
                          ${col.className ?? ''}
                          ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}
                        `}
                      >
                        {col.render
                          ? col.render(row, rowIdx)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>

          {/* Caption */}
          {caption && (
            <caption className="text-[11px] text-slate-400 py-2 border-t border-slate-100">
              {caption}
            </caption>
          )}
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      {!hidePagination && !loading && sorted.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-slate-500">
          {/* Left: info */}
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {sorted.length === 0
                ? '0'
                : (safePage - 1) * pageSize + 1}
              –{Math.min(safePage * pageSize, sorted.length)} of{' '}
              {sorted.length}
            </span>
            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={() => {}}
              className="text-[12px] border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white focus:outline-none focus:border-primary cursor-pointer"
              tabIndex={-1}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>

          {/* Right: page controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPaginationRange().map((pNum, idx) =>
                pNum === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 text-slate-300 text-xs select-none"
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`
                      min-w-[28px] h-7 rounded font-semibold text-[12px]
                      flex items-center justify-center transition-all
                      ${
                        safePage === pNum
                          ? 'bg-primary text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    {pNum}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
