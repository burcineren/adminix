// ── Schema Engine — Example Usage ─────────────────────────────────────────────
//
// Demonstrates how to use generateUISchema() with different scenarios.
// Run this file or reference it to understand the schema engine API.

import {
  generateUISchema,
  registerSchemaPlugin,
  registerComponentMapper,
  clearSchemaPlugins,
  clearComponentMappers,
} from "@/core/schema";
import type {
  ResourceConfig,
  SchemaPlugin,
  UISchemaField,
} from "@/core/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// Example 1: Fully inferred schema (zero configuration)
// ═══════════════════════════════════════════════════════════════════════════════

export function example1_fullyInferred() {
  const config: ResourceConfig = {
    name: "products",
    endpoint: "/api/products",
  };

  const apiResponse = {
    data: [
      {
        id: 1,
        name: "Pro Laptop 15\"",
        price: 1299,
        category: "electronics",
        inStock: true,
        createdAt: "2024-01-10",
        image: "https://images.unsplash.com/photo.jpg",
      },
      {
        id: 2,
        name: "Wireless Headphones",
        price: 249,
        category: "electronics",
        inStock: true,
        createdAt: "2024-01-15",
      },
      {
        id: 3,
        name: "Ergonomic Chair",
        price: 549,
        category: "furniture",
        inStock: false,
        createdAt: "2024-01-20",
      },
    ],
    total: 3,
  };

  const schema = generateUISchema(config, apiResponse);

  console.log("═══ Example 1: Fully Inferred Schema ═══");
  console.log(`Resource: ${schema.resource}`);
  console.log(`Primary Key: ${schema.primaryKey}`);
  console.log(`Sample Size: ${schema.sampleSize}`);
  console.log(`Fields (${schema.fields.length}):`);
  schema.fields.forEach((f: UISchemaField) => {
    console.log(
      `  ${f.name}: type=${f.type}, component=${f.component}, filter=${f.filter}, sortable=${f.sortable}`
    );
  });
  console.log();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example 2: Explicit fields with overrides
// ═══════════════════════════════════════════════════════════════════════════════

export function example2_withOverrides() {
  const config: ResourceConfig = {
    name: "products",
    endpoint: "/api/products",
    primaryKey: "id",
    fields: [
      { name: "name", type: "string", required: true, label: "Product Name" },
      {
        name: "price",
        type: "number",
        component: "NumberInput",
        filter: "range",
        required: true,
        format: (v: unknown) => `$${Number(v).toFixed(2)}`,
      },
      {
        name: "category",
        type: "enum",
        component: "SelectInput",
        filter: "select",
        options: [
          { label: "Electronics", value: "electronics" },
          { label: "Furniture", value: "furniture" },
          { label: "Stationery", value: "stationery" },
          { label: "Accessories", value: "accessories" },
        ],
      },
      { name: "inStock", type: "boolean", label: "In Stock" },
    ],
    defaultSort: { field: "name", direction: "asc" },
  };

  // Inferred fields from the API (e.g. createdAt, image) will still be added
  const apiResponse = {
    data: [
      {
        id: 1,
        name: "Laptop",
        price: 1299,
        category: "electronics",
        inStock: true,
        createdAt: "2024-01-10",
        image: "https://images.unsplash.com/photo.jpg",
      },
    ],
    total: 1,
  };

  const schema = generateUISchema(config, apiResponse);

  console.log("═══ Example 2: Explicit + Inferred Fields ═══");
  schema.fields.forEach((f: UISchemaField) => {
    console.log(
      `  ${f.name}: source=${f._source}, component=${f.component}, ` +
        `filter=${f.filter}, required=${f.required}`
    );
  });
  console.log();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example 3: Custom schema plugin
// ═══════════════════════════════════════════════════════════════════════════════

export function example3_withPlugin() {
  // Clear any previous registrations
  clearSchemaPlugins();

  // Register a plugin that adds "currency" formatting to price fields
  const currencyPlugin: SchemaPlugin = {
    name: "currency-formatter",
    priority: 50,
    transformFields: (fields: UISchemaField[]) =>
      fields.map((f: UISchemaField) => {
        if (f.name.toLowerCase().includes("price") || f.name.toLowerCase().includes("total")) {
          return {
            ...f,
            format: (v: unknown) => `$${Number(v).toFixed(2)}`,
            description: "Currency value (USD)",
          };
        }
        return f;
      }),
  };

  registerSchemaPlugin(currencyPlugin);

  const config: ResourceConfig = {
    name: "orders",
    endpoint: "/api/orders",
  };

  const apiResponse = {
    data: [
      {
        id: 1,
        customer: "Alice Johnson",
        total: 1548.5,
        status: "completed",
        createdAt: "2024-03-01",
      },
      {
        id: 2,
        customer: "Bob Smith",
        total: 249.99,
        status: "pending",
        createdAt: "2024-03-05",
      },
    ],
    total: 2,
  };

  const schema = generateUISchema(config, apiResponse);

  console.log("═══ Example 3: Schema Plugin ═══");
  schema.fields.forEach((f: UISchemaField) => {
    const extra = f.format ? ` → formatted: ${f.format(1234.5)}` : "";
    console.log(`  ${f.name}: component=${f.component}${extra}`);
  });
  console.log();

  // Clean up
  clearSchemaPlugins();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example 4: Custom component mapper
// ═══════════════════════════════════════════════════════════════════════════════

export function example4_customComponentMapper() {
  clearComponentMappers();

  // Register a mapper that uses "StarRating" for fields named "rating"
  registerComponentMapper((field) => {
    if (field.name === "rating") {
      return { component: "StarRating", filter: "range" };
    }
    return null;
  });

  const config: ResourceConfig = {
    name: "reviews",
    endpoint: "/api/reviews",
  };

  const apiResponse = [
    { id: 1, title: "Great product!", rating: 5, body: "Loved it.", createdAt: "2024-01-10" },
    { id: 2, title: "Okay", rating: 3, body: "It's fine.", createdAt: "2024-02-15" },
  ];

  const schema = generateUISchema(config, apiResponse);

  console.log("═══ Example 4: Custom Component Mapper ═══");
  schema.fields.forEach((f: UISchemaField) => {
    console.log(`  ${f.name}: component=${f.component}, filter=${f.filter}`);
  });
  console.log();

  clearComponentMappers();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example 5: Schema with no API data (config-only)
// ═══════════════════════════════════════════════════════════════════════════════

export function example5_configOnly() {
  const config: ResourceConfig = {
    name: "users",
    endpoint: "/api/users",
    primaryKey: "id",
    fields: [
      { name: "id", type: "integer" },
      { name: "name", type: "string", required: true },
      { name: "email", type: "email", required: true },
      {
        name: "role",
        type: "enum",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Editor", value: "editor" },
          { label: "Viewer", value: "viewer" },
        ],
      },
      { name: "active", type: "boolean" },
      { name: "createdAt", type: "date" },
    ],
  };

  // No API response — schema is built entirely from config
  const schema = generateUISchema(config);

  console.log("═══ Example 5: Config-Only Schema ═══");
  schema.fields.forEach((f: UISchemaField) => {
    console.log(
      `  ${f.name}: type=${f.type}, component=${f.component}, source=${f._source}`
    );
  });
  console.log();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example 6: Per-call plugins (not registered globally)
// ═══════════════════════════════════════════════════════════════════════════════

export function example6_perCallPlugins() {
  // A plugin that marks all fields as read-only (view-only mode)
  const readOnlyPlugin: SchemaPlugin = {
    name: "read-only-mode",
    transformFields: (fields: UISchemaField[]) =>
      fields.map((f: UISchemaField) => ({
        ...f,
        showInCreate: false,
        showInEdit: false,
      })),
  };

  // A plugin that attaches resource-level metadata
  const metadataPlugin: SchemaPlugin = {
    name: "metadata",
    transformSchema: (schema) => ({
      ...schema,
      meta: {
        ...schema.meta,
        viewMode: "read-only",
        generatedBy: "example6",
      },
    }),
  };

  const config: ResourceConfig = {
    name: "audit-log",
    endpoint: "/api/audit",
  };

  const apiResponse = {
    data: [
      { id: 1, action: "login", userId: 42, ip: "192.168.1.1", timestamp: "2024-03-01T10:30:00Z" },
      { id: 2, action: "update", userId: 42, ip: "192.168.1.1", timestamp: "2024-03-01T10:35:00Z" },
    ],
    total: 2,
  };

  const schema = generateUISchema(config, apiResponse, {
    plugins: [readOnlyPlugin, metadataPlugin],
  });

  console.log("═══ Example 6: Per-Call Plugins ═══");
  console.log(`Meta:`, schema.meta);
  schema.fields.forEach((f: UISchemaField) => {
    console.log(
      `  ${f.name}: showInCreate=${f.showInCreate}, showInEdit=${f.showInEdit}`
    );
  });
  console.log();

  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Run all examples
// ═══════════════════════════════════════════════════════════════════════════════

export function runAllExamples() {
  example1_fullyInferred();
  example2_withOverrides();
  example3_withPlugin();
  example4_customComponentMapper();
  example5_configOnly();
  example6_perCallPlugins();
}
