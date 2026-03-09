// Public library entry point
export { AdminPanel } from "./components/AdminPanel";
export { createResource } from "./utils/schema-utils";
export { useResource } from "./hooks/useResource";
export { useFilters } from "./hooks/useFilters";
export { usePagination } from "./hooks/usePagination";
export { useAdminStore } from "./core/store";

// Components (for advanced usage)
export { DataTable } from "./components/DataTable";
export { FilterBar } from "./components/FilterBar";
export { SearchBar } from "./components/SearchBar";
export { Pagination } from "./components/Pagination";
export { BulkActions } from "./components/BulkActions";
export { CreateModal } from "./components/CreateModal";
export { EditModal } from "./components/EditModal";
export { DeleteDialog } from "./components/DeleteDialog";
export { ResourceView } from "./components/ResourceView";
export { FormGenerator } from "./components/FormGenerator";

// UI primitives
export { Button } from "./ui/Button";
export { Input, Textarea } from "./ui/Input";
export { Select } from "./ui/Select";
export { Switch, Badge, Card, CardHeader, CardContent, Skeleton, Separator } from "./ui/Misc";
export { Modal } from "./ui/Modal";
export { Dropdown } from "./ui/Dropdown";

// Types
export type {
  ResourceDefinition,
  FieldDefinition,
  FieldType,
  SelectOption,
  ResourcePermissions,
  PaginationConfig,
  ApiConfig,
  AdminPlugin,
  RowAction,
  AdminPanelProps,
} from "./types/resource-types";
