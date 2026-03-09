import "./mock-api";
import { AdminPanel } from "@/components/AdminPanel";
import { createResource } from "@/utils/schema-utils";
import { ShoppingCart, Users, Package, BarChart3 } from "lucide-react";
import { statsPlugin, bannerPlugin } from "@/plugins/standard";

// ── Resource Definitions ───────────────────────────────────────────────────────

const productsResource = createResource({
  name: "products",
  label: "Products",
  description: "Manage your product catalog",
  endpoint: "/api/products",
  icon: Package,
  primaryKey: "id",
  searchable: true,
  filterable: true,
  exportable: true,
  defaultSort: { field: "createdAt", direction: "desc" },
  plugins: [statsPlugin()],
  pagination: {
    mode: "server",
    defaultPageSize: 8,
    pageSizeOptions: [8, 16, 32],
  },
  permissions: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    bulkDelete: true,
  },
  fields: [
    {
      name: "image",
      label: "Image",
      type: "image",
      sortable: false,
      filterable: false,
      showInCreate: false,
      showInEdit: false,
    },
    {
      name: "name",
      label: "Product Name",
      type: "text",
      required: true,
      searchable: true,
      sortable: true,
      filterable: true,
      placeholder: "Enter product name…",
    },
    {
      name: "price",
      label: "Price ($)",
      type: "number",
      required: true,
      sortable: true,
      filterable: true,
      format: (v) => `$${Number(v).toLocaleString()}`,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { label: "Electronics", value: "electronics" },
        { label: "Furniture", value: "furniture" },
        { label: "Stationery", value: "stationery" },
        { label: "Accessories", value: "accessories" },
      ],
    },
    {
      name: "inStock",
      label: "In Stock",
      type: "boolean",
      sortable: true,
      filterable: true,
      defaultValue: true,
    },
    {
      name: "createdAt",
      label: "Created",
      type: "date",
      sortable: true,
      showInCreate: false,
      showInEdit: false,
    },
  ],
});

const usersResource = createResource({
  name: "users",
  label: "Users",
  description: "Manage user accounts and roles",
  endpoint: "/api/users",
  icon: Users,
  primaryKey: "id",
  searchable: true,
  filterable: true,
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      searchable: true,
      sortable: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      searchable: true,
      sortable: true,
      filterable: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
    },
    {
      name: "active",
      label: "Active",
      type: "boolean",
      sortable: true,
      filterable: true,
      defaultValue: true,
    },
    {
      name: "createdAt",
      label: "Joined",
      type: "date",
      sortable: true,
      showInCreate: false,
      showInEdit: false,
    },
  ],
  permissions: {
    create: true,
    edit: true,
    delete: true,
    bulkDelete: true,
    export: true,
  },
});

const ordersResource = createResource({
  name: "orders",
  label: "Orders",
  description: "View and manage customer orders",
  endpoint: "/api/orders",
  icon: ShoppingCart,
  primaryKey: "id",
  searchable: true,
  filterable: true,
  fields: [
    {
      name: "customer",
      label: "Customer",
      type: "text",
      required: true,
      searchable: true,
      sortable: true,
    },
    {
      name: "total",
      label: "Total ($)",
      type: "number",
      required: true,
      sortable: true,
      filterable: true,
      format: (v) => `$${Number(v).toLocaleString()}`,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      render: (value) => {
        const colors: Record<string, string> = {
          pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
          cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        const v = String(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[v] ?? "bg-gray-100 text-gray-800"}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </span>
        );
      },
    },
    {
      name: "createdAt",
      label: "Date",
      type: "date",
      sortable: true,
      showInCreate: false,
      showInEdit: false,
    },
  ],
  permissions: {
    create: true,
    edit: true,
    delete: false,
    export: true,
    bulkDelete: false,
  },
});

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AdminPanel
      title="AutoAdmin"
      logo={
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
      }
      resources={[productsResource, usersResource, ordersResource]}
      plugins={[bannerPlugin()]}
      defaultDarkMode={false}
    />
  );
}
