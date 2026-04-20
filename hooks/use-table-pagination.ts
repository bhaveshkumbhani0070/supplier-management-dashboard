import { useState } from "react";

interface UseTablePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialTotal?: number;
}

export function useTablePagination({
  initialPage = 1,
  initialLimit = 10,
  initialTotal = 0,
}: UseTablePaginationOptions = {}) {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function setPage(nextPage: number) {
    setPageState(Math.max(1, nextPage));
  }

  function setLimit(nextLimit: number) {
    setLimitState(nextLimit);
    setPageState(1);
  }

  function resetPagination() {
    setPageState(initialPage);
    setLimitState(initialLimit);
    setTotal(initialTotal);
  }

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    resetPagination,
  };
}
