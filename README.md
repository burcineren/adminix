# 🚀 Adminix

> **Build a full Admin Panel & Analytics Dashboard from your API in 30 seconds.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)

Adminix is a zero-config React library that generates production-ready management dashboards and interactive analytics from your REST API instantly. Point to any endpoint, and it auto-detects fields, types, and labels to render a full-featured CRUD interface with integrated data visualization.

## 📺 Live Demo
![Adminix Demo](https://raw.githubusercontent.com/burcineren/adminix/main/docs/demo.gif)
*(Zero-Config inference, Live Schema Editing, and Dashboard Designer in action)*

---

## ✨ Features

- **Zero Config** — Point to any REST endpoint. Adminix infers the schema and renders a full CRUD interface.
- **Reporting & Analytics** — Built-in dashboard system with Line, Bar, Pie, Area charts and KPI widgets.
- **Dashboard Designer** — Drag-and-drop interface for users and developers to build custom analytics views.
- **Resource Analytics** — Every resource automatically gets an "Analytics" tab for context-specific data visualization.
- **Schema Driven** — Define fields with types, validation, and custom renderers. Full TypeScript autocomplete.
- **Plugin System** — Extend the UI with custom widgets, field types, and mutation hooks.
- **Export to ZIP** — Generate a clean, production-ready React project from any schema.
- **Dark Mode** — Beautiful, consistent theming with automatic dark mode support.

---

## 📦 Installation

```bash
npm install adminix
```

---

## 🚀 Quick Start

### Zero-Config Mode

```tsx
import { Adminix } from 'adminix';
import 'adminix/style.css'; // Don't forget the styles!

export default function App() {
  return <Adminix endpoint="/api/products" />;
}
```

### Analytics & Reporting Mode

Enable the built-in reporting engine with a single prop. This adds a global "Reports" section and an "Analytics" tab to each of your resources.

```tsx
import { Adminix } from 'adminix';

const resources = [
  {
    name: 'sales',
    endpoint: '/api/analytics/sales',
    label: 'Global Sales',
    fields: [
      { name: 'date', type: 'string', sortable: true },
      { name: 'amount', type: 'number', sortable: true },
      { name: 'region', type: 'select', options: [...] }
    ]
  }
];

export default function App() {
  return (
    <Adminix 
      resources={resources} 
      enableReports={true} 
      title="Adminix Analytics" 
    />
  );
}
```

---

## 📊 Dashboard Designer

Adminix includes a powerful **Dashboard Designer** that allows you to:
- Create global dashboards for cross-resource overview.
- Add resource-specific charts directly from the resource's "Analytics" tab.
- Choose from multiple chart types: **Line, Bar, Area, Pie, KPI, and Table**.
- Use the **Drag-and-Drop** grid to organize your layout.

---

## 🧩 Plugin System

```tsx
import { chartsPlugin, analyticsPlugin } from 'adminix/plugins';

<Adminix
  resources={resources}
  plugins={[chartsPlugin(), analyticsPlugin()]}
/>
```

---

## 📖 Project Structure

```
src/
├── components/      # UI components (Adminix, DataTable, Reports, etc.)
├── core/            # Store, i18n, schema engine, theme context
├── hooks/           # React hooks (useResource, useFilters, etc.)
├── plugins/         # Extensibility system and builtin plugins
├── types/           # TypeScript type definitions (Report types, Resource types)
├── ui/              # Primitive UI components (Button, Card, Dropdown, etc.)
└── index.ts         # Public API exports
```

---

## 🛠 Geliştirme (Development)

```bash
git clone https://github.com/burcineren/adminix.git
cd adminix
npm install
npm run dev
```

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please check the issues page or open a PR. (Created with ❤️ by Burçin Eren)
