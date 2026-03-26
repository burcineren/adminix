import { useAdminStore } from "@/core/store";
import { useResource } from "@/hooks/useResource";
import { useCallback, lazy, Suspense } from "react";
import type { ResourceDefinition } from "@/types/resource-types";

// Lazy load heavy components
const CreateModal = lazy(() => import("@/components/CreateModal").then(m => ({ default: m.CreateModal })));
const EditModal = lazy(() => import("@/components/EditModal").then(m => ({ default: m.EditModal })));
const DeleteDialog = lazy(() => import("@/components/DeleteDialog").then(m => ({ default: m.DeleteDialog })));

/**
 * GlobalModalManager
 * 
 * Orchestrates the CRUD modals for the currently active resource.
 * By rendering this at the top level, we keep ResourceView clean and
 * ensure modal state is truly global.
 */
export function GlobalModalManager() {
    const { activeResource, resources } = useAdminStore();
    const resource = resources.find((r) => r.name === activeResource);

    // If no resource is active, we don't render any specific CRUD modals.
    // We return NULL here, and because we haven't called any hooks that 
    // depend on the resource yet, this is safe.
    if (!resource) return null;

    // Pass the active resource to the inner manager which will handle the hooks.
    return <GlobalModalInner resource={resource} />;
}

/**
 * GlobalModalInner
 * 
 * This component safely calls useResource and other hooks because it's only
 * rendered when a valid resource exists.
 */
function GlobalModalInner({ resource }: { resource: ResourceDefinition }) {
    const {
        createModalOpen,
        editModalOpen,
        deleteDialogOpen,
        editingRow,
        deletingRow,
        closeCreateModal,
        closeEditModal,
        closeDeleteDialog,
    } = useAdminStore();

    // Connect to the data layer for this resource
    const { schema, crud, pk } = useResource(resource);

    const handleCreate = useCallback(
        async (data: Record<string, unknown>) => {
            try {
                await crud.create(data);
                closeCreateModal();
            } catch (err) {
                // Toasts handled inside useCrudActions
            }
        },
        [crud, closeCreateModal]
    );

    const handleUpdate = useCallback(
        async (data: Record<string, unknown>) => {
            if (!editingRow) return;
            try {
                await crud.update(editingRow[pk], data);
                closeEditModal();
            } catch (err) {
                // Toasts handled inside useCrudActions
            }
        },
        [crud, editingRow, pk, closeEditModal]
    );

    const handleDelete = useCallback(async () => {
        if (!deletingRow) return;
        try {
            await crud.remove(deletingRow[pk]);
            closeDeleteDialog();
        } catch (err) {
            // Toasts handled inside useCrudActions
        }
    }, [crud, deletingRow, pk, closeDeleteDialog]);

    return (
        <Suspense fallback={null}>
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
        </Suspense>
    );
}
