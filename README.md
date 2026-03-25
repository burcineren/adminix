# 🚀 AutoAdmin

> **Build a full Admin Panel from your API in 30 seconds.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)

AutoAdmin is a React library that generates production-ready admin interfaces from your REST API. Zero boilerplate, full TypeScript, endlessly extensible.

<!-- TODO: Add a demo GIF here -->
<!-- ![AutoAdmin Demo](./docs/demo.gif) -->

---

## ✨ Features

- **Zero Config** — Point to any REST endpoint. AutoAdmin infers the schema and renders a full CRUD interface.
- **Schema Driven** — Define fields with types, validation, and custom renderers. Full TypeScript autocomplete.
- **Plugin System** — Extend the UI with custom widgets, field types, and mutation hooks. Fully composable.
- **Export to ZIP** — Generate a clean, production-ready React project from any schema.
- **Interactive Playground** — Edit schemas in real-time with Zod validation and live preview.
- **Dark Mode** — Beautiful, consistent theming with automatic dark mode via CSS variables.
- **Permissions** — Control create, edit, delete, and export per resource with a simple config.
- **i18n Ready** — Built-in internationalization support.

---

## 📦 Installation

```bash
npm install auto-admin
```

---

## 🚀 Quick Start

### Zero-Config Mode

```tsx
import { AdminPanel } from 'auto-admin';

export default function App() {
  return <AdminPanel endpoint="/api/products" />;
}
```

### Schema-Driven Mode

```tsx
import { AdminPanel } from 'auto-admin';

const resources = [
  {
    name: 'users',
    endpoint: '/api/users',
    label: 'User Directory',
    fields: [
      { name: 'id', type: 'number', sortable: true },
      { name: 'name', type: 'string', required: true, searchable: true },
      { name: 'email', type: 'string', required: true },
      { name: 'role', type: 'select', filter: 'select', options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ]},
      { name: 'active', type: 'boolean', filter: 'boolean' },
    ],
    permissions: { create: true, edit: true, delete: true },
  },
];

export default function App() {
  return <AdminPanel resources={resources} title="My Admin" />;
}
```

### Multi-Resource Mode

```tsx
<AdminPanel
  resources={[usersResource, productsResource, ordersResource]}
  title="Corporate Admin"
  defaultDarkMode={true}
/>
```

---

## 🧩 Plugin System

```tsx
import { chartsPlugin, analyticsPlugin } from 'auto-admin/plugins';

<AdminPanel
  resources={resources}
  plugins={[chartsPlugin(), analyticsPlugin()]}
/>
```

---

## 📖 Documentation

View the full documentation by running the dev server:

```bash
npm run dev
```

Then click the **Documentation** tab in the navigation bar.

---

## 🛠 Development

```bash
git clone https://github.com/burcineren/auto-admin.git
cd auto-admin
npm install
npm run dev
```

### Build the library

```bash
npm run build:lib
```

---

## 📁 Project Structure

```
src/
├── components/      # UI components (AdminPanel, DataTable, etc.)
├── core/            # Store, i18n, schema engine
│   └── schema/      # Inferrer, parser, mapper, plugins
├── hooks/           # React hooks (useResource, useCrudActions, etc.)
├── plugins/         # Example plugins (charts, analytics, badges)
├── types/           # TypeScript type definitions
├── ui/              # Primitive UI components (Button, Modal, etc.)
├── utils/           # Utilities (code-generator, zip-exporter, etc.)
├── demo/            # Demo application (DemoRunner, LandingPage, etc.)
└── index.ts         # Public API exports
```

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.
