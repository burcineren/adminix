import type { ResourceDefinition, FieldDefinition } from "@/types/resource-types";

/**
 * Infers a full resource schema from a sample data record.
 */
export function inferSchemaFromData(
  resourceName: string,
  sampleRecord: Record<string, unknown>,
  endpoint: string
): ResourceDefinition {
  const fields: FieldDefinition[] = Object.entries(sampleRecord).map(([key, value]) => {
    let type: FieldDefinition["type"] = "string";
    let filter: FieldDefinition["filter"] = "search";

    // Detect numbers
    if (typeof value === "number") {
      type = "number";
      filter = "range";
    } 
    // Detect booleans
    else if (typeof value === "boolean") {
      type = "boolean";
      filter = "boolean";
    }
    // Detect dates (basic check)
    else if (typeof value === "string" && !isNaN(Date.parse(value)) && value.length > 8) {
      type = "date";
      filter = "date-range";
    }
    // Detect objects/arrays as select
    else if (Array.isArray(value)) {
      type = "select";
      filter = "select";
    }

    return {
      name: key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      type,
      filter,
      sortable: true,
      searchable: type === "string" && key.toLowerCase().includes("name")
    };
  });

  return {
    name: resourceName,
    endpoint,
    label: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
    fields,
    permissions: {
      create: true,
      edit: true,
      delete: true
    }
  };
}
