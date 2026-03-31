// Public library entry point
import "./index.css";
export { Adminix, Adminix as AdminPanel } from "./components/Adminix";
export { ResourceView } from "./components/ResourceView";
export { DataTable } from "./components/DataTable";
export { FormGenerator } from "./components/FormGenerator";
export { GlobalModalManager } from "./components/GlobalModalManager";
export { FilterBar } from "./components/FilterBar";
export { SearchBar } from "./components/SearchBar";
export { DevPlayground } from "./components/DevPlayground";
export { useResource } from "./hooks/useResource";
export { useFilters } from "./hooks/useFilters";
export { usePagination } from "./hooks/usePagination";
export { useCrudActions } from "./hooks/useCrudActions";
export { useAdminStore } from "./core/store";

// API Client
export {
  apiClient,
  request,
  buildUrl,
  buildQueryString,
  resolveEndpoints,
  normalizePaginatedResponse,
  addRequestInterceptor,
  addResponseInterceptor,
  clearInterceptors,
} from "./core/api-client";

// Data Layer Types
export type {
  HttpMethod,
  RequestOptions,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  ListQueryParams,
  RequestInterceptor,
  ResponseInterceptor,
  ResourceEndpoints,
} from "./core/api-client";

export type {
  UseResourceReturn,
  UseResourceOptions,
  ResourceListState,
  SortState,
} from "./hooks/useResource";

export type {
  UsePaginationReturn,
  PaginationState,
  PaginationActions,
} from "./hooks/usePagination";

export type {
  FiltersReturn,
  FilterState,
  FilterValue,
  UseFiltersOptions,
} from "./hooks/useFilters";

export type {
  UseCrudActionsReturn,
  CrudCallbacks,
  CrudMutationState,
  CreatePayload,
  UpdatePayload,
} from "./hooks/useCrudActions";

// Schema Engine (core)
export {
  generateUISchema,
  inferFieldsFromData,
  resolveComponentMapping,
  registerComponentMapper,
  clearComponentMappers,
  registerSchemaPlugin,
  unregisterSchemaPlugin,
  clearSchemaPlugins,
  getRegisteredPlugins,
  createSchemaPlugin,
  getComponentForType,
  getFilterForType,
  getDefaultMappings,
} from "./core/schema";

// Schema Engine Types
export type {
  UISchema,
  UISchemaField,
  UIComponentName,
  BuiltinComponent,
  FilterType,
  InferredType,
  UISelectOption as UISchemaSelectOption,
  ResourceConfig,
  SchemaFieldOverride,
  SchemaPlugin,
  SchemaPluginContext,
  GenerateUISchemaOptions,
} from "./core/schema";

// Types
export type {
  ResourceDefinition,
  FieldDefinition,
  FieldType,
  SelectOption,
  ResourcePermissions,
  PaginationConfig,
  ApiConfig,
  AdminixPlugin,
  AdminixPlugin as AdminPlugin,
  RowAction,
  AdminixProps,
  AdminixProps as AdminPanelProps,
} from "./types/resource-types";
