// ── Schema Engine — Public API ────────────────────────────────────────────────
//
// Re-exports the public surface of the schema engine from a single barrel.

// Core function
export { generateUISchema } from "./parser";
export type { GenerateUISchemaOptions } from "./parser";

// Types
export type {
  UISchema,
  UISchemaField,
  UIComponentName,
  BuiltinComponent,
  FilterType,
  InferredType,
  UISelectOption,
  ResourceConfig,
  SchemaFieldOverride,
  SchemaPlugin,
  SchemaPluginContext,
} from "./types";

// Inferrer
export { inferFieldsFromData, buildInferredField } from "./inferrer";

// Mapper
export {
  resolveComponentMapping,
  registerComponentMapper,
  clearComponentMappers,
  getComponentForType,
  getFilterForType,
  getDefaultMappings,
} from "./mapper";

// Plugin system
export {
  registerSchemaPlugin,
  unregisterSchemaPlugin,
  clearSchemaPlugins,
  getRegisteredPlugins,
  createSchemaPlugin,
  createPrimaryKeyPlugin,
  createTimestampPlugin,
  createFieldOrderPlugin,
  createBuiltinPlugins,
} from "./plugins";
