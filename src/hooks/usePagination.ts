// ── usePagination ────────────────────────────────────────────────────────────
//
// Manages page, pageSize, and total count with derived helpers.
// Fully stateless-friendly — all state lives here and is exposed
// for the parent to wire into query params.

import { useState, useCallback, useMemo } from "react";
import type { PaginationConfig } from "@/types/resource-types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PaginationState {
  /** Current 1-based page number */
  page: number;
  /** Rows per page */
  pageSize: number;
  /** Total rows reported by server */
  total: number;
  /** Computed total number of pages */
  totalPages: number;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** 0-indexed offset into the full dataset */
  offset: number;
}

export interface PaginationActions {
  /** Jump to a specific page */
  goToPage: (page: number) => void;
  /** Go to the next page (clamped) */
  nextPage: () => void;
  /** Go to the previous page (clamped) */
  prevPage: () => void;
  /** Go to the first page */
  firstPage: () => void;
  /** Go to the last page */
  lastPage: () => void;
  /** Change page size and reset to page 1 */
  changePageSize: (size: number) => void;
  /** Update the server-reported total */
  setTotal: (total: number) => void;
  /** Reset to initial state */
  reset: () => void;
}

export type UsePaginationReturn = PaginationState & PaginationActions;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePagination(
  config?: PaginationConfig
): UsePaginationReturn {
  const defaultPageSize = config?.defaultPageSize ?? 10;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const offset = (page - 1) * pageSize;

  const goToPage = useCallback(
    (p: number) => setPage(Math.max(1, Math.min(p, totalPages || 1))),
    [totalPages]
  );

  const nextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );

  const prevPage = useCallback(
    () => setPage((p) => Math.max(p - 1, 1)),
    []
  );

  const firstPage = useCallback(() => setPage(1), []);

  const lastPage = useCallback(
    () => setPage(totalPages),
    [totalPages]
  );

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setPageSize(defaultPageSize);
    setTotal(0);
  }, [defaultPageSize]);

  return {
    // State
    page,
    pageSize,
    total,
    totalPages,
    hasPrevPage,
    hasNextPage,
    offset,
    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePageSize,
    setTotal,
    reset,
  };
}
