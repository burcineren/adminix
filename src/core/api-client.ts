// ── Reusable API Client ──────────────────────────────────────────────────────
//
// A typed, extensible HTTP client for REST resources.
// Supports request/response interceptors, retry logic, timeout,
// and query-param serialization.

import type { ApiConfig } from "@/types/resource-types";

// ── Types ────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: unknown;
  /** Timeout in ms (default: 30 000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 0) */
  retries?: number;
  /** Base delay between retries in ms — exponential backoff applied (default: 1000) */
  retryDelay?: number;
  /** Do not serialize body as JSON (e.g. FormData) */
  rawBody?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  body: unknown;
}

/** Common paginated list response shape */
export interface PaginatedResponse<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Query parameters for list endpoints */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

// ── Interceptors ─────────────────────────────────────────────────────────────

export type RequestInterceptor = (
  url: string,
  init: RequestInit
) => RequestInit | Promise<RequestInit>;

export type ResponseInterceptor = (
  response: Response,
  url: string
) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/** Register a request interceptor (runs before every fetch). */
export function addRequestInterceptor(fn: RequestInterceptor): () => void {
  requestInterceptors.push(fn);
  return () => {
    const i = requestInterceptors.indexOf(fn);
    if (i !== -1) requestInterceptors.splice(i, 1);
  };
}

/** Register a response interceptor (runs after every fetch). */
export function addResponseInterceptor(fn: ResponseInterceptor): () => void {
  responseInterceptors.push(fn);
  return () => {
    const i = responseInterceptors.indexOf(fn);
    if (i !== -1) responseInterceptors.splice(i, 1);
  };
}

/** Remove all interceptors (useful for testing). */
export function clearInterceptors(): void {
  requestInterceptors.length = 0;
  responseInterceptors.length = 0;
}

// ── Query String Builder ─────────────────────────────────────────────────────

/**
 * Flattens a nested object into a flat record of strings for URL query parameters.
 * Highly useful for complex filters like ranges or nested settings.
 *
 * Example: { price: { min: 10, max: 20 } } -> { "price_min": "10", "price_max": "20" }
 */
function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}_${key}` : key;

        if (value === null || value === undefined || value === "") {
            continue;
        }

        if (Array.isArray(value)) {
            // Arrays are typically handled as key[]=1&key[]=2
            value.forEach((val, index) => {
                result[`${fullKey}[${index}]`] = String(val);
            });
        } else if (typeof value === "object" && !(value instanceof Date)) {
            // Recurse for nested objects
            Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
        } else {
            result[fullKey] = String(value);
        }
    }
    return result;
}

/**
 * Serialize ListQueryParams into a URL query string.
 * This is the core "Query Builder" logic.
 * Filters are prefixed with `filter_` automatically to avoid collisions with paging/sorting.
 */
export function buildQueryString(params: ListQueryParams): string {
    const urlParams = new URLSearchParams();

    // 1. Basic pagination and sorting
    if (params.page !== undefined) urlParams.append("page", String(params.page));
    if (params.pageSize !== undefined) urlParams.append("pageSize", String(params.pageSize));
    if (params.search) urlParams.append("search", params.search);
    if (params.sort) urlParams.append("sort", params.sort);
    if (params.order) urlParams.append("order", params.order);

    // 2. Complex Filters
    if (params.filters) {
        const flatFilters = flattenObject(params.filters, "filter");
        for (const [key, value] of Object.entries(flatFilters)) {
            urlParams.append(key, value);
        }
    }

    const qs = urlParams.toString();
    return qs ? `?${qs}` : "";
}

/**
 * Build a full URL from base, path, and optional query params.
 */
export function buildUrl(
  base: string,
  path: string,
  params?: ListQueryParams
): string {
  const url = `${base}${path}`;
  return params ? `${url}${buildQueryString(params)}` : url;
}

// ── Core Fetch Wrapper ───────────────────────────────────────────────────────

/**
 * Low-level typed fetch wrapper with interceptors, timeout, and retry.
 */
export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
  apiConfig?: ApiConfig
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    timeout = 30_000,
    retries = 0,
    retryDelay = 1_000,
    rawBody = false,
    headers: extraHeaders,
    ...restInit
  } = options;

  // Build headers
  const headers: Record<string, string> = {
    ...(rawBody ? {} : { "Content-Type": "application/json" }),
    ...(apiConfig?.headers ?? {}),
    ...((extraHeaders as Record<string, string>) ?? {}),
  };

  // Serialize body
  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (rawBody) {
      serializedBody = body as BodyInit;
    } else {
      const transformed = apiConfig?.transformRequest
        ? apiConfig.transformRequest(body)
        : body;
      serializedBody = JSON.stringify(transformed);
    }
  }

  let init: RequestInit = {
    method,
    headers,
    body: serializedBody,
    ...restInit,
  };

  // Run request interceptors
  for (const interceptor of requestInterceptors) {
    init = await interceptor(url, init);
  }

  // Execute with retry + timeout logic
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      let response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Run response interceptors
      for (const interceptor of responseInterceptors) {
        response = await interceptor(response, url);
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        let parsedBody: unknown = errorBody;
        try {
          parsedBody = JSON.parse(errorBody);
        } catch {
          // keep as string
        }

        const apiError: ApiError = {
          message: `API Error ${response.status}: ${typeof parsedBody === "string" ? parsedBody : response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          body: parsedBody,
        };
        throw apiError;
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      let data: T;
      if (contentType?.includes("application/json")) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Apply response transform from ApiConfig
      if (apiConfig?.transformResponse) {
        data = apiConfig.transformResponse(data) as unknown as T;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String((error as ApiError)?.message ?? error));

      // Don't retry on 4xx errors
      if (typeof error === "object" && error !== null && "status" in error) {
        const status = (error as ApiError).status;
        if (status >= 400 && status < 500) {
          throw lastError;
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}

// ── REST Convenience Methods ─────────────────────────────────────────────────

/**
 * Typed REST API client with convenience methods for all HTTP verbs.
 * Wraps the core `request()` function.
 */
let _token: string | null = null;

export const apiClient = {
  setToken: (token: string | null) => {
    _token = token;
  },

  /** GET request */
  async get<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "method" | "body">,
    config?: ApiConfig
  ): Promise<T> {
    const headers = _token ? { Authorization: `Bearer ${_token}`, ...options?.headers } : options?.headers;
    const res = await request<T>(url, { ...options, headers, method: "GET" }, config);
    return res.data;
  },

  /** POST request */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
    config?: ApiConfig
  ): Promise<T> {
    const headers = _token ? { Authorization: `Bearer ${_token}`, ...options?.headers } : options?.headers;
    const res = await request<T>(url, { ...options, headers, method: "POST", body }, config);
    return res.data;
  },

  /** PUT request */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
    config?: ApiConfig
  ): Promise<T> {
    const headers = _token ? { Authorization: `Bearer ${_token}`, ...options?.headers } : options?.headers;
    const res = await request<T>(url, { ...options, headers, method: "PUT", body }, config);
    return res.data;
  },

  /** PATCH request */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
    config?: ApiConfig
  ): Promise<T> {
    const headers = _token ? { Authorization: `Bearer ${_token}`, ...options?.headers } : options?.headers;
    const res = await request<T>(url, { ...options, headers, method: "PATCH", body }, config);
    return res.data;
  },

  /** DELETE request */
  async delete<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
    config?: ApiConfig
  ): Promise<T> {
    const headers = _token ? { Authorization: `Bearer ${_token}`, ...options?.headers } : options?.headers;
    const res = await request<T>(url, { ...options, headers, method: "DELETE", body }, config);
    return res.data;
  },
};

// ── Resource URL Builders ────────────────────────────────────────────────────

export interface ResourceEndpoints {
  list: string;
  create: string;
  update: string;
  delete: string;
  bulkDelete: string;
}

/**
 * Resolve all endpoint URLs for a resource, using explicit overrides
 * or falling back to the base resource endpoint.
 */
export function resolveEndpoints(
  baseUrl: string,
  resourceEndpoint: string,
  overrides?: Partial<ResourceEndpoints>
): ResourceEndpoints {
  const base = `${baseUrl}${resourceEndpoint}`;
  return {
    list: overrides?.list ? `${baseUrl}${overrides.list}` : base,
    create: overrides?.create ? `${baseUrl}${overrides.create}` : base,
    update: overrides?.update ? `${baseUrl}${overrides.update}` : base,
    delete: overrides?.delete ? `${baseUrl}${overrides.delete}` : base,
    bulkDelete: overrides?.bulkDelete
      ? `${baseUrl}${overrides.bulkDelete}`
      : `${base}/bulk-delete`,
  };
}

/**
 * Normalize an API response into a PaginatedResponse.
 * Supports multiple common response shapes.
 */
export function normalizePaginatedResponse<T = Record<string, unknown>>(
  raw: unknown,
  transformResponse?: (data: unknown) => { data: unknown[]; total: number }
): PaginatedResponse<T> {
  if (transformResponse) {
    const transformed = transformResponse(raw);
    return {
      data: transformed.data as T[],
      total: transformed.total,
    };
  }

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    // { data: [...], total: N }
    if (Array.isArray(obj["data"])) {
      return {
        data: obj["data"] as T[],
        total: (obj["total"] as number) ?? (obj["data"] as unknown[]).length,
        page: obj["page"] as number | undefined,
        pageSize: obj["pageSize"] as number | undefined,
      };
    }

    // { items: [...] } or { results: [...] } or { records: [...] }
    for (const key of ["items", "results", "records", "rows"]) {
      if (Array.isArray(obj[key])) {
        return {
          data: obj[key] as T[],
          total: (obj["total"] as number) ?? (obj["count"] as number) ?? (obj[key] as unknown[]).length,
        };
      }
    }

    // Direct array
    if (Array.isArray(raw)) {
      return { data: raw as T[], total: (raw as unknown[]).length };
    }
  }

  // Fallback
  return { data: [], total: 0 };
}
