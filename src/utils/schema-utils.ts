import type { FieldDefinition } from "@/types/resource-types";

export function getFieldLabel(field: FieldDefinition): string {
  if (field.label) return field.label;
  return field.name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatFieldValue(
  value: unknown,
  field: FieldDefinition
): string {
  if (value === null || value === undefined) return "—";
  if (field.format) return field.format(value);

  switch (field.type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      return value ? new Date(String(value)).toLocaleDateString() : "—";
    case "datetime":
      return value ? new Date(String(value)).toLocaleString() : "—";
    case "select":
    case "multiselect": {
      if (Array.isArray(value)) {
        return value
          .map((v) => {
            const opt = field.options?.find((o) => o.value === v);
            return opt?.label ?? String(v);
          })
          .join(", ");
      }
      const opt = field.options?.find((o) => o.value === value);
      return (opt?.label ?? String(value));
    }
    case "number":
      return typeof value === "number" ? value.toLocaleString() : String(value);
    default:
      return String(value);
  }
}

export function getTableFields(fields: FieldDefinition[]): FieldDefinition[] {
  return fields.filter((f) => f.showInTable !== false && !f.hidden);
}

export function getCreateFields(fields: FieldDefinition[]): FieldDefinition[] {
  return fields.filter((f) => f.showInCreate !== false && !f.hidden);
}

export function getEditFields(fields: FieldDefinition[]): FieldDefinition[] {
  return fields.filter((f) => f.showInEdit !== false && !f.hidden);
}

export function getFilterableFields(
  fields: FieldDefinition[]
): FieldDefinition[] {
  return fields.filter((f) => f.filterable !== false && !f.hidden);
}

export function getSearchableFields(
  fields: FieldDefinition[]
): FieldDefinition[] {
  return fields.filter((f) => f.searchable !== false && !f.hidden);
}

export function createResource(
  definition: import("@/types/resource-types").ResourceDefinition
) {
  return {
    primaryKey: "id",
    searchable: true,
    filterable: true,
    exportable: true,
    permissions: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      export: true,
      bulkDelete: true,
    },
    pagination: {
      mode: "server" as const,
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
    },
    ...definition,
  };
}
