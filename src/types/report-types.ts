import type { ComponentType } from "react";

// ── Chart Types ──────────────────────────────────────────────────────────────

/**
 * Built-in chart types supported by the rendering engine.
 */
export type ChartType = 
  | "line" 
  | "bar" 
  | "pie" 
  | "area" 
  | "kpi" 
  | "table";

/**
 * Supported data aggregation methods for reports.
 */
export type AggregationMethod = 
  | "sum" 
  | "avg" 
  | "count" 
  | "min" 
  | "max";

// ── Widget Configuration ─────────────────────────────────────────────────────

/**
 * Configuration for a single widget (chart, KPI, or table) on the dashboard.
 */
export interface ReportWidget {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  
  // Data Source config
  dataSource: {
    resourceName?: string; // Existing Adminix resource
    endpoint?: string;     // Custom API endpoint
    method?: "GET" | "POST";
    params?: Record<string, unknown>;
  };

  // Visual/Chart config
  config: {
    xAxisField?: string;
    yAxisField?: string;
    valueField?: string;
    seriesFields?: string[];
    aggregate?: AggregationMethod;
    colors?: string[];
    showLabels?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    stack?: boolean;
    suffix?: string;
    prefix?: string;
  };

  // Layout config (for react-grid-layout)
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
  };
}

// ── Report Definition ────────────────────────────────────────────────────────

/**
 * The full definition of a report (a dashboard view).
 */
export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  widgets: ReportWidget[];
  filters: GlobalReportFilter[];
  createdAt: string;
  updatedAt: string;
  _source: "local" | "system" | "api" | "playground";
}

/**
 * Global filters that apply to all widgets in a report.
 */
export interface GlobalReportFilter {
  id: string;
  field: string;
  label: string;
  type: "date-range" | "select" | "text";
  defaultValue?: unknown;
  options?: { label: string; value: string | number }[];
}

// ── Plugin Extensions ────────────────────────────────────────────────────────

/**
 * Generic data item structure for charts and tables.
 */
export type ReportDataItem = Record<string, unknown>;

/**
 * Extend Adminix with custom report widgets or chart types.
 */
export interface ReportPlugin {
  name: string;
  chartTypes?: {
    name: string;
    component: ComponentType<{ widget: ReportWidget; data: ReportDataItem[] }>;
  }[];
}
