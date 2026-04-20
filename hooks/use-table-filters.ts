import { useState } from "react";

type TableFilterValue = string | undefined;
type TableFilterRecord = Record<string, TableFilterValue>;

export function useTableFilters<TFilters extends TableFilterRecord>(
  initialFilters: TFilters,
) {
  const [filters, setFilters] = useState(initialFilters);

  function setFilter<TKey extends keyof TFilters>(
    key: TKey,
    value: TFilters[TKey],
  ) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  const hasActiveFilters = Object.keys(initialFilters).some((key) => {
    const currentValue = filters[key as keyof TFilters];
    const initialValue = initialFilters[key as keyof TFilters];
    return currentValue !== initialValue;
  });

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}
