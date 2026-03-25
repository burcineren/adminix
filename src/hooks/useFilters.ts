// ── useFilters ───────────────────────────────────────────────────────────────
//
// Manages filter state & debounced search for a resource.
// Exposes a typed state object that components can bind directly and
// that `useResource` consumes for query-param generation.

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { FieldDefinition } from "@/types/resource-types";

// ── Types ────────────────────────────────────────────────────────────────────

/** A single filter value — can be a primitive or a range tuple */
export type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

export type RangeValue = [number | undefined, number | undefined];

export type DateRangeValue = [string | undefined, string | undefined];

export interface FilterState {
  [fieldName: string]: FilterValue;
}

export interface FiltersReturn {
  /** Current filter values keyed by field name */
  filters: FilterState;
  /** The debounced search query string */
  search: string;
  /** The raw (not-yet-debounced) search value — use for controlled inputs */
  searchInput: string;
  /** Whether any filter or search is active */
  hasActiveFilters: boolean;
  /** Count of active filter keys */
  activeFilterCount: number;
  /** Fields that are eligible for filtering */
  filterableFields: FieldDefinition[];
  /** Fields that are eligible for searching */
  searchableFields: FieldDefinition[];

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Set a single filter value */
  setFilter: (name: string, value: FilterValue) => void;
  /** Set multiple filters at once */
  setFilters: (updates: Record<string, FilterValue>) => void;
  /** Remove a single filter */
  removeFilter: (name: string) => void;
  /** Clear all filters and search */
  clearFilters: () => void;
  /** Clear only the search (preserves filters) */
  clearSearch: () => void;
  /** Update the search input (debounced internally) */
  setSearchInput: (value: string) => void;
  /** Set the search value immediately (bypasses debounce) */
  setSearch: (value: string) => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface UseFiltersOptions {
  /** Debounce delay for search input in ms (default: 300) */
  debounceMs?: number;
  /** Initial filter values */
  initialFilters?: FilterState;
  /** Initial search value */
  initialSearch?: string;
}

export function useFilters(
  fields: FieldDefinition[],
  options?: UseFiltersOptions
): FiltersReturn {
  const { debounceMs = 300, initialFilters = {}, initialSearch = "" } = options ?? {};

  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const [searchInput, setSearchInputState] = useState(initialSearch);
  const [search, setSearchState] = useState(initialSearch);

  // ── Debounced search ────────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearchState(searchInput);
    }, debounceMs);

    return () => clearTimeout(debounceRef.current);
  }, [searchInput, debounceMs]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const filterableFields = useMemo(
    () => fields.filter((f) => f.filterable !== false && !f.hidden),
    [fields]
  );

  const searchableFields = useMemo(
    () => fields.filter((f) => f.searchable !== false && !f.hidden),
    [fields]
  );

  const activeFilterCount = useMemo(
    () => Object.keys(filters).length,
    [filters]
  );

  const hasActiveFilters = activeFilterCount > 0 || search.length > 0;

  // ── Actions ────────────────────────────────────────────────────────────────

  const setFilter = useCallback((name: string, value: FilterValue) => {
    setFiltersState((prev) => {
      if (value === "" || value === null || value === undefined) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const setFilters = useCallback(
    (updates: Record<string, FilterValue>) => {
      setFiltersState((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(updates)) {
          if (value === "" || value === null || value === undefined) {
            delete next[key];
          } else {
            next[key] = value;
          }
        }
        return next;
      });
    },
    []
  );

  const removeFilter = useCallback((name: string) => {
    setFiltersState((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchInputState("");
    setSearchState("");
    clearTimeout(debounceRef.current);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInputState("");
    setSearchState("");
    clearTimeout(debounceRef.current);
  }, []);

  const setSearchInput = useCallback((value: string) => {
    setSearchInputState(value);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchInputState(value);
    setSearchState(value);
    clearTimeout(debounceRef.current);
  }, []);

  return {
    // State
    filters,
    search,
    searchInput,
    hasActiveFilters,
    activeFilterCount,
    filterableFields,
    searchableFields,

    // Actions
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    clearSearch,
    setSearchInput,
    setSearch,
  };
}
