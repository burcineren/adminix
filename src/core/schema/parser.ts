// ── Schema Parser ────────────────────────────────────────────────────────────
//
// The main orchestrator. Takes a ResourceConfig + optional API response data,
// infers fields, merges with explicit overrides, maps to UI components,
// and runs the plugin pipeline.
//
// Public API:
//   generateUISchema(resourceConfig, apiResponse?, options?)

import type {
  ResourceConfig,
  SchemaFieldOverride,
  UISchema,
  UISchemaField,
  InferredType,
  SchemaPlugin,
  SchemaPluginContext,
} from "./types";

import { inferFieldsFromData, buildInferredField } from "./inferrer";
import { resolveComponentMapping } from "./mapper";
import {
  runFieldTransforms,
  runSchemaTransforms,
  createBuiltinPlugins,
} from "./plugins";

// ── Options ──────────────────────────────────────────────────────────────────

export interface GenerateUISchemaOptions {
  /**
   * Extra schema plugins to apply for this call only.
   * They are merged with globally-registered plugins.
   */
  plugins?: SchemaPlugin[];

  /**
   * Maximum number of rows to sample from the API response
   * for type inference (default: 100).
   */
  maxSampleSize?: number;

  /**
   * If true, fields present in the API response but NOT in the
   * explicit `fields` config will still be included (inferred).
   * Default: true
   */
  includeInferredFields?: boolean;

  /**
   * If true, the built-in plugins (primary-key, timestamps, field-order)
   * are applied automatically.
   * Default: true
   */
  applyBuiltinPlugins?: boolean;
}

const DEFAULT_OPTIONS: Required<GenerateUISchemaOptions> = {
  plugins: [],
  maxSampleSize: 100,
  includeInferredFields: true,
  applyBuiltinPlugins: true,
};

// ── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Generate a unified UI Schema from a resource configuration and
 * optional API response data.
 *
 * This is the single entry point for the schema engine.
 *
 * @param resourceConfig  Resource definition (name, endpoint, fields, etc.)
 * @param apiResponse     Optional raw API response — either `{ data: [...] }` or `[...]`
 * @param options         Processing options
 * @returns               The complete UISchema
 *
 * @example
 * ```ts
 * const schema = generateUISchema(
 *   {
 *     name: "products",
 *     endpoint: "/api/products",
 *     fields: [
 *       { name: "name", type: "string", required: true },
 *       { name: "price", type: "number", filter: "range" },
 *     ],
 *   },
 *   {
 *     data: [
 *       { id: 1, name: "Laptop", price: 999, inStock: true, createdAt: "2024-01-10" },
 *       { id: 2, name: "Phone",  price: 499, inStock: false, createdAt: "2024-02-15" },
 *     ],
 *     total: 2,
 *   }
 * );
 * ```
 */
export function generateUISchema(
  resourceConfig: ResourceConfig,
  apiResponse?: unknown,
  options?: GenerateUISchemaOptions
): UISchema {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. Extract rows from the API response
  const rows = extractRows(apiResponse, opts.maxSampleSize);

  // 2. Infer fields from the data
  const inferredInfos = rows.length > 0 ? inferFieldsFromData(rows) : [];
  const inferredMap = new Map(
    inferredInfos.map((info) => [
      info.name,
      buildInferredField(info),
    ])
  );

  // 3. Build the explicit fields (from config.fields)
  const explicitFields = (resourceConfig.fields ?? []).map((override) =>
    buildExplicitField(override, inferredMap.get(override.name))
  );

  const explicitNames = new Set(explicitFields.map((f) => f.name));

  // 4. Gather inferred-only fields (not in explicit list)
  const inferredOnlyFields: UISchemaField[] = [];
  if (opts.includeInferredFields) {
    for (const [name, partial] of inferredMap) {
      if (!explicitNames.has(name)) {
        inferredOnlyFields.push(finalizeField(partial));
      }
    }
  }

  // 5. Merge all fields
  let allFields = [...explicitFields, ...inferredOnlyFields];

  // 6. Resolve component mappings for every field
  allFields = allFields.map((field) => {
    const mapping = resolveComponentMapping(field);
    return {
      ...field,
      component: field.component !== undefined ? field.component : mapping.component,
      filter: field.filter !== undefined ? field.filter : mapping.filter,
    };
  });

  // 7. Build the initial schema
  const primaryKey = resourceConfig.primaryKey ?? "id";
  const schema: UISchema = {
    resource: resourceConfig.name,
    primaryKey,
    fields: allFields,
    generatedAt: new Date().toISOString(),
    sampleSize: rows.length,
    defaultSort: resourceConfig.defaultSort,
    meta: {},
  };

  // 8. Build plugin list
  const builtinPlugins = opts.applyBuiltinPlugins
    ? createBuiltinPlugins(resourceConfig)
    : [];
  const allPlugins = [...builtinPlugins, ...opts.plugins];

  // 9. Create plugin context
  const context: SchemaPluginContext = {
    resourceConfig,
    apiData: rows,
    currentSchema: schema,
  };

  // 10. Run field-level transforms
  schema.fields = runFieldTransforms(schema.fields, allPlugins, context);

  // 11. Run schema-level transforms
  const finalSchema = runSchemaTransforms(schema, allPlugins, {
    ...context,
    currentSchema: schema,
  });

  return finalSchema;
}

// ── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Normalize API response into a flat array of row objects.
 * Supports:
 *   - `{ data: [...] }` (paginated response)
 *   - `{ items: [...] }` (alternative key)
 *   - `{ results: [...] }` (Django-style)
 *   - `[...]` (direct array)
 */
function extractRows(
  apiResponse: unknown,
  maxSample: number
): Record<string, unknown>[] {
  if (!apiResponse) return [];

  // Direct array
  if (Array.isArray(apiResponse)) {
    return apiResponse.slice(0, maxSample) as Record<string, unknown>[];
  }

  // Object with data/items/results key
  if (typeof apiResponse === "object" && apiResponse !== null) {
    const obj = apiResponse as Record<string, unknown>;
    for (const key of ["data", "items", "results", "records", "rows"]) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as Record<string, unknown>[]).slice(0, maxSample);
      }
    }
  }

  return [];
}

/**
 * Build a UISchemaField from an explicit override, optionally merging
 * with an inferred field to fill in missing properties.
 */
function buildExplicitField(
  override: SchemaFieldOverride,
  inferred?: Partial<UISchemaField>
): UISchemaField {
  const base = inferred ?? {};

  const mergedType: InferredType =
    override.type ?? (base.type as InferredType) ?? "string";

  const merged: UISchemaField = {
    // Base defaults
    name: override.name,
    label: override.label ?? base.label ?? humanizeFieldName(override.name),
    type: mergedType,
    component: override.component ?? base.component ?? "TextInput",
    filter: override.filter ?? base.filter ?? "none",
    sortable: override.sortable ?? base.sortable ?? true,
    searchable: override.searchable ?? base.searchable ?? false,
    required: override.required ?? base.required ?? false,
    placeholder: override.placeholder ?? base.placeholder,
    description: override.description ?? base.description,
    defaultValue: override.defaultValue ?? base.defaultValue,
    showInTable: override.showInTable ?? base.showInTable ?? true,
    showInCreate: override.showInCreate ?? base.showInCreate ?? true,
    showInEdit: override.showInEdit ?? base.showInEdit ?? true,
    hidden: override.hidden ?? base.hidden ?? false,
    options: override.options ?? base.options,
    relationResource: override.relationResource ?? base.relationResource,
    relationLabel: override.relationLabel ?? base.relationLabel,
    relationValue: override.relationValue ?? base.relationValue,
    render: override.render ?? base.render,
    customColumn: override.customColumn ?? base.customColumn,
    validation: override.validation ?? base.validation,
    format: override.format ?? base.format,
    renderForm: override.renderForm ?? base.renderForm,
    _source: inferred ? "merged" : "explicit",
    _confidence: inferred?._confidence ?? 1,
  };

  return merged;
}

/**
 * Finalize a partially-inferred field into a complete UISchemaField
 * by filling in remaining defaults.
 */
function finalizeField(
  partial: Partial<UISchemaField> & { name: string; type: InferredType }
): UISchemaField {
  const mapping = resolveComponentMapping(partial);

  return {
    name: partial.name,
    label: partial.label ?? humanizeFieldName(partial.name),
    type: partial.type,
    component: partial.component ?? mapping.component,
    filter: partial.filter ?? mapping.filter,
    sortable: partial.sortable ?? true,
    searchable: partial.searchable ?? false,
    required: partial.required ?? false,
    placeholder: partial.placeholder,
    description: partial.description,
    defaultValue: partial.defaultValue,
    showInTable: partial.showInTable ?? true,
    showInCreate: partial.showInCreate ?? true,
    showInEdit: partial.showInEdit ?? true,
    hidden: partial.hidden ?? false,
    options: partial.options,
    relationResource: partial.relationResource,
    relationLabel: partial.relationLabel,
    relationValue: partial.relationValue,
    render: partial.render,
    customColumn: partial.customColumn,
    validation: partial.validation,
    format: partial.format,
    renderForm: partial.renderForm,
    _source: partial._source ?? "inferred",
    _confidence: partial._confidence ?? 0.5,
  };
}

/**
 * Convert a camelCase / snake_case field name into a human-readable label.
 */
function humanizeFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\bid\b/gi, "ID")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
