import { useState, useCallback } from "react";
import type { FieldDefinition } from "@/types/resource-types";

export type FilterValue = string | number | boolean | null | undefined;

export interface FilterState {
  [fieldName: string]: FilterValue;
}

export function useFilters(fields: FieldDefinition[]) {
  const [filters, setFilters] = useState<FilterState>({});
  const [search, setSearch] = useState("");

  const setFilter = useCallback((name: string, value: FilterValue) => {
    setFilters((prev) => {
      if (value === "" || value === null || value === undefined) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch("");
  }, []);

  const hasActiveFilters =
    Object.keys(filters).length > 0 || search.length > 0;

  const filterableFields = fields.filter(
    (f) => f.filterable !== false && !f.hidden
  );

  return {
    filters,
    search,
    setSearch,
    setFilter,
    clearFilters,
    hasActiveFilters,
    filterableFields,
  };
}
