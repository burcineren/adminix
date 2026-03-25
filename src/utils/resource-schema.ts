import { z } from "zod";

/**
 * Zod schema for validating ResourceDefinition JSON in the DevPlayground.
 * Provides detailed, field-level error messages during real-time editing.
 */

const SelectOptionSchema = z.object({
    label: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
    color: z.string().optional(),
});

const FieldDefinitionSchema = z.object({
    name: z.string().min(1, "Field name is required"),
    label: z.string().optional(),
    type: z.string().min(1, "Field type is required"),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    options: z.array(SelectOptionSchema).optional(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    filter: z.string().optional(),
    searchable: z.boolean().optional(),
    hidden: z.boolean().optional(),
    showInTable: z.boolean().optional(),
    showInCreate: z.boolean().optional(),
    showInEdit: z.boolean().optional(),
    relationResource: z.string().optional(),
    relationLabel: z.string().optional(),
    relationValue: z.string().optional(),
}).passthrough();

const PermissionsSchema = z.object({
    create: z.boolean().optional(),
    edit: z.boolean().optional(),
    delete: z.boolean().optional(),
    view: z.boolean().optional(),
    export: z.boolean().optional(),
    bulkDelete: z.boolean().optional(),
}).optional();

const PaginationSchema = z.object({
    mode: z.enum(["server", "client"]).optional(),
    defaultPageSize: z.number().positive().optional(),
    pageSizeOptions: z.array(z.number().positive()).optional(),
}).optional();

export const ResourceDefinitionSchema = z.object({
    name: z.string().min(1, "Resource name is required"),
    endpoint: z.string().min(1, "Endpoint is required"),
    label: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(FieldDefinitionSchema).min(0),
    permissions: PermissionsSchema,
    pagination: PaginationSchema,
    searchable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    exportable: z.boolean().optional(),
    primaryKey: z.string().optional(),
    expandable: z.boolean().optional(),
    defaultSort: z.object({
        field: z.string(),
        direction: z.enum(["asc", "desc"]),
    }).optional(),
}).passthrough();

export type ResourceValidationResult =
    | { success: true; data: z.infer<typeof ResourceDefinitionSchema> }
    | { success: false; errors: string[] };

/**
 * Validates a parsed JSON object against the ResourceDefinition schema.
 */
export function validateResourceDefinition(data: unknown): ResourceValidationResult {
    const result = ResourceDefinitionSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
    });
    return { success: false, errors };
}
