import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ResourceDefinition } from "@/types/resource-types";
import { apiClient, buildEndpoint } from "@/utils/request-builder";
import type { QueryParams } from "@/utils/request-builder";

export interface ResourceListResponse {
  data: Record<string, unknown>[];
  total: number;
  page?: number;
  pageSize?: number;
}

export function useResource(
  resource: ResourceDefinition,
  queryParams: QueryParams
) {
  const queryClient = useQueryClient();
  const baseUrl = resource.api?.baseUrl ?? "";
  const endpoints = resource.api?.endpoints ?? {};
  const pk = resource.primaryKey ?? "id";

  // ── LIST ────────────────────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: [resource.name, queryParams],
    queryFn: async () => {
      const url = buildEndpoint(
        baseUrl,
        endpoints.list ?? resource.endpoint,
        queryParams
      );
      const raw = await apiClient<unknown>(url, {}, resource.api);
      if (resource.api?.transformResponse) {
        return resource.api.transformResponse(raw) as ResourceListResponse;
      }
      // Auto-detect common response shapes
      if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj["data"])) {
          return { data: obj["data"] as Record<string, unknown>[], total: (obj["total"] as number) ?? 0 };
        }
        if (Array.isArray(raw)) {
          return { data: raw as Record<string, unknown>[], total: (raw as unknown[]).length };
        }
      }
      return { data: [], total: 0 };
    },
    placeholderData: (prev) => prev,
  });

  // ── CREATE ──────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = `${baseUrl}${endpoints.create ?? resource.endpoint}`;
      return apiClient(url, { method: "POST", body: JSON.stringify(data) }, resource.api);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [resource.name] });
      toast.success("Record created successfully");
    },
    onError: (err: Error) => {
      toast.error(`Create failed: ${err.message}`);
    },
  });

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: unknown; data: Record<string, unknown> }) => {
      const url = `${baseUrl}${endpoints.update ?? resource.endpoint}/${id as string}`;
      return apiClient(url, { method: "PUT", body: JSON.stringify(data) }, resource.api);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [resource.name] });
      toast.success("Record updated successfully");
    },
    onError: (err: Error) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  // ── DELETE ──────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: unknown) => {
      const url = `${baseUrl}${endpoints.delete ?? resource.endpoint}/${id as string}`;
      return apiClient(url, { method: "DELETE" }, resource.api);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [resource.name] });
      toast.success("Record deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  // ── BULK DELETE ─────────────────────────────────────────────────────────────
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: unknown[]) => {
      const url = `${baseUrl}${endpoints.bulkDelete ?? resource.endpoint}/bulk-delete`;
      return apiClient(url, {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }, resource.api);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [resource.name] });
      toast.success("Records deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(`Bulk delete failed: ${err.message}`);
    },
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    pk,
  };
}
