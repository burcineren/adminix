import type { ApiConfig } from "@/types/resource-types";

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

export function buildQueryString(params: QueryParams): string {
  const query: Record<string, string> = {};

  if (params.page !== undefined) query["page"] = String(params.page);
  if (params.pageSize !== undefined) query["pageSize"] = String(params.pageSize);
  if (params.search) query["search"] = params.search;
  if (params.sort) query["sort"] = params.sort;
  if (params.order) query["order"] = params.order;

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== undefined && value !== null && value !== "") {
        query[`filter_${key}`] = String(value);
      }
    }
  }
  return new URLSearchParams(query).toString();
}

export async function apiClient<T = unknown>(
  url: string,
  options: RequestInit = {},
  config?: ApiConfig
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(config?.headers ?? {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as T;
  return data;
}

export function buildEndpoint(
  base: string,
  endpoint: string,
  params?: QueryParams
): string {
  const qs = params ? buildQueryString(params) : "";
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${base}${endpoint}${qs ? `${separator}${qs}` : ""}`;
}
