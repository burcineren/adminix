// ── UI Schema Core Types ─────────────────────────────────────────────────────
//
// The unified UI Schema format consumed by all AutoAdmin components.
// Every field in a resource ultimately becomes a UISchemaField.

import type { ComponentType } from "react";
import type { ZodSchema } from "zod";

// ── Component Names ──────────────────────────────────────────────────────────

/**
 * Built-in UI component names that AutoAdmin ships with.
 * Plugins can register additional component names via string literals.
 */
export type BuiltinComponent =
  | "TextInput"
  | "NumberInput"
  | "EmailInput"
  | "PasswordInput"
  | "UrlInput"
  | "TextareaInput"
  | "SelectInput"
  | "MultiSelectInput"
  | "BooleanSwitch"
  | "DatePicker"
  | "DateTimePicker"
  | "ImageUpload"
  | "FileUpload"
  | "ColorPicker"
  | "JsonEditor"
  | "RelationPicker"
  | "CustomComponent";

/** Component name — built-in or any string for plugin-registered ones. */
export type UIComponentName = BuiltinComponent | (string & Record<never, never>);

// ── Filter Types ─────────────────────────────────────────────────────────────

/**
 * The type of filter control to render for a column.
 */
export type FilterType =
  | "search"       // free-text search input
  | "range"        // min/max numeric range
  | "select"       // dropdown single-select
  | "multiselect"  // dropdown multi-select
  | "boolean"      // true/false toggle
  | "date-range"   // from/to date picker
  | "none";        // no filter

// ── Select Option ────────────────────────────────────────────────────────────

export interface UISelectOption {
  label: string;
  value: string | number | boolean;
  color?: string;
  icon?: ComponentType<{ className?: string }>;
}

// ── UI Schema Field (the core atom) ──────────────────────────────────────────

/**
 * Describes a single field as understood by every UI layer:
 * table columns, forms, filters, and export.
 */
export interface UISchemaField {
  /** Machine-readable key, e.g. "price" */
  name: string;

  /** Human-readable label, e.g. "Product Price" */
  label: string;

  /** Inferred or explicit data type */
  type: InferredType;

  /** The UI component that should render this field in forms */
  component: UIComponentName;

  /** The filter widget to use in filter bar */
  filter: FilterType;

  /** Whether the column is sortable in a data table */
  sortable: boolean;

  /** Whether this field is available for full-text search */
  searchable: boolean;

  /** Whether this field is required in create/edit forms */
  required: boolean;

  /** Placeholder text for form inputs */
  placeholder?: string;

  /** Help text shown below the form input */
  description?: string;

  /** Default value for create forms */
  defaultValue?: unknown;

  // ── Visibility ──────────────────────────────────────────────────────────────

  /** Show as a column in the data table (default: true) */
  showInTable: boolean;

  /** Show in create form (default: true) */
  showInCreate: boolean;

  /** Show in edit form (default: true) */
  showInEdit: boolean;

  /** Completely hidden from all views */
  hidden: boolean;

  // ── Enum / Relation ─────────────────────────────────────────────────────────

  /** Options for select/multiselect fields */
  options?: UISelectOption[];

  /** For "relation" type: the target resource name */
  relationResource?: string;

  /** For "relation" type: which field to display as label */
  relationLabel?: string;

  /** For "relation" type: which field to use as value */
  relationValue?: string;

  // ── Custom rendering ────────────────────────────────────────────────────────

  /** Custom column render function (table cells) */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;

  /** Custom TanStack column definition override */
  customColumn?: unknown;

  /** Zod validation schema for forms */
  validation?: ZodSchema;

  /**
   * Formatting function for display values (table cells, read-only views).
   * Called before React rendering.
   */
  format?: (value: unknown) => string;

  /**
   * Custom form field render function.
   * If provided, the generic FormGenerator will use this instead of BuiltinComponent.
   */
  renderForm?: (field: UISchemaField, props: any) => React.ReactNode;

  // ── Metadata ────────────────────────────────────────────────────────────────

  /** Source of the field: inferred from data, or explicitly defined */
  _source: "inferred" | "explicit" | "merged";

  /** Confidence score for inferred types (0–1). 1 for explicit fields. */
  _confidence: number;
}

// ── Inferred Types ───────────────────────────────────────────────────────────

/**
 * Types that the schema inferrer can detect from raw JSON values.
 * This is intentionally broader than FieldType to allow richer inference.
 */
export type InferredType =
  | "string"
  | "text"          // alias for string
  | "textarea"      // alias for string (long)
  | "email"
  | "password"
  | "url"
  | "uuid"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "image"         // alias for image-url
  | "image-url"
  | "file"
  | "color"
  | "json"
  | "array"
  | "object"
  | "enum"
  | "select"        // alias for enum
  | "multiselect"   // alias for array of enum
  | "relation"
  | "custom"
  | "unknown";

// ── Resource Configuration ───────────────────────────────────────────────────

/**
 * A lightweight resource config that can be passed to `generateUISchema`.
 * This mirrors the existing ResourceDefinition but only carries schema-relevant
 * properties so the engine stays decoupled from UI plumbing.
 */
export interface ResourceConfig {
  /** Unique resource name, e.g. "products" */
  name: string;

  /** REST endpoint */
  endpoint: string;

  /** Primary key field name (default: "id") */
  primaryKey?: string;

  /**
   * Explicit field definitions. When provided these take priority
   * over inferred schema. Missing fields in the API response will
   * still be inferred and appended.
   */
  fields?: SchemaFieldOverride[];

  /** Whether the resource supports search */
  searchable?: boolean;

  /** Whether the resource supports filtering */
  filterable?: boolean;

  /** Default sort configuration */
  defaultSort?: { field: string; direction: "asc" | "desc" };
}

/**
 * Partial field overrides that a consumer can supply.
 * Only `name` is required — everything else is optional and will be
 * merged with the inferred schema.
 */
export interface SchemaFieldOverride {
  name: string;
  label?: string;
  type?: InferredType;
  component?: UIComponentName;
  filter?: FilterType;
  sortable?: boolean;
  searchable?: boolean;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  hidden?: boolean;
  showInTable?: boolean;
  showInCreate?: boolean;
  showInEdit?: boolean;
  options?: UISelectOption[];
  relationResource?: string;
  relationLabel?: string;
  relationValue?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  customColumn?: unknown;
  validation?: ZodSchema;
  format?: (value: unknown) => string;
  renderForm?: (field: UISchemaField, props: any) => React.ReactNode;
}

// ── UI Schema (the complete output) ──────────────────────────────────────────

/**
 * The full UI Schema for a single resource.
 * This is the final output of `generateUISchema()`.
 */
export interface UISchema {
  /** Resource name */
  resource: string;

  /** Primary key field name */
  primaryKey: string;

  /** All resolved fields */
  fields: UISchemaField[];

  /** Timestamp when the schema was generated */
  generatedAt: string;

  /** Number of API rows that were sampled to infer the schema */
  sampleSize: number;

  /** Fields configured for default sort */
  defaultSort?: { field: string; direction: "asc" | "desc" };

  /** Plugin metadata attached during processing */
  meta: Record<string, unknown>;
}

// ── Plugin Types ─────────────────────────────────────────────────────────────

/**
 * A schema plugin can inspect and transform the UI schema
 * at various lifecycle stages.
 */
export interface SchemaPlugin {
  /** Unique plugin name */
  name: string;

  /** Plugin priority — lower numbers run first (default: 100) */
  priority?: number;

  /**
   * Called after the initial schema is built (inferred + merged with overrides)
   * but before the final output is produced.
   *
   * Return a modified fields array, or `undefined` to skip.
   */
  transformFields?: (
    fields: UISchemaField[],
    context: SchemaPluginContext
  ) => UISchemaField[] | undefined;

  /**
   * Called with the complete UISchema before it is returned.
   * Can mutate the schema or return a new one.
   */
  transformSchema?: (
    schema: UISchema,
    context: SchemaPluginContext
  ) => UISchema | undefined;
}

/**
 * Context object passed to schema plugins.
 */
export interface SchemaPluginContext {
  /** The original resource configuration */
  resourceConfig: ResourceConfig;

  /** The raw API response data that was sampled */
  apiData: Record<string, unknown>[];

  /** The current schema being built */
  currentSchema: UISchema;
}
