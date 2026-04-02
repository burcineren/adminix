// ── useResource ──────────────────────────────────────────────────────────────
//
// The top-level orchestrator hook that combines:
//   - apiClient          (data fetching)
//   - usePagination      (page state)
//   - useFilters          (filter + search state)
//   - useCrudActions     (mutations)
//
// Returns everything a ResourceView or custom page needs to render a full
// CRUD interface for a given ResourceDefinition.

import { useEffect, useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ResourceDefinition } from "@/types/resource-types";
import { usePagination } from "@/hooks/usePagination";
import type { UsePaginationReturn } from "@/hooks/usePagination";
import { useFilters } from "@/hooks/useFilters";
import type { FiltersReturn, FilterValue } from "@/hooks/useFilters";
import { useCrudActions } from "@/hooks/useCrudActions";
import type { UseCrudActionsReturn, CrudCallbacks } from "@/hooks/useCrudActions";
import {
  apiClient,
  buildUrl,
  resolveEndpoints,
  normalizePaginatedResponse,
} from "@/core/api-client";
import { schemaRegistry } from "@/core/schema/registry";
import type { PaginatedResponse, ListQueryParams } from "@/core/api-client";
import { generateUISchema } from "@/core/schema";
import type { UISchema } from "@/core/schema";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

export interface UseResourceOptions {
  /** Whether to fetch data immediately (default: true) */
  enabled?: boolean;
  /** Callbacks for CRUD operations */
  crudCallbacks?: CrudCallbacks;
  /** Debounce delay for search input (default: 300ms) */
  searchDebounceMs?: number;
  /** Stale time for queries in ms (default: 30000) */
  staleTime?: number;
  /** Refetch interval in ms (0 = off, default: 0) */
  refetchInterval?: number;
  /** Initial sort state (overrides resource.defaultSort) */
  initialSort?: SortState;
  /** Initial filter values */
  initialFilters?: Record<string, FilterValue>;
  /** Initial search value */
  initialSearch?: string;
}

export interface ResourceListState {
  /** The current page of data rows */
  data: Record<string, unknown>[];
  /** Total number of rows (server-reported) */
  total: number;
  /** Is the initial load in progress? */
  isLoading: boolean;
  /** Is any (re)fetch in progress (includes background)? */
  isFetching: boolean;
  /** Did the last fetch produce an error? */
  isError: boolean;
  /** Error object from the last fetch, if any */
  error: Error | null;
  /** Has any successful fetch occurred? */
  isSuccess: boolean;
  /** Is the data stale and being re-fetched in the background? */
  isRefetching: boolean;
  /** Is this the very first fetch? */
  isInitialLoading: boolean;
}

export interface UseResourceReturn {
  /** Primary key field name */
  pk: string;
  /** Friendly label for the resource */
  label: string;

  /** List data state */
  list: ResourceListState;

  /** Pagination state & actions */
  pagination: UsePaginationReturn;

  /** Filters & search state & actions */
  filters: FiltersReturn;

  /** CRUD mutations */
  crud: UseCrudActionsReturn;

  /** Current sort state */
  sort: SortState;

  /** The unified UI Schema (inferred + explicit) */
  schema: UISchema;

  /** Dynamically computed query params (what is sent to the API) */
  queryParams: ListQueryParams;

  /** Whether the schema has been successfully detected/inferred */
  isSchemaDetected: boolean;
  
  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Change the sort field and direction */
  setSort: (field: string, direction?: "asc" | "desc") => void;
  /** Toggle sort direction for the given field */
  toggleSort: (field: string) => void;
  /** Manually refetch the list */
  refetch: () => Promise<unknown>;
  /** Invalidate cache and refetch all queries for this resource */
  invalidate: () => Promise<void>;
  /** Reset all state to initial values */
  resetAll: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useResource(
  resource: ResourceDefinition,
  options?: UseResourceOptions
): UseResourceReturn {
  const {
    enabled = true,
    crudCallbacks,
    searchDebounceMs = 300,
    staleTime = 30_000,
    refetchInterval = 0,
    initialSort,
    initialFilters,
    initialSearch,
  } = options ?? {};

  const queryClient = useQueryClient();
  const pk = resource.primaryKey ?? "id";
  const label = resource.label ?? resource.name;

  const baseUrl = resource.api?.baseUrl ?? "";
  const endpoints = resolveEndpoints(
    baseUrl,
    resource.endpoint,
    resource.api?.endpoints
  );

  // ── Sort state ──────────────────────────────────────────────────────────────

  const [sort, setSortState] = useState<SortState>(
    initialSort ?? {
      field: resource.defaultSort?.field ?? "",
      direction: resource.defaultSort?.direction ?? "asc",
    }
  );

  const setSort = useCallback((field: string, direction?: "asc" | "desc") => {
    setSortState({
      field,
      direction: direction ?? "asc",
    });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSortState((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  }, []);

  // ── Pagination ──────────────────────────────────────────────────────────────

  const pagination = usePagination(resource.pagination);

  // ── Filters ─────────────────────────────────────────────────────────────────

  const filtersHook = useFilters(resource.fields || [], {
    debounceMs: searchDebounceMs,
    initialFilters,
    initialSearch,
  });

  // Reset page on search / filter change
  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersHook.search, filtersHook.filters]);

  // ── Query Params ────────────────────────────────────────────────────────────

  const queryParams: ListQueryParams = useMemo(
    () => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: filtersHook.search || undefined,
      sort: sort.field || undefined,
      order: sort.field ? sort.direction : undefined,
      filters: Object.keys(filtersHook.filters).length > 0
        ? filtersHook.filters
        : undefined,
    }),
    [
      pagination.page,
      pagination.pageSize,
      filtersHook.search,
      filtersHook.filters,
      sort.field,
      sort.direction,
    ]
  );

  // ── List Query ──────────────────────────────────────────────────────────────

  const listQuery = useQuery<PaginatedResponse>({
    queryKey: [resource.name, "list", queryParams],
    queryFn: async (): Promise<PaginatedResponse> => {
      // 1. Support static / mock data if no endpoint is specified
      if (!resource.endpoint && resource.data) {
        return {
          data: resource.data,
          total: resource.data.length
        };
      }

      // 2. Standard API fetch
      const url = buildUrl(baseUrl, endpoints.list.replace(baseUrl, ""), queryParams);
      const raw = await apiClient.get(url, {}, resource.api);
      return normalizePaginatedResponse(raw, resource.api?.transformResponse);
    },
    enabled: (enabled && (!!resource.endpoint || !!resource.data)),
    staleTime: !resource.endpoint && resource.data ? Infinity : staleTime,
    refetchInterval: refetchInterval || undefined,
    placeholderData: (prev) => prev,
  });

  // Sync total from query response
  useEffect(() => {
    if (listQuery.data?.total !== undefined) {
      pagination.setTotal(listQuery.data.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.data?.total]);

  // ── CRUD Actions ────────────────────────────────────────────────────────────

  const crud = useCrudActions(resource, crudCallbacks);

  // ── Resource Data ──────────────────────────────────────────────────────────

  const list: ResourceListState = useMemo(
    () => ({
      data: listQuery.data?.data ?? [],
      total: listQuery.data?.total ?? 0,
      isLoading: listQuery.isLoading,
      isFetching: listQuery.isFetching,
      isError: listQuery.isError,
      error: listQuery.error,
      isSuccess: listQuery.isSuccess,
      isRefetching: listQuery.isRefetching,
      isInitialLoading: listQuery.isLoading && !listQuery.data,
    }),
    [listQuery]
  );

  // ── Schema Generation (Zero-Config aware) ───────────────────────────────────

  const schema = useMemo(() => {
    // 1. Try to get from registry first (session cache)
    const cached = schemaRegistry.get(resource.name);
    
    // 2. Generate new one from current data + config
    const current = generateUISchema(resource, list.data, {
      includeInferredFields: true,
      applyBuiltinPlugins: true,
    });

    // 3. Merge: If no explicit fields, but we have cached fields, prefer them 
    // to avoid UI jittering while loading new data.
    if (!resource.fields?.length && cached && !list.data.length) {
      return cached;
    }

    return current;
  }, [resource, list.data]);

  // Sync back to registry after successful inference
  useEffect(() => {
    if (list.isSuccess && list.data.length > 0 && !resource.fields?.length) {
      schemaRegistry.set(resource.name, schema);
    }
  }, [list.isSuccess, list.data, resource.fields, resource.name, schema]);

  const isSchemaDetected = useMemo(() => {
    return schema.fields.length > 0;
  }, [schema.fields]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const refetch = useCallback(
    () => listQuery.refetch(),
    [listQuery]
  );

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [resource.name] });
  }, [queryClient, resource.name]);

  const resetAll = useCallback(() => {
    pagination.reset();
    filtersHook.clearFilters();
    setSortState({
      field: resource.defaultSort?.field ?? "",
      direction: resource.defaultSort?.direction ?? "asc",
    });
    void queryClient.invalidateQueries({ queryKey: [resource.name] });
  }, [pagination, filtersHook, resource, queryClient]);

  return {
    pk,
    label,
    list,
    pagination,
    filters: filtersHook,
    crud,
    schema,
    sort,
    queryParams,
    isSchemaDetected,
    setSort,
    toggleSort,
    refetch,
    invalidate,
    resetAll,
  };
}
