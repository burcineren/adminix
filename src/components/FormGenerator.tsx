import { useForm, Controller, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Terminal } from "lucide-react";
import type { UISchemaField } from "@/core/schema/types";
import { Input, Textarea } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch, Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { useI18n } from "@/core/i18n";
import { cn } from "@/utils/cn";
import React from "react";

// ── Schema Builder ─────────────────────────────────────────────────────────────

/**
 * Dynamically builds a Zod validation schema from the UI schema fields.
 * Handles automatic coercion for numbers, emails, and optionality.
 */
function buildZodSchema(fields: UISchemaField[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        // If the field already has a validation schema, use it directly
        if (field.validation) {
            shape[field.name] = field.validation;
            continue;
        }

        let schema: z.ZodTypeAny;

        switch (field.type) {
            case "number":
            case "integer":
                schema = z.coerce.number();
                if (!field.required) schema = schema.nullish();
                break;
            case "boolean":
                schema = z.boolean().default(false);
                break;
            case "email":
                schema = z.string().email(`${field.label} must be a valid email`);
                if (!field.required) schema = schema.optional().or(z.literal(''));
                break;
            case "url":
                schema = z.string().url(`${field.label} must be a valid URL`);
                if (!field.required) schema = schema.optional().or(z.literal(''));
                break;
            case "enum":
            case "select":
                schema = z.string();
                if (!field.required) schema = schema.optional();
                break;
            case "multiselect":
            case "array":
                schema = z.array(z.any());
                if (!field.required) schema = schema.default([]);
                break;
            case "date":
            case "datetime":
                schema = z.string().min(1, `${field.label} is required`);
                if (!field.required) schema = schema.optional().or(z.literal(''));
                break;
            default:
                schema = z.string();
                if (field.required) {
                    schema = (schema as z.ZodString).min(1, `${field.label} is required`);
                } else {
                    schema = schema.optional();
                }
        }

        shape[field.name] = schema;
    }
    return z.object(shape);
}

// ── Field Renderer ─────────────────────────────────────────────────────────────

/**
 * Responsibility: Maps a UI schema field to its corresponding visual component.
 */
export const FieldRenderer = React.memo(({
    field,
    controllerField,
    error,
}: {
    field: UISchemaField;
    controllerField: ControllerRenderProps<Record<string, unknown>>;
    error?: string;
}) => {
    // 1. Check for custom render function in schema
    if (field.renderForm) {
        return <>{field.renderForm(field, controllerField)}</>;
    }

    const commonProps = {
        label: field.label,
        error: error,
        required: field.required,
        description: field.description,
        placeholder: field.placeholder,
        ...controllerField,
        value: (controllerField.value as string) ?? "",
    };

    // 2. Built-in component mapping
    switch (field.component) {
        case "NumberInput":
            return <Input {...commonProps} type="number" />;

        case "EmailInput":
            return <Input {...commonProps} type="email" />;

        case "PasswordInput":
            return <Input {...commonProps} type="password" />;

        case "UrlInput":
            return <Input {...commonProps} type="url" />;

        case "TextareaInput":
            return <Textarea {...commonProps} />;

        case "SelectInput":
            return (
                <Select
                    {...commonProps}
                    options={field.options ?? []}
                    onChange={(val) => controllerField.onChange(val)}
                />
            );

        case "BooleanSwitch":
            return (
                <div className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    error ? "border-red-500 bg-red-50/50" : "border-[hsl(var(--border))]"
                )}>
                    <div className="space-y-0.5">
                        <label className="text-sm font-semibold">{field.label}</label>
                        {field.description && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
                        )}
                    </div>
                    <Switch
                        checked={!!controllerField.value}
                        onCheckedChange={controllerField.onChange}
                    />
                </div>
            );

        case "DatePicker":
            return <Input {...commonProps} type="date" />;

        case "DateTimePicker":
            return <Input {...commonProps} type="datetime-local" />;

        case "TextInput":
        default:
            return <Input {...commonProps} type="text" />;
    }
});

FieldRenderer.displayName = "FieldRenderer";

// ── Form Generator ─────────────────────────────────────────────────────────────

interface FormGeneratorProps {
    fields: UISchemaField[];
    mode: "create" | "edit";
    initialValues?: Record<string, unknown>;
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
}

export const FormGenerator = React.memo(({
    fields,
    mode,
    initialValues = {},
    onSubmit,
    onCancel,
    loading,
}: FormGeneratorProps) => {
    const { t } = useI18n();

    // Only render fields that are marked for visibility in the current mode
    const visibleFields = React.useMemo(() => 
        fields.filter((f) => mode === "create" ? f.showInCreate : f.showInEdit),
        [fields, mode]
    );

    const isZeroConfigEmpty = visibleFields.length === 0 && mode === "create";

    // Build validator once - if zero config, use JSON validator
    const validationSchema = React.useMemo(() => {
        if (isZeroConfigEmpty) {
            return z.object({ 
                _raw_json: z.string().refine((val) => {
                    try { JSON.parse(val); return true; } catch { return false; }
                }, "Invalid JSON format") 
            });
        }
        return buildZodSchema(visibleFields);
    }, [isZeroConfigEmpty, visibleFields]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Record<string, unknown>>({
        resolver: zodResolver(validationSchema),
        values: isZeroConfigEmpty ? { _raw_json: '{\n  "id": 1,\n  "name": "Example"\n}' } : initialValues,
    });

    const handleFormSubmit = async (values: Record<string, unknown>) => {
        if (isZeroConfigEmpty) {
            const parsed = JSON.parse(String(values._raw_json));
            await onSubmit(parsed);
        } else {
            await onSubmit(values);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                {isZeroConfigEmpty ? (
                    <div className="space-y-4">
                        <Card className="p-4 bg-[hsl(var(--muted)/0.3)] border-dashed">
                            <div className="flex items-start gap-3">
                                <Terminal className="h-5 w-5 text-[hsl(var(--primary))] mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Manual Data Entry</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                                        No fields detected yet. Provide a sample JSON object to create the first record and enable automatic UI generation.
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Controller
                            name="_raw_json"
                            control={control}
                            render={({ field: controllerField }) => (
                                <Textarea 
                                    {...controllerField}
                                    value={String(controllerField.value ?? "")}
                                    label="Sample JSON Data"
                                    placeholder='{ "name": "John Doe", "email": "john@example.com" }'
                                    className="font-mono text-xs h-[200px]"
                                    error={errors._raw_json?.message as string}
                                />
                            )}
                        />
                    </div>
                ) : (
                    visibleFields.map((field) => (
                        <Controller
                            key={field.name}
                            name={field.name}
                            control={control}
                            render={({ field: controllerField }) => (
                                <FieldRenderer
                                    field={field}
                                    controllerField={controllerField as ControllerRenderProps<Record<string, unknown>>}
                                    error={errors[field.name]?.message as string | undefined}
                                />
                            )}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {t.common.cancel}
                    </Button>
                )}
                <Button
                    type="submit"
                    loading={loading}
                    className="min-w-[100px]"
                >
                    {mode === "create" ? t.common.create : t.common.save}
                </Button>
            </div>
        </form>
    );
});

FormGenerator.displayName = "FormGenerator";

