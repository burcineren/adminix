# ⚛️ AutoAdmin

**Build a full-featured admin panel from your API in 30 seconds.**

AutoAdmin is a schema-driven, highly extensible "Admin-Panel-as-a-Service" core library for React. It transforms any REST API into a production-ready dashboard with zero configuration, while providing enterprise-grade hooks for deep customization.

---

## 🚀 Key Features

- **⚡ Zero-Config Mode**: Just provide an endpoint, and AutoAdmin will analyze the API response to infer structure, types, and UI widgets automatically.
- **✨ Live Preview System**: A built-in playground where you can edit your resource schema and see UI updates instantly.
- **🛠️ Extensible Schema Engine**: Support for custom field types, validators (Zod), and UI component mapping.
- **📦 Code Export**: Prototype in the playground and export a full, standards-compliant Vite + React project with one click.
- **💎 Premium UI Components**: Built on Shadcn/UI and TanStack Table for a sleek, responsive, and accessible experience.
- **🔋 Batteries Included**: Pagination, filtering, sorting, search, bulk actions, and global CRUD modals.

---

## 🏁 Quick Start

### 1. Installation

```bash
npm install auto-admin
```

### 2. Basic Usage (Zero-Config)

Simply point to your endpoint. AutoAdmin will detect your data structure automatically.

```tsx
import { AdminPanel } from 'auto-admin';
import 'auto-admin/dist/index.css';

function App() {
  return <AdminPanel endpoint="/api/products" />;
}
```

### 3. Professional Mode (Explicit Schema)

Specify exactly how your data should be displayed and edited.

```tsx
const products = {
  name: "products",
  endpoint: "/api/products",
  fields: [
    { name: "name", type: "string", searchable: true, required: true },
    { name: "price", type: "number", filter: "range", sortable: true },
    { name: "category", type: "select", options: [ ... ] },
    { name: "status", type: "boolean", filter: "boolean" }
  ]
};

function App() {
  return <AdminPanel resources={[products]} title="My Dashboard" />;
}
```

---

## 🛠️ API Reference

### `<AdminPanel />` Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `resources` | `ResourceDefinition[]` | (Optional) List of resources to manage. |
| `endpoint` | `string` | (Shorthand) API endpoint for single-resource mode. |
| `fields` | `FieldDefinition[]` | (Shorthand) Field configuration for single-resource mode. |
| `title` | `string` | Dashboard title (Sidebar header). |
| `darkMode` | `boolean` | Toggle dark mode programmatically. |
| `apiConfig` | `ApiConfig` | Global config for base URL, headers, and interceptors. |
| `plugins` | `AdminPlugin[]` | Custom dashboard widgets and row actions. |

### `ResourceDefinition` Options

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Unique identifier (e.g., "products"). |
| `endpoint` | `string` | API path (e.g., "/api/v1/products"). |
| `permissions` | `ResourcePermissions` | Control `create`, `edit`, `delete` access. |
| `primaryKey` | `string` | The ID field (default: "id"). |
| `exportable` | `boolean` | Enable CSV export (default: true). |

---

## 🏗️ Extensibility & Plugins

AutoAdmin allows you to inject custom logic and UI at every level.

```tsx
const myPlugin = {
  name: "Analytics Plugin",
  sidebarWidget: () => <div>Live Visitors: 42</div>,
  rowActions: [
    { label: "Sync", icon: RotateCw, onClick: (row) => syncRow(row) }
  ]
};
```

---

## 🛝 Dev Playground

The package includes a Live Playground component that developers can use to experiment with schemas in real-time.

```tsx
import { DevPlayground } from 'auto-admin';

export default function Sandbox() {
  return <DevPlayground />;
}
```

---

## 📝 License

Released under the **MIT License**.
Built with ❤️ by the AutoAdmin contributors.
