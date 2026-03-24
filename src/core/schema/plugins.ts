// ── Schema Plugin Pipeline ───────────────────────────────────────────────────
//
// Manages registration and execution of SchemaPlugins that can transform
// the UI schema at various lifecycle stages.

import type {
  SchemaPlugin,
  SchemaPluginContext,
  UISchema,
  UISchemaField,
  ResourceConfig,
} from "./types";

// ── Plugin Registry ──────────────────────────────────────────────────────────

const globalPlugins: SchemaPlugin[] = [];

/**
 * Register a schema plugin globally.
 * It will be applied to every `generateUISchema` call.
 */
export function registerSchemaPlugin(plugin: SchemaPlugin): void {
  globalPlugins.push(plugin);
}

/**
 * Unregister a schema plugin by name.
 */
export function unregisterSchemaPlugin(name: string): void {
  const idx = globalPlugins.findIndex((p) => p.name === name);
  if (idx !== -1) globalPlugins.splice(idx, 1);
}

/**
 * Remove all registered global plugins (useful for testing).
 */
export function clearSchemaPlugins(): void {
  globalPlugins.length = 0;
}

/**
 * Get a snapshot of currently registered global plugins.
 */
export function getRegisteredPlugins(): readonly SchemaPlugin[] {
  return [...globalPlugins];
}

// ── Pipeline Execution ───────────────────────────────────────────────────────

/**
 * Sort plugins by priority (lower = first). Default priority is 100.
 */
function sortPlugins(plugins: SchemaPlugin[]): SchemaPlugin[] {
  return [...plugins].sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
  );
}

/**
 * Run all `transformFields` hooks in priority order.
 *
 * @param fields          The fields array to transform
 * @param localPlugins    Per-call plugins (merged with global)
 * @param context         Plugin context
 * @returns               The transformed fields array
 */
export function runFieldTransforms(
  fields: UISchemaField[],
  localPlugins: SchemaPlugin[],
  context: SchemaPluginContext
): UISchemaField[] {
  const sorted = sortPlugins([...globalPlugins, ...localPlugins]);
  let result = fields;

  for (const plugin of sorted) {
    if (plugin.transformFields) {
      const transformed = plugin.transformFields(result, context);
      if (transformed) {
        result = transformed;
      }
    }
  }

  return result;
}

/**
 * Run all `transformSchema` hooks in priority order.
 *
 * @param schema          The UISchema to transform
 * @param localPlugins    Per-call plugins (merged with global)
 * @param context         Plugin context
 * @returns               The transformed UISchema
 */
export function runSchemaTransforms(
  schema: UISchema,
  localPlugins: SchemaPlugin[],
  context: SchemaPluginContext
): UISchema {
  const sorted = sortPlugins([...globalPlugins, ...localPlugins]);
  let result = schema;

  for (const plugin of sorted) {
    if (plugin.transformSchema) {
      const transformed = plugin.transformSchema(result, {
        ...context,
        currentSchema: result,
      });
      if (transformed) {
        result = transformed;
      }
    }
  }

  return result;
}

// ── Built-in Plugins ─────────────────────────────────────────────────────────

/**
 * A built-in plugin that hides primary-key fields from create forms
 * (since they are typically auto-generated).
 */
export function createPrimaryKeyPlugin(primaryKey: string): SchemaPlugin {
  return {
    name: "__builtin:primary-key",
    priority: 0,
    transformFields: (fields) =>
      fields.map((f) =>
        f.name === primaryKey
          ? { ...f, showInCreate: false, showInEdit: false, required: false }
          : f
      ),
  };
}

/**
 * A built-in plugin that enforces field ordering:
 *   1. Primary key first
 *   2. Explicit fields in their original order
 *   3. Inferred fields alphabetically
 */
export function createFieldOrderPlugin(
  primaryKey: string,
  explicitNames: string[]
): SchemaPlugin {
  return {
    name: "__builtin:field-order",
    priority: 1,
    transformFields: (fields) => {
      const pkField = fields.find((f) => f.name === primaryKey);
      const explicit = explicitNames
        .filter((n) => n !== primaryKey)
        .map((n) => fields.find((f) => f.name === n))
        .filter(Boolean) as UISchemaField[];
      const remaining = fields
        .filter(
          (f) =>
            f.name !== primaryKey &&
            !explicitNames.includes(f.name)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      return [
        ...(pkField ? [pkField] : []),
        ...explicit,
        ...remaining,
      ];
    },
  };
}

/**
 * Factory for timestamp-aware plugin: marks common timestamp fields
 * as read-only and formats them nicely.
 */
export function createTimestampPlugin(): SchemaPlugin {
  const timestampFields = [
    "createdat", "created_at", "updatedat", "updated_at",
    "deletedat", "deleted_at",
  ];

  return {
    name: "__builtin:timestamps",
    priority: 2,
    transformFields: (fields) =>
      fields.map((f) => {
        if (timestampFields.includes(f.name.toLowerCase())) {
          return {
            ...f,
            showInCreate: false,
            showInEdit: false,
            sortable: true,
            format: f.format ?? ((v: unknown) => {
              if (!v) return "—";
              const d = new Date(String(v));
              return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
            }),
          };
        }
        return f;
      }),
  };
}

/**
 * Utility to create an inline schema plugin from a simple transform function.
 */
export function createSchemaPlugin(
  name: string,
  transform: SchemaPlugin["transformFields"],
  priority = 100
): SchemaPlugin {
  return { name, priority, transformFields: transform };
}

// ── Bridge: Convert existing AdminPlugin to SchemaPlugin ─────────────────────

/**
 * Build schema-level plugins from the `ResourceConfig`.
 * This automatically wires up the primary-key, timestamps, and field-order
 * built-in plugins.
 */
export function createBuiltinPlugins(config: ResourceConfig): SchemaPlugin[] {
  const pk = config.primaryKey ?? "id";
  const explicitNames = (config.fields ?? []).map((f) => f.name);

  return [
    createPrimaryKeyPlugin(pk),
    createTimestampPlugin(),
    createFieldOrderPlugin(pk, explicitNames),
  ];
}
