import {
    Users,
    ShoppingCart,
    BarChart3,
    ShieldCheck,
    Zap
} from "lucide-react";
import type { ResourceDefinition } from "@/types/resource-types";

// ── 1. User Management Example ────────────────────────────────────────────────

export const USERS_RESOURCE: ResourceDefinition = {
    name: "users",
    endpoint: "/api/users",
    label: "User Directory",
    description: "Manage system accounts, roles, and status.",
    icon: Users,
    fields: [
        { name: "id", type: "number", sortable: true },
        { name: "name", type: "string", required: true, searchable: true },
        { name: "email", type: "string", required: true, searchable: true },
        {
            name: "role", type: "select", filter: "select", options: [
                { label: "Admin", value: "admin" },
                { label: "Editor", value: "editor" },
                { label: "Viewer", value: "viewer" }
            ]
        },
        { name: "active", type: "boolean", filter: "boolean" },
        { name: "lastLogin", type: "datetime", sortable: true }
    ],
    permissions: {
        create: true,
        edit: true,
        delete: true
    }
};

// ── 2. E-Commerce Example ─────────────────────────────────────────────────────

export const PRODUCTS_RESOURCE: ResourceDefinition = {
    name: "products",
    endpoint: "/api/products",
    label: "Global Inventory",
    description: "Manage product listings, pricing, and stock levels.",
    icon: ShoppingCart,
    fields: [
        { name: "id", type: "number", sortable: true },
        { name: "image", type: "image-url", label: "Thumbnail" },
        { name: "name", type: "string", required: true, searchable: true },
        { name: "price", type: "number", filter: "range", sortable: true },
        { name: "stock", type: "number", filter: "range", sortable: true },
        { name: "inStock", type: "boolean", filter: "boolean" },
        {
            name: "category", type: "select", filter: "select", options: [
                { label: "Electronics", value: "electronics" },
                { label: "Mobile", value: "mobile" },
                { label: "Audio", value: "audio" }
            ]
        }
    ],
    exportable: true,
    expandable: true
};

// ── 3. Zero-Config Example (No fields defined) ────────────────────────────────

export const ZERO_CONFIG_RESOURCE: ResourceDefinition = {
    name: "analytics",
    endpoint: "/api/analytics",
    label: "Smart Analytics",
    description: "This resource uses 'Zero-Config' mode to auto-detect API structure.",
    icon: BarChart3,
    fields: [] // Empty means auto-detect!
};

// ── 4. Plugin Example ─────────────────────────────────────────────────────────

export const PLUGIN_RESOURCE: ResourceDefinition = {
    name: "automation",
    endpoint: "/api/automation",
    label: "Automated Triggers",
    description: "Example of custom dashboard widgets and row actions.",
    icon: Zap,
    fields: [
        { name: "id", type: "number" },
        { name: "name", type: "string", searchable: true },
        {
            name: "status", type: "select", options: [
                { label: "Running", value: "running" },
                { label: "Stopped", value: "stopped" }
            ]
        }
    ],
    rowActions: [
        {
            label: "Force Stop",
            icon: ShieldCheck,
            onClick: (row) => alert(`Stopping automation: ${row.name}`),
            variant: "destructive"
        }
    ],
    plugins: [
        {
            name: "Health Status",
            sidebarWidget: () => (
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                    System Health: 99.9%
                </div>
            )
        }
    ]
};

export const DEMO_RESOURCES = [
    USERS_RESOURCE,
    PRODUCTS_RESOURCE,
    ZERO_CONFIG_RESOURCE,
    PLUGIN_RESOURCE
];
