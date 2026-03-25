// ── useCrudActions ───────────────────────────────────────────────────────────
//
// Encapsulates TanStack Query mutations for Create, Update, Delete,
// and Bulk Delete operations on a single resource.
// Handles cache invalidation, toast notifications, and plugin callbacks.

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ResourceDefinition, AdminPlugin } from "@/types/resource-types";
import {
  apiClient,
  resolveEndpoints,
} from "@/core/api-client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrudCallbacks {
  /** Called after successful create — receives the created record */
  onCreateSuccess?: (data: unknown) => void;
  /** Called after successful update */
  onUpdateSuccess?: (data: unknown) => void;
  /** Called after successful delete */
  onDeleteSuccess?: (id: unknown) => void;
  /** Called after successful bulk delete */
  onBulkDeleteSuccess?: (ids: unknown[]) => void;
  /** Called on any mutation error */
  onError?: (error: Error, type: "create" | "update" | "delete" | "bulkDelete") => void;
  /** Whether to show toast notifications (default: true) */
  showToasts?: boolean;
}

export interface CreatePayload {
  data: Record<string, unknown>;
}

export interface UpdatePayload {
  id: unknown;
  data: Record<string, unknown>;
}

export interface CrudMutationState {
  /** Whether any mutation is currently in progress */
  isAnyPending: boolean;
  /** Detailed loading states */
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkDeleting: boolean;
}

export interface UseCrudActionsReturn {
  /** Create a new record */
  create: (data: Record<string, unknown>) => Promise<unknown>;
  /** Update an existing record */
  update: (id: unknown, data: Record<string, unknown>) => Promise<unknown>;
  /** Delete a single record */
  remove: (id: unknown) => Promise<unknown>;
  /** Delete multiple records at once */
  bulkRemove: (ids: unknown[]) => Promise<unknown>;

  /** Raw TanStack mutation objects (for advanced binding) */
  createMutation: UseMutationResult<unknown, Error, CreatePayload, unknown>;
  updateMutation: UseMutationResult<unknown, Error, UpdatePayload, unknown>;
  deleteMutation: UseMutationResult<unknown, Error, unknown, unknown>;
  bulkDeleteMutation: UseMutationResult<unknown, Error, unknown[], unknown>;

  /** Aggregated loading / state info */
  state: CrudMutationState;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCrudActions(
  resource: ResourceDefinition,
  callbacks?: CrudCallbacks
): UseCrudActionsReturn {
  const queryClient = useQueryClient();
  const showToasts = callbacks?.showToasts !== false;

  const baseUrl = resource.api?.baseUrl ?? "";
  const endpoints = resolveEndpoints(
    baseUrl,
    resource.endpoint,
    resource.api?.endpoints
  );
  const pk = resource.primaryKey ?? "id";
  const label = resource.label ?? resource.name;

  // Collect plugin handlers
  const allPlugins: AdminPlugin[] = [
    ...(resource.plugins ?? []),
  ];

  const notifyPlugins = (type: "create" | "update" | "delete", data: unknown) => {
    for (const plugin of allPlugins) {
      plugin.onMutation?.(type, data);
    }
  };

  // Invalidation helper
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [resource.name] });
  };

  // ── CREATE ──────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationKey: [resource.name, "create"],
    mutationFn: async (payload: CreatePayload) => {
      return apiClient.post(endpoints.create, payload.data, {}, resource.api);
    },
    onSuccess: (data: unknown) => {
      invalidate();
      notifyPlugins("create", data);
      if (showToasts) toast.success(`${label} created successfully`);
      callbacks?.onCreateSuccess?.(data);
    },
    onError: (err: Error) => {
      if (showToasts) toast.error(`Failed to create ${label}: ${err.message}`);
      callbacks?.onError?.(err, "create");
    },
  });

  // ── UPDATE ──────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationKey: [resource.name, "update"],
    mutationFn: async (payload: UpdatePayload) => {
      const url = `${endpoints.update}/${String(payload.id)}`;
      return apiClient.put(url, payload.data, {}, resource.api);
    },
    onSuccess: (data: unknown) => {
      invalidate();
      notifyPlugins("update", data);
      if (showToasts) toast.success(`${label} updated successfully`);
      callbacks?.onUpdateSuccess?.(data);
    },
    onError: (err: Error) => {
      if (showToasts) toast.error(`Failed to update ${label}: ${err.message}`);
      callbacks?.onError?.(err, "update");
    },
  });

  // ── DELETE ──────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationKey: [resource.name, "delete"],
    mutationFn: async (id: unknown) => {
      const url = `${endpoints.delete}/${String(id)}`;
      return apiClient.delete(url, undefined, {}, resource.api);
    },
    onSuccess: (_data: unknown, id: unknown) => {
      invalidate();
      notifyPlugins("delete", { [pk]: id });
      if (showToasts) toast.success(`${label} deleted successfully`);
      callbacks?.onDeleteSuccess?.(id);
    },
    onError: (err: Error) => {
      if (showToasts) toast.error(`Failed to delete ${label}: ${err.message}`);
      callbacks?.onError?.(err, "delete");
    },
  });

  // ── BULK DELETE ─────────────────────────────────────────────────────────────

  const bulkDeleteMutation = useMutation({
    mutationKey: [resource.name, "bulkDelete"],
    mutationFn: async (ids: unknown[]) => {
      return apiClient.delete(endpoints.bulkDelete, { ids }, {}, resource.api);
    },
    onSuccess: (_data: unknown, ids: unknown[]) => {
      invalidate();
      notifyPlugins("delete", { ids });
      if (showToasts) {
        toast.success(`${ids.length} ${label} record(s) deleted`);
      }
      callbacks?.onBulkDeleteSuccess?.(ids);
    },
    onError: (err: Error) => {
      if (showToasts) toast.error(`Bulk delete failed: ${err.message}`);
      callbacks?.onError?.(err, "bulkDelete");
    },
  });

  // ── Convenience wrappers ───────────────────────────────────────────────────

  const create = async (data: Record<string, unknown>) =>
    createMutation.mutateAsync({ data } as CreatePayload);

  const update = async (id: unknown, data: Record<string, unknown>) =>
    updateMutation.mutateAsync({ id, data } as UpdatePayload);

  const remove = async (id: unknown) =>
    deleteMutation.mutateAsync(id);

  const bulkRemove = async (ids: unknown[]) =>
    bulkDeleteMutation.mutateAsync(ids);

  // ── Aggregated state ───────────────────────────────────────────────────────

  const state: CrudMutationState = {
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isAnyPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      bulkDeleteMutation.isPending,
  };

  return {
    create,
    update,
    remove,
    bulkRemove,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    state,
  };
}
