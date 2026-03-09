# AutoAdmin

> **Build a full Admin Panel from your API in 30 seconds.**

[![npm version](https://badge.fury.io/js/auto-admin.svg)](https://badge.fury.io/js/auto-admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

AutoAdmin is a **production-ready open-source library** that automatically generates a complete admin panel UI from an API endpoint or schema — with minimal configuration.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗂️ **Data Table** | Sorting, pagination, column visibility, row selection |
| 📝 **CRUD Forms** | Auto-generated from field schemas with Zod validation |
| 🔍 **Search** | Global search with debounced query parameter |
| 🔎 **Filters** | Type-aware filters (range, select, boolean, date range) |
| 📄 **Pagination** | Server-side & client-side pagination |
| ✏️ **Modals** | Create / Edit / Delete confirmation modals |
| ☑️ **Bulk Actions** | Select rows and perform bulk delete or export |
| 🔐 **Permissions** | Role-based UI control (create/edit/delete per resource) |
| 🌙 **Dark Mode** | Full dark mode support |
| 📦 **Plugins** | Extensible plugin system for custom widgets |
| 📊 **CSV Export** | Export table data or selected rows to CSV |
| 🎨 **Modern UI** | Tailwind + shadcn/ui, glassmorphism, micro-animations |

---

## 🚀 Quick Start

```bash
npm install auto-admin
```

```tsx
import { AdminPanel, createResource } from "auto-admin";
import "auto-admin/dist/index.css";

const products = createResource({
  name: "products",
  endpoint: "/api/products",
  fields: [
    { name: "name",      type: "text",   required: true },
    { name: "price",     type: "number", required: true },
    { name: "category",  type: "select", options: [
      { label: "Electronics", value: "electronics" },
      { label: "Furniture",   value: "furniture" },
    ]},
    { name: "inStock",   type: "boolean" },
    { name: "createdAt", type: "date" },
  ],
});

export default function App() {
  return (
    <AdminPanel
      title="My App"
      resources={[products]}
    />
  );
}
```

**That's it.** AutoAdmin generates everything else automatically.

---

## 📖 API Reference

### `<AdminPanel />`

| Prop | Type | Description |
|------|------|-------------|
| `resources` | `ResourceDefinition[]` | Resources to display in sidebar |
| `title` | `string` | Sidebar title (default: `"AutoAdmin"`) |
| `logo` | `ReactNode` | Custom logo component |
| `defaultDarkMode` | `boolean` | Start in dark mode |
| `apiConfig` | `ApiConfig` | Global API configuration |
| `plugins` | `AdminPlugin[]` | Global plugins |

---

### `createResource(definition)`

Creates a resource definition with sensible defaults.

```ts
createResource({
  name: "products",           // unique identifier
  label: "Products",          // display label
  description: "...",         // shown under heading
  endpoint: "/api/products",  // REST endpoint
  icon: Package,              // Lucide icon component
  primaryKey: "id",           // primary key field (default: "id")
  searchable: true,
  filterable: true,
  exportable: true,
  fields: [...],              // see Field Definition
  permissions: { ... },       // see Permissions
  pagination: { ... },        // see Pagination
  api: { ... },               // see API Config
  rowActions: [...],          // custom row actions
  plugins: [...],             // resource-level plugins
});
```

---

### Field Definition

```ts
{
  name: "fieldName",        // required
  label: "Field Label",     // auto-derived from name if omitted
  type: FieldType,          // see Field Types

  // Visibility
  showInTable: true,
  showInCreate: true,
  showInEdit: true,
  hidden: false,

  // Behavior
  sortable: true,
  filterable: true,
  searchable: true,
  required: false,

  // For select / multiselect
  options: [{ label: "Option", value: "value" }],

  // Custom rendering
  render: (value, row) => <MyComponent />,

  // Validation (Zod schema)
  validation: z.string().min(3),

  // Formatting
  format: (value) => `$${value}`,
}
```

### Field Types

| Type | Form Control | Filter |
|------|-------------|--------|
| `text` | Text input | Search input |
| `number` | Number input | Min/Max range |
| `email` | Email input | Search input |
| `password` | Password input | — |
| `url` | URL input | Search input |
| `textarea` | Textarea | Search input |
| `select` | Dropdown | Select filter |
| `multiselect` | Multi-dropdown | — |
| `boolean` | Toggle switch | Boolean toggle |
| `date` | Date picker | Date range |
| `datetime` | Datetime picker | — |
| `image` | URL input | — (shows thumbnail) |

---

### Permissions

```ts
permissions: {
  create: true,       // show Create button
  edit: true,         // show Edit action
  delete: true,       // show Delete action
  view: true,         // show table
  export: true,       // show Export button
  bulkDelete: true,   // enable bulk delete
}
```

---

### Pagination Config

```ts
pagination: {
  mode: "server",           // "server" | "client"
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
}
```

---

### API Config

```ts
api: {
  baseUrl: "https://api.example.com",
  headers: { "Authorization": "Bearer TOKEN" },
  transformResponse: (data) => ({ data: data.items, total: data.count }),
  endpoints: {
    list: "/products",            // defaults to resource.endpoint
    create: "/products",
    update: "/products",          // /:id is appended automatically
    delete: "/products",          // /:id is appended automatically
    bulkDelete: "/products/bulk-delete",
  },
}
```

---

### Plugin System

Plugins let you extend the admin panel without modifying core code.

```ts
import { chartsPlugin } from "auto-admin/plugins/charts";
import { analyticsPlugin } from "auto-admin/plugins/analytics";

const myPlugin: AdminPlugin = {
  name: "my-plugin",
  // Widget shown in sidebar
  sidebarWidget: () => <MySidebarWidget />,
  // Component injected above the table
  tableHeader: ({ resource }) => <MyBanner resource={resource} />,
  // Extra row action
  rowActions: [{
    label: "Preview",
    icon: Eye,
    onClick: (row) => openPreview(row),
  }],
  // Called after every mutation
  onMutation: (type, data) => analytics.track(type, data),
};

<AdminPanel plugins={[myPlugin, chartsPlugin()]} resources={[...]} />
```

---

### Custom Row Actions

```ts
createResource({
  rowActions: [
    {
      label: "Archive",
      icon: Archive,
      onClick: (row) => archiveItem(row.id),
      hidden: (row) => row.archived === true,
      variant: "default",
    },
    {
      label: "Mark as Paid",
      icon: DollarSign,
      onClick: (row) => markPaid(row.id),
      variant: "destructive",
    },
  ],
})
```

---

## 📁 Project Structure

```
src/
├── core/
│   └── store.ts              # Zustand global state
├── components/
│   ├── AdminPanel.tsx         # Main entry component
│   ├── ResourceView.tsx       # Orchestrates resource UI
│   ├── DataTable.tsx          # TanStack Table
│   ├── FilterBar.tsx          # Auto filter generation
│   ├── SearchBar.tsx         # Global search
│   ├── Pagination.tsx        # Pagination controls
│   ├── BulkActions.tsx       # Bulk selection toolbar
│   ├── FormGenerator.tsx     # Auto form from schema
│   ├── CreateModal.tsx       # Create record modal
│   ├── EditModal.tsx         # Edit record modal
│   ├── DeleteDialog.tsx      # Delete confirmation
│   └── Sidebar.tsx           # Nav + TopBar
├── hooks/
│   ├── useResource.ts        # TanStack Query CRUD
│   ├── useFilters.ts         # Filter state
│   └── usePagination.ts      # Pagination state
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx
│   └── Misc.tsx
├── types/
│   └── resource-types.ts     # All TypeScript types
└── utils/
    ├── cn.ts                 # Tailwind class merge
    ├── request-builder.ts    # API fetch utilities
    └── schema-utils.ts       # Field helpers
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server (demo app)
npm run dev

# Build the library
npm run build:lib

# Lint
npm run lint
```

---

## 🤝 Contributing

Contributions are very welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT © AutoAdmin Contributors
