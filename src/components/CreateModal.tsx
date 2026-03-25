import { Modal } from "@/ui/Modal";
import { FormGenerator } from "@/components/FormGenerator";
import type { ResourceDefinition } from "@/types/resource-types";
import type { UISchemaField } from "@/core/schema/types";

interface CreateModalProps {
    open: boolean;
    onClose: () => void;
    resource: ResourceDefinition;
    fields: UISchemaField[];
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
    loading?: boolean;
}

export function CreateModal({ open, onClose, resource, fields, onSubmit, loading }: CreateModalProps) {
    const label = resource.label ?? resource.name;
    return (
        <Modal
            open={open}
            onOpenChange={(v) => !v && onClose()}
            title={`Create ${label}`}
            description={`Add a new ${label.toLowerCase()} record`}
            size="lg"
        >
            <FormGenerator
                fields={fields}
                mode="create"
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
