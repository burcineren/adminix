import { Modal } from "@/ui/Modal";
import { FormGenerator } from "@/components/FormGenerator";
import type { ResourceDefinition } from "@/types/resource-types";

interface EditModalProps {
    open: boolean;
    onClose: () => void;
    resource: ResourceDefinition;
    row: Record<string, unknown> | null;
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
    loading?: boolean;
}

export function EditModal({ open, onClose, resource, row, onSubmit, loading }: EditModalProps) {
    const label = resource.label ?? resource.name;
    if (!row) return null;

    return (
        <Modal
            open={open}
            onOpenChange={(v) => !v && onClose()}
            title={`Edit ${label}`}
            description={`Update the ${label.toLowerCase()} record`}
            size="lg"
        >
            <FormGenerator
                fields={resource.fields}
                mode="edit"
                initialValues={row}
                onSubmit={async (data) => {
                    await onSubmit(data);
                    onClose();
                }}
                onCancel={onClose}
                loading={loading}
            />
        </Modal>
    );
}
