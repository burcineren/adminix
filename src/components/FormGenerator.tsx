import { useForm, Controller, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FieldDefinition } from "@/types/resource-types";
import { Input, Textarea } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { getCreateFields, getEditFields, getFieldLabel } from "@/utils/schema-utils";

// ── Schema Builder ─────────────────────────────────────────────────────────────

function buildZodSchema(fields: FieldDefinition[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        if (field.validation) {
            shape[field.name] = field.validation;
            continue;
        }
        let schema: z.ZodTypeAny;
        switch (field.type) {
            case "number":
                schema = z.coerce.number();
                if (!field.required) schema = schema.optional();
                break;
            case "boolean":
                schema = z.boolean().optional();
                break;
            case "email":
                schema = z.string().email();
                if (!field.required) schema = schema.optional();
                break;
            case "url":
                schema = z.string().url();
                if (!field.required) schema = schema.optional();
                break;
            case "select":
                schema = z.string();
                if (!field.required) schema = schema.optional();
                break;
            case "multiselect":
                schema = z.array(z.string());
                if (!field.required) schema = schema.optional();
                break;
            default:
                schema = field.required ? z.string().min(1, `${getFieldLabel(field)} is required`) : z.string().optional();
        }
        shape[field.name] = schema;
    }
    return z.object(shape);
}

// ── Field Renderer ─────────────────────────────────────────────────────────────

function FieldRenderer({
    field,
    controllerField,
    error,
}: {
    field: FieldDefinition;
    controllerField: ControllerRenderProps<Record<string, unknown>>;
    error?: string;
}) {
    const label = getFieldLabel(field);

    switch (field.type) {
        case "text":
        case "email":
        case "url":
        case "password":
            return (
                <Input
                    {...controllerField}
                    value={controllerField.value as string ?? ""}
                    type={field.type}
                    label={label}
                    placeholder={field.placeholder ?? `Enter ${label.toLowerCase()}…`}
                    error={error}
                    required={field.required}
                    description={field.description}
                />
            );

        case "number":
            return (
                <Input
                    {...controllerField}
                    value={controllerField.value as string ?? ""}
                    type="number"
                    label={label}
                    placeholder={field.placeholder ?? "0"}
                    error={error}
                    required={field.required}
                />
            );

        case "textarea":
            return (
                <Textarea
                    {...controllerField}
                    value={controllerField.value as string ?? ""}
                    label={label}
                    placeholder={field.placeholder ?? `Enter ${label.toLowerCase()}…`}
                    error={error}
                    required={field.required}
                />
            );

        case "select":
            return (
                <Select
                    options={field.options ?? []}
                    value={controllerField.value as string}
                    onChange={controllerField.onChange}
                    label={label}
                    placeholder={field.placeholder ?? `Select ${label.toLowerCase()}…`}
                    error={error}
                    required={field.required}
                />
            );

        case "boolean":
            return (
                <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                    <div>
                        <p className="text-sm font-medium">{label}</p>
                        {field.description && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
                        )}
                    </div>
                    <Switch
                        checked={controllerField.value as boolean ?? false}
                        onCheckedChange={controllerField.onChange}
                    />
                </div>
            );

        case "date":
        case "datetime":
            return (
                <Input
                    {...controllerField}
                    value={controllerField.value as string ?? ""}
                    type={field.type === "datetime" ? "datetime-local" : "date"}
                    label={label}
                    error={error}
                    required={field.required}
                />
            );

        default:
            return (
                <Input
                    {...controllerField}
                    value={controllerField.value as string ?? ""}
                    label={label}
                    error={error}
                />
            );
    }
}

// ── Form Generator ─────────────────────────────────────────────────────────────

interface FormGeneratorProps {
    fields: FieldDefinition[];
    mode: "create" | "edit";
    initialValues?: Record<string, unknown>;
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
}

import { useI18n } from "@/core/i18n";

export function FormGenerator({
    fields,
    mode,
    initialValues = {},
    onSubmit,
    onCancel,
    loading,
}: FormGeneratorProps) {
    const { t } = useI18n();
    const visibleFields = mode === "create" ? getCreateFields(fields) : getEditFields(fields);
    const schema = buildZodSchema(visibleFields);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Record<string, unknown>>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {visibleFields.map((field) => (
                <Controller
                    key={field.name}
                    name={field.name}
                    control={control}
                    defaultValue={field.defaultValue ?? (field.type === "boolean" ? false : "")}
                    render={({ field: controllerField }) => (
                        <FieldRenderer
                            field={field}
                            controllerField={controllerField as ControllerRenderProps<Record<string, unknown>>}
                            error={errors[field.name]?.message as string | undefined}
                        />
                    )}
                />
            ))}
            <div className="flex items-center justify-end gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {t.common.cancel}
                    </Button>
                )}
                <Button type="submit" loading={loading}>
                    {mode === "create" ? t.common.create : t.common.save}
                </Button>
            </div>
        </form>
    );
}
