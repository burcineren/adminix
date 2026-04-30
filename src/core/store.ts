import { create } from "zustand";
import type { ResourceDefinition, AdminixPlugin } from "@/types/resource-types";
import type { ReportDefinition } from "@/types/report-types";
import type { AuthConfig, GlobalPermissions } from "@/types/auth-types";

export interface AdminState {
  // Active resource
  activeResource: string | null;
  setActiveResource: (name: string | null) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Resources registry
  resources: ResourceDefinition[];
  setResources: (resources: ResourceDefinition[]) => void;
  
  // Plugins
  plugins: AdminixPlugin[];
  setPlugins: (plugins: AdminixPlugin[]) => void;

  // Modals
  createModalOpen: boolean;
  editModalOpen: boolean;
  deleteDialogOpen: boolean;
  editingRow: Record<string, unknown> | null;
  deletingRow: Record<string, unknown> | null;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (row: Record<string, unknown>) => void;
  closeEditModal: () => void;
  openDeleteDialog: (row: Record<string, unknown>) => void;
  closeDeleteDialog: () => void;

  // Bulk selection
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  clearSelectedRows: () => void;
  
  // Reports
  reports: ReportDefinition[];
  setReports: (reports: ReportDefinition[]) => void;
  addReport: (report: ReportDefinition) => void;
  updateReport: (id: string, report: Partial<ReportDefinition>) => void;
  removeReport: (id: string) => void;
  enableReports: boolean;
  setEnableReports: (enabled: boolean) => void;

  // Auth & Permissions
  enableAuth: boolean;
  setEnableAuth: (enabled: boolean) => void;
  authConfig?: AuthConfig;
  setAuthConfig: (config?: AuthConfig) => void;
  globalPermissions?: GlobalPermissions;
  setGlobalPermissions: (permissions?: GlobalPermissions) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeResource: typeof window !== "undefined" ? localStorage.getItem("adminix_active_resource") : null,
  setActiveResource: (name: string | null) => {
    if (name) localStorage.setItem("adminix_active_resource", name);
    else localStorage.removeItem("adminix_active_resource");
    set({ activeResource: name });
  },

  darkMode: typeof window !== "undefined" 
    ? (localStorage.getItem("adminix_dark_mode") === "true" || (!localStorage.getItem("adminix_dark_mode") && (window.matchMedia("(prefers-color-scheme: dark)").matches || true)))
    : true,
  toggleDarkMode: () => set((s: AdminState) => {
    const newVal = !s.darkMode;
    localStorage.setItem("adminix_dark_mode", String(newVal));
    return { darkMode: newVal };
  }),
  setDarkMode: (value: boolean) => {
    localStorage.setItem("adminix_dark_mode", String(value));
    set({ darkMode: value });
  },

  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s: AdminState) => ({ sidebarOpen: !s.sidebarOpen })),

  resources: [],
  setResources: (resources: ResourceDefinition[]) => set({ resources }),

  plugins: [],
  setPlugins: (plugins: AdminixPlugin[]) => set({ plugins }),

  createModalOpen: false,
  editModalOpen: false,
  deleteDialogOpen: false,
  editingRow: null,
  deletingRow: null,

  openCreateModal: () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),
  openEditModal: (row: Record<string, unknown>) => set({ editModalOpen: true, editingRow: row }),
  closeEditModal: () => set({ editModalOpen: false, editingRow: null }),
  openDeleteDialog: (row: Record<string, unknown>) => set({ deleteDialogOpen: true, deletingRow: row }),
  closeDeleteDialog: () => set({ deleteDialogOpen: false, deletingRow: null }),

  selectedRows: [],
  setSelectedRows: (rows: Record<string, unknown>[]) => set({ selectedRows: rows }),
  clearSelectedRows: () => set({ selectedRows: [] }),

  // Reports
  reports: typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("adminix_reports") || "[]")
    : [],
  setReports: (reports: ReportDefinition[]) => {
    localStorage.setItem("adminix_reports", JSON.stringify(reports));
    set({ reports });
  },
  addReport: (report: ReportDefinition) => set((s: AdminState) => {
    const newReports = [...s.reports, report];
    localStorage.setItem("adminix_reports", JSON.stringify(newReports));
    return { reports: newReports };
  }),
  updateReport: (id: string, report: Partial<ReportDefinition>) => set((s: AdminState) => {
    const newReports = s.reports.map((r: ReportDefinition) => r.id === id ? { ...r, ...report, updatedAt: new Date().toISOString() } : r);
    localStorage.setItem("adminix_reports", JSON.stringify(newReports));
    return { reports: newReports };
  }),
  removeReport: (id: string) => set((s: AdminState) => {
    const newReports = s.reports.filter((r: ReportDefinition) => r.id !== id);
    localStorage.setItem("adminix_reports", JSON.stringify(newReports));
    return { reports: newReports };
  }),
  enableReports: false,
  setEnableReports: (enabled: boolean) => set({ enableReports: enabled }),

  enableAuth: false,
  setEnableAuth: (enabled: boolean) => set({ enableAuth: enabled }),
  authConfig: undefined,
  setAuthConfig: (config?: AuthConfig) => set({ authConfig: config }),
  globalPermissions: undefined,
  setGlobalPermissions: (permissions?: GlobalPermissions) => set({ globalPermissions: permissions }),
}));
