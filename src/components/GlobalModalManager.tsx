import { useAdminStore } from "@/core/store";
import { useResource } from "@/hooks/useResource";
import { CreateModal } from "@/components/CreateModal";
import { EditModal } from "@/components/EditModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useCallback } from "react";

/**
 * GlobalModalManager
 * 
 * Orchestrates the CRUD modals for the currently active resource.
 * By rendering this at the top level, we keep ResourceView clean and
 * ensure modal state is truly global.
 */
export function GlobalModalManager() {
    const {
        activeResource,
        resources,
        createModalOpen,
        editModalOpen,
        deleteDialogOpen,
        editingRow,
        deletingRow,
        closeCreateModal,
        closeEditModal,
        closeDeleteDialog,
    } = useAdminStore();

    const resource = resources.find((r) => r.name === activeResource);

    // If no resource is active, we don't render any specific CRUD modals
    if (!resource) return null;

    // Connect to the data layer for this resource
    // (Note: This hook call is safe because it uses TanStack Query internally,
    // so it will share the same cache/state as the ResourceView component)
    const { schema, crud, pk } = useResource(resource);

    const handleCreate = useCallback(
        async (data: Record<string, unknown>) => {
            await crud.create(data);
        },
        [crud]
    );

    const handleUpdate = useCallback(
        async (data: Record<string, unknown>) => {
            if (!editingRow) return;
            await crud.update(editingRow[pk], data);
        },
        [crud, editingRow, pk]
    );

    const handleDelete = useCallback(async () => {
        if (!deletingRow) return;
        await crud.remove(deletingRow[pk]);
    }, [crud, deletingRow, pk]);

    return (
        <>
            <CreateModal
                open={createModalOpen}
                onClose={closeCreateModal}
                resource={resource}
                fields={schema.fields}
                onSubmit={handleCreate}
                loading={crud.state.isCreating}
            />

            <EditModal
                open={editModalOpen}
                onClose={closeEditModal}
                resource={resource}
                fields={schema.fields}
                row={editingRow}
                onSubmit={handleUpdate}
                loading={crud.state.isUpdating}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
                loading={crud.state.isDeleting}
                itemLabel={
                    deletingRow
                        ? `"${String(deletingRow[schema.fields[0]?.name ?? pk] ?? "this record")}"`
                        : "this record"
                }
            />
        </>
    );
}
