// ── Component & Filter Mapper ────────────────────────────────────────────────
//
// Maps InferredType → UIComponentName and InferredType → FilterType.
// Supports registering custom mappings for plugin extensibility.

import type {
  InferredType,
  UIComponentName,
  FilterType,
  UISchemaField,
} from "./types";

// ── Default Mappings ─────────────────────────────────────────────────────────

interface ComponentMapping {
  component: UIComponentName;
  filter: FilterType;
}

/**
 * Default mapping table: InferredType → component + filter.
 */
const DEFAULT_COMPONENT_MAP: Record<InferredType, ComponentMapping> = {
  string:      { component: "TextInput",        filter: "search" },
  text:        { component: "TextInput",        filter: "search" },
  textarea:    { component: "TextareaInput",    filter: "search" },
  email:       { component: "EmailInput",        filter: "search" },
  password:    { component: "PasswordInput",     filter: "none" },
  url:         { component: "UrlInput",          filter: "search" },
  uuid:        { component: "TextInput",         filter: "search" },
  "image-url": { component: "ImageUpload",       filter: "none" },
  image:       { component: "ImageUpload",       filter: "none" },
  number:      { component: "NumberInput",       filter: "range" },
  integer:     { component: "NumberInput",       filter: "range" },
  boolean:     { component: "BooleanSwitch",     filter: "boolean" },
  date:        { component: "DatePicker",        filter: "date-range" },
  datetime:    { component: "DateTimePicker",    filter: "date-range" },
  json:        { component: "JsonEditor",        filter: "none" },
  array:       { component: "TextInput",         filter: "none" },
  object:      { component: "JsonEditor",        filter: "none" },
  enum:        { component: "SelectInput",       filter: "select" },
  select:      { component: "SelectInput",       filter: "select" },
  multiselect: { component: "MultiSelectInput",  filter: "multiselect" },
  file:        { component: "FileUpload",        filter: "none" },
  color:       { component: "ColorPicker",       filter: "none" },
  relation:    { component: "RelationPicker",    filter: "select" },
  custom:      { component: "CustomComponent",   filter: "none" },
  unknown:     { component: "TextInput",         filter: "none" },
};

// ── Custom Mapping Registry ──────────────────────────────────────────────────

type CustomMapperFn = (field: Partial<UISchemaField>) => ComponentMapping | null;

const customMappers: CustomMapperFn[] = [];

/**
 * Register a custom mapper function. It receives a partial field and should
 * return a ComponentMapping if it wants to override the default,
 * or `null` to fall through to the next mapper / default.
 *
 * @example
 * ```ts
 * registerComponentMapper((field) => {
 *   if (field.name === "rating") {
 *     return { component: "StarRating", filter: "range" };
 *   }
 *   return null;
 * });
 * ```
 */
export function registerComponentMapper(mapper: CustomMapperFn): void {
  customMappers.push(mapper);
}

/**
 * Remove all custom mappers (useful for testing).
 */
export function clearComponentMappers(): void {
  customMappers.length = 0;
}

// ── Mapping Functions ────────────────────────────────────────────────────────

/**
 * Resolve the UI component and filter type for a (partial) UISchemaField.
 *
 * Resolution order:
 *   1. Explicit `component` / `filter` already set on the field (override wins)
 *   2. Custom mappers (last registered runs first, first non-null wins)
 *   3. Default mapping table
 */
export function resolveComponentMapping(
  field: Partial<UISchemaField> & { type: InferredType }
): ComponentMapping {
  // 1. If explicitly provided, honour them
  if (field.component && field.filter) {
    return { component: field.component, filter: field.filter };
  }

  // 2. Custom mappers (LIFO — last registered has highest priority)
  for (let i = customMappers.length - 1; i >= 0; i--) {
    const result = customMappers[i](field);
    if (result) {
      return {
        component: field.component ?? result.component,
        filter: field.filter ?? result.filter,
      };
    }
  }

  // 3. Default mapping
  const defaults = DEFAULT_COMPONENT_MAP[field.type] ?? DEFAULT_COMPONENT_MAP["unknown"];
  return {
    component: field.component ?? defaults.component,
    filter: field.filter ?? defaults.filter,
  };
}

/**
 * Convenience: get just the component name for a type.
 */
export function getComponentForType(type: InferredType): UIComponentName {
  return (DEFAULT_COMPONENT_MAP[type] ?? DEFAULT_COMPONENT_MAP["unknown"]).component;
}

/**
 * Convenience: get just the filter type for a type.
 */
export function getFilterForType(type: InferredType): FilterType {
  return (DEFAULT_COMPONENT_MAP[type] ?? DEFAULT_COMPONENT_MAP["unknown"]).filter;
}

/**
 * Returns a copy of the full default mapping table (read-only inspection).
 */
export function getDefaultMappings(): Readonly<Record<InferredType, ComponentMapping>> {
  return { ...DEFAULT_COMPONENT_MAP };
}
