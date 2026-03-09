import { useState, useCallback } from "react";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = useCallback((p: number) => setPage(p), []);
  const nextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );
  const prevPage = useCallback(
    () => setPage((p) => Math.max(p - 1, 1)),
    []
  );
  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
  };
}
