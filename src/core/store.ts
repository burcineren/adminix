import { create } from "zustand";
import type { ResourceDefinition } from "@/types/resource-types";

export interface AdminState {
  // Active resource
  activeResource: string | null;
  setActiveResource: (name: string) => void;

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
}

export const useAdminStore = create<AdminState>((set) => ({
  activeResource: null,
  setActiveResource: (name) => set({ activeResource: name }),

  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setDarkMode: (value) => set({ darkMode: value }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  resources: [],
  setResources: (resources) => set({ resources }),

  createModalOpen: false,
  editModalOpen: false,
  deleteDialogOpen: false,
  editingRow: null,
  deletingRow: null,

  openCreateModal: () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),
  openEditModal: (row) => set({ editModalOpen: true, editingRow: row }),
  closeEditModal: () => set({ editModalOpen: false, editingRow: null }),
  openDeleteDialog: (row) => set({ deleteDialogOpen: true, deletingRow: row }),
  closeDeleteDialog: () => set({ deleteDialogOpen: false, deletingRow: null }),

  selectedRows: [],
  setSelectedRows: (rows) => set({ selectedRows: rows }),
  clearSelectedRows: () => set({ selectedRows: [] }),
}));
