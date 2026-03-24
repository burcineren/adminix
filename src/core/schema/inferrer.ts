// ── Schema Inferrer ──────────────────────────────────────────────────────────
//
// Analyses raw API response data and infers field types with confidence scores.
// Designed to operate on a sample of rows (typically the first page of results).

import type { InferredType, UISchemaField } from "./types";

// ── Pattern constants ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico)(\?|$)/i;

// ── Single-value type detection ──────────────────────────────────────────────

interface TypeVote {
  type: InferredType;
  confidence: number;
}

/**
 * Determine the most likely type for a single JSON value.
 */
function detectValueType(value: unknown): TypeVote {
  if (value === null || value === undefined) {
    return { type: "unknown", confidence: 0 };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", confidence: 1.0 };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { type: "integer", confidence: 0.95 }
      : { type: "number", confidence: 0.95 };
  }

  if (typeof value === "string") {
    return detectStringType(value);
  }

  if (Array.isArray(value)) {
    return { type: "array", confidence: 0.9 };
  }

  if (typeof value === "object") {
    return { type: "object", confidence: 0.9 };
  }

  return { type: "unknown", confidence: 0 };
}

/**
 * Sub-classifier for string values — checks patterns to decide
 * between email, url, image-url, uuid, date, datetime, or plain string.
 */
function detectStringType(value: string): TypeVote {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { type: "string", confidence: 0.3 };
  }

  // UUID
  if (UUID_RE.test(trimmed)) {
    return { type: "uuid", confidence: 0.95 };
  }

  // Email
  if (EMAIL_RE.test(trimmed)) {
    return { type: "email", confidence: 0.9 };
  }

  // Image URL (check before generic URL)
  if (URL_RE.test(trimmed) && IMAGE_EXT_RE.test(trimmed)) {
    return { type: "image-url", confidence: 0.9 };
  }

  // URL
  if (URL_RE.test(trimmed)) {
    return { type: "url", confidence: 0.85 };
  }

  // ISO datetime
  if (ISO_DATETIME_RE.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return { type: "datetime", confidence: 0.9 };
    }
  }

  // ISO date
  if (ISO_DATE_RE.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return { type: "date", confidence: 0.9 };
    }
  }

  // Try JSON
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return { type: "json", confidence: 0.7 };
    } catch {
      // not JSON, fall through
    }
  }

  return { type: "string", confidence: 0.8 };
}

// ── Enum detection ───────────────────────────────────────────────────────────

/**
 * Given all values for a field across rows, decide if it's an enum (select).
 * Heuristic: if the number of unique values is ≤ `maxUnique` and the ratio
 * of unique values to total is below `maxRatio`, it's likely an enum.
 */
function isLikelyEnum(
  values: unknown[],
  maxUnique = 20,
  maxRatio = 0.3
): boolean {
  const nonNull = values.filter((v) => v !== null && v !== undefined);
  if (nonNull.length === 0) return false;

  const unique = new Set(nonNull.map(String));
  if (unique.size > maxUnique) return false;
  if (unique.size === nonNull.length && nonNull.length > 5) return false;

  return unique.size / nonNull.length <= maxRatio;
}

/**
 * Extract unique option values from a set of field values.
 */
function extractEnumOptions(
  values: unknown[]
): { label: string; value: string | number | boolean }[] {
  const unique = new Set<string>();
  const options: { label: string; value: string | number | boolean }[] = [];

  for (const v of values) {
    if (v === null || v === undefined) continue;
    const key = String(v);
    if (unique.has(key)) continue;
    unique.add(key);
    options.push({
      label: humanizeValue(key),
      value: typeof v === "number" || typeof v === "boolean" ? v : key,
    });
  }

  return options.sort((a, b) => String(a.label).localeCompare(String(b.label)));
}

// ── Aggregate inference across rows ──────────────────────────────────────────

interface InferredFieldInfo {
  name: string;
  type: InferredType;
  confidence: number;
  isNullable: boolean;
  isEnum: boolean;
  enumOptions?: { label: string; value: string | number | boolean }[];
  sampleValues: unknown[];
}

/**
 * Infer field types from an array of API response objects.
 *
 * @param rows  The sample data (array of flat JSON objects)
 * @returns     An array of inferred field information
 */
export function inferFieldsFromData(
  rows: Record<string, unknown>[]
): InferredFieldInfo[] {
  if (rows.length === 0) return [];

  // Collect all field names across all rows
  const fieldNames = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      fieldNames.add(key);
    }
  }

  const result: InferredFieldInfo[] = [];

  for (const name of fieldNames) {
    const values = rows.map((row) => row[name]);
    const nonNull = values.filter((v) => v !== null && v !== undefined);
    const isNullable = nonNull.length < values.length;

    // Vote across all non-null values
    const votes = new Map<InferredType, number[]>();
    for (const v of nonNull) {
      const { type, confidence } = detectValueType(v);
      if (!votes.has(type)) votes.set(type, []);
      votes.get(type)!.push(confidence);
    }

    // Pick the type with the most votes (weighted by confidence)
    let bestType: InferredType = "unknown";
    let bestScore = 0;

    for (const [type, scores] of votes) {
      const avgConf = scores.reduce((a, b) => a + b, 0) / scores.length;
      const weight = (scores.length / Math.max(nonNull.length, 1)) * avgConf;
      if (weight > bestScore) {
        bestScore = weight;
        bestType = type;
      }
    }

    // Check for enum pattern (only for string/number/integer)
    const isEnum =
      (bestType === "string" || bestType === "number" || bestType === "integer") &&
      isLikelyEnum(nonNull);

    const info: InferredFieldInfo = {
      name,
      type: isEnum ? "enum" : bestType,
      confidence: Math.round(bestScore * 100) / 100,
      isNullable,
      isEnum,
      sampleValues: nonNull.slice(0, 5),
    };

    if (isEnum) {
      info.enumOptions = extractEnumOptions(nonNull);
    }

    result.push(info);
  }

  return result;
}

// ── Build partial UISchemaField from inferred info ───────────────────────────

/**
 * Convert inferred field info into a baseline UISchemaField.
 * The mapper will later enrich it with component & filter mappings.
 */
export function buildInferredField(
  info: InferredFieldInfo
): Partial<UISchemaField> & { name: string; type: InferredType } {
  return {
    name: info.name,
    type: info.type,
    label: humanizeFieldName(info.name),
    required: !info.isNullable,
    sortable: isSortableType(info.type),
    searchable: isSearchableType(info.type),
    hidden: isAutoHiddenField(info.name),
    showInTable: !isAutoHiddenField(info.name),
    showInCreate: !isReadOnlyField(info.name),
    showInEdit: !isReadOnlyField(info.name),
    options: info.enumOptions,
    _source: "inferred" as const,
    _confidence: info.confidence,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a camelCase / snake_case field name into a human-readable label.
 */
function humanizeFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")   // camelCase → spaces
    .replace(/[_-]/g, " ")        // snake_case / kebab-case
    .replace(/\bid\b/gi, "ID")    // "id" → "ID"
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a raw enum value into a human-readable label.
 */
function humanizeValue(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Decide if a type is naturally sortable in a table column.
 */
function isSortableType(type: InferredType): boolean {
  const sortable: InferredType[] = [
    "string", "number", "integer", "date", "datetime", "email", "enum", "boolean",
  ];
  return sortable.includes(type);
}

/**
 * Decide if a type is useful for full-text search.
 */
function isSearchableType(type: InferredType): boolean {
  const searchable: InferredType[] = [
    "string", "email", "url", "uuid",
  ];
  return searchable.includes(type);
}

/**
 * Fields that are typically auto-generated and should be hidden from forms.
 */
function isReadOnlyField(name: string): boolean {
  const lower = name.toLowerCase();
  return [
    "id", "createdat", "created_at", "updatedat", "updated_at",
    "deletedat", "deleted_at", "uuid", "_id",
  ].includes(lower);
}

/**
 * Fields commonly hidden from the table view by default.
 */
function isAutoHiddenField(name: string): boolean {
  const lower = name.toLowerCase();
  return ["password", "hash", "token", "secret", "deleted_at", "deletedat"].includes(lower);
}
