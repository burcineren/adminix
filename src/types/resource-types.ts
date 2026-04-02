import type { ZodSchema } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import type { ComponentType } from "react";
import type { InferredType, FilterType } from "@/core/schema/types";

// ── Field Types ──────────────────────────────────────────────────────────────

export type FieldType = InferredType;

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  color?: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FieldDefinition {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;

  // For select / multiselect
  options?: SelectOption[];
  // For relation
  relationResource?: string;
  relationLabel?: string;
  relationValue?: string;

  // Table behavior
  sortable?: boolean;
  filterable?: boolean;
  filter?: FilterType;
  searchable?: boolean;
  hidden?: boolean;
  showInTable?: boolean;
  showInCreate?: boolean;
  showInEdit?: boolean;

  // Custom render
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  customColumn?: ColumnDef<Record<string, unknown>>;

  // Validation
  validation?: ZodSchema;

  // Formatting
  format?: (value: unknown) => string;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export interface ResourcePermissions {
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
  export?: boolean;
  bulkDelete?: boolean;
}

// ── Pagination ───────────────────────────────────────────────────────────────

export type PaginationMode = "server" | "client";

export interface PaginationConfig {
  mode?: PaginationMode;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

// ── API Config ───────────────────────────────────────────────────────────────

export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  transformRequest?: (data: unknown) => unknown;
  transformResponse?: (data: unknown) => { data: unknown[]; total: number };
  endpoints?: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
    bulkDelete?: string;
  };
  queryParams?: Record<string, unknown>;
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export interface AdminixPlugin {
  name: string;
  version?: string;
  // Component injected into the dashboard sidebar
  sidebarWidget?: ComponentType;
  // Components injected above/below the table
  tableHeader?: ComponentType<{ resource: ResourceDefinition }>;
  tableFooter?: ComponentType<{ resource: ResourceDefinition }>;
  // Extra row actions
  rowActions?: RowAction[];
  // Dashboard widgets
  dashboardWidgets?: ComponentType[];
  // Hook called after every CRUD operation
  onMutation?: (type: "create" | "update" | "delete", data: unknown) => void;
}

// ── Row Actions ───────────────────────────────────────────────────────────────

export interface RowAction {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: (row: Record<string, unknown>) => void;
  hidden?: (row: Record<string, unknown>) => boolean;
  variant?: "default" | "destructive";
}

// ── Resource Definition ───────────────────────────────────────────────────────

export interface ResourceDefinition {
  name: string;
  endpoint: string;
  label?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  fields?: FieldDefinition[];
  permissions?: ResourcePermissions;
  pagination?: PaginationConfig;
  api?: ApiConfig;
  plugins?: AdminixPlugin[];
  rowActions?: RowAction[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  primaryKey?: string;
  data?: Record<string, unknown>[];
  expandable?: boolean;
  expandedComponent?: ComponentType<{ data: Record<string, unknown> }>;
}

// ── Adminix Props ──────────────────────────────────────────────────────────

export interface AdminixProps {
  // Mult-resource mode
  resources?: ResourceDefinition[];
  
  // Single-resource shorthand
  name?: string;
  endpoint?: string;
  fields?: FieldDefinition[];
  permissions?: ResourcePermissions;
  label?: string;

  // General config
  title?: string;
  logo?: React.ReactNode;
  plugins?: AdminixPlugin[];
  darkMode?: boolean;
  defaultDarkMode?: boolean;
  apiConfig?: ApiConfig;
  showDashboard?: boolean;
  dashboardTitle?: string;
  customDashboard?: React.ReactNode;
  onError?: (error: unknown) => void;
}
