import { useState } from "react";
import type { SortDirection } from "@/types/supplier";

interface UseTableSortingOptions<TColumn extends string> {
  initialSortBy?: TColumn | null;
  initialDirection?: SortDirection | null;
}

export function useTableSorting<TColumn extends string>({
  initialSortBy = null,
  initialDirection = null,
}: UseTableSortingOptions<TColumn> = {}) {
  const [sortBy, setSortBy] = useState<TColumn | null>(initialSortBy);
  const [direction, setDirection] = useState<SortDirection | null>(
    initialDirection,
  );

  function toggleSort(column: TColumn) {
    if (sortBy !== column) {
      setSortBy(column);
      setDirection("asc");
      return;
    }

    if (direction === "asc") {
      setDirection("desc");
      return;
    }

    if (direction === "desc") {
      setSortBy(null);
      setDirection(null);
      return;
    }

    setDirection("asc");
  }

  function resetSorting() {
    setSortBy(initialSortBy);
    setDirection(initialDirection);
  }

  return {
    sortBy,
    direction,
    toggleSort,
    resetSorting,
  };
}
