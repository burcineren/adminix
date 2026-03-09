import { useCallback, useEffect, useState } from "react";
import { Plus, Filter, RefreshCw, Download } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { useFilters } from "@/hooks/useFilters";
import { usePagination } from "@/hooks/usePagination";
import { useAdminStore } from "@/core/store";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { BulkActions } from "@/components/BulkActions";
import { CreateModal } from "@/components/CreateModal";
import { EditModal } from "@/components/EditModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";
import type { ResourceDefinition } from "@/types/resource-types";
import { cn } from "@/utils/cn";

interface ResourceViewProps {
    resource: ResourceDefinition;
}

export function ResourceView({ resource }: ResourceViewProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState(resource.defaultSort?.field ?? "");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(resource.defaultSort?.direction ?? "asc");

    const {
        page,
        pageSize,
        total,
        totalPages,
        setTotal,
        goToPage,
        changePageSize,
    } = usePagination(resource.pagination?.defaultPageSize ?? 10);

    const { filters, search, setSearch, setFilter, clearFilters, hasActiveFilters, filterableFields } =
        useFilters(resource.fields);

    const queryParams = {
        page,
        pageSize,
        search: search || undefined,
        sort: sortField || undefined,
        order: sortField ? sortOrder : undefined,
        filters,
    };

    const {
        listQuery,
        createMutation,
        updateMutation,
        deleteMutation,
        bulkDeleteMutation,
        pk,
    } = useResource(resource, queryParams);

    const {
        createModalOpen,
        editModalOpen,
        deleteDialogOpen,
        editingRow,
        deletingRow,
        selectedRows,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        openDeleteDialog,
        closeDeleteDialog,
        setSelectedRows,
        clearSelectedRows,
    } = useAdminStore();

    // Sync total count
    useEffect(() => {
        if (listQuery.data?.total !== undefined) {
            setTotal(listQuery.data.total);
        }
    }, [listQuery.data?.total, setTotal]);

    const permissions = resource.permissions ?? {};
    const data = listQuery.data?.data ?? [];
    const label = resource.label ?? resource.name;

    const handleCreate = useCallback(
        async (formData: Record<string, unknown>) => {
            await createMutation.mutateAsync(formData);
        },
        [createMutation]
    );

    const handleUpdate = useCallback(
        async (formData: Record<string, unknown>) => {
            if (!editingRow) return;
            await updateMutation.mutateAsync({ id: editingRow[pk], data: formData });
        },
        [updateMutation, editingRow, pk]
    );

    const handleDelete = useCallback(async () => {
        if (!deletingRow) return;
        await deleteMutation.mutateAsync(deletingRow[pk]);
    }, [deleteMutation, deletingRow, pk]);

    const handleBulkDelete = useCallback(async () => {
        const ids = selectedRows.map((r) => r[pk]);
        await bulkDeleteMutation.mutateAsync(ids);
        clearSelectedRows();
    }, [bulkDeleteMutation, selectedRows, pk, clearSelectedRows]);

    const handleExport = useCallback(() => {
        const rows = selectedRows.length > 0 ? selectedRows : data;
        if (rows.length === 0) return;
        const headers = resource.fields.map((f) => f.name).join(",");
        const csvRows = rows.map((row) =>
            resource.fields
                .map((f) => {
                    const val = row[f.name];
                    const str = val === null || val === undefined ? "" : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(",")
        );
        const csv = [headers, ...csvRows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resource.name}-export.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [data, selectedRows, resource]);

    return (
        <div className="flex flex-col gap-4 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
                    {resource.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                            {resource.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {resource.exportable !== false && permissions.export !== false && (
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            Export
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void listQuery.refetch()}
                        title="Refresh"
                        className={cn(listQuery.isFetching && "animate-spin")}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {filterableFields.length > 0 && (
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters((v) => !v)}
                            className="gap-1.5"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-0.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] w-4 h-4 flex items-center justify-center text-[10px] leading-none">
                                    !
                                </span>
                            )}
                        </Button>
                    )}
                    {permissions.create !== false && (
                        <Button onClick={openCreateModal} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Create {label}
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            {resource.searchable !== false && (
                <SearchBar
                    value={search}
                    onChange={(v) => {
                        setSearch(v);
                        goToPage(1);
                    }}
                    placeholder={`Search ${label.toLowerCase()}…`}
                    className="max-w-sm"
                />
            )}

            {/* Filters */}
            {showFilters && (
                <FilterBar
                    fields={resource.fields}
                    filters={filters}
                    onFilterChange={(name, val) => {
                        setFilter(name, val as never);
                        goToPage(1);
                    }}
                    onClear={() => {
                        clearFilters();
                        goToPage(1);
                    }}
                    hasActiveFilters={hasActiveFilters}
                />
            )}

            {/* Bulk actions */}
            <BulkActions
                selectedCount={selectedRows.length}
                onBulkDelete={
                    permissions.bulkDelete !== false && permissions.delete !== false
                        ? handleBulkDelete
                        : undefined
                }
                onBulkExport={permissions.export !== false ? handleExport : undefined}
                loading={bulkDeleteMutation.isPending}
                canDelete={permissions.bulkDelete !== false && permissions.delete !== false}
                canExport={permissions.export !== false}
            />

            {/* Plugin: table header */}
            {resource.plugins?.map(
                (p, i) =>
                    p.tableHeader && <p.tableHeader key={i} resource={resource} />
            )}

            {/* Table card */}
            <Card className="overflow-hidden">
                <DataTable
                    resource={resource}
                    data={data}
                    loading={listQuery.isLoading || listQuery.isFetching}
                    onEdit={permissions.edit !== false ? openEditModal : undefined}
                    onDelete={permissions.delete !== false ? openDeleteDialog : undefined}
                    onRowSelectionChange={setSelectedRows}
                    serverSorting={resource.pagination?.mode !== "client"}
                    onSortChange={(field, dir) => {
                        setSortField(field);
                        setSortOrder(dir);
                    }}
                />
                <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    totalPages={totalPages || 1}
                    pageSizeOptions={resource.pagination?.pageSizeOptions}
                    onPageChange={goToPage}
                    onPageSizeChange={changePageSize}
                />
            </Card>

            {/* Plugin: table footer */}
            {resource.plugins?.map(
                (p, i) =>
                    p.tableFooter && <p.tableFooter key={i} resource={resource} />
            )}

            {/* Modals */}
            <CreateModal
                open={createModalOpen}
                onClose={closeCreateModal}
                resource={resource}
                onSubmit={handleCreate}
                loading={createMutation.isPending}
            />
            <EditModal
                open={editModalOpen}
                onClose={closeEditModal}
                resource={resource}
                row={editingRow}
                onSubmit={handleUpdate}
                loading={updateMutation.isPending}
            />
            <DeleteDialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
                itemLabel={deletingRow ? `"${String(deletingRow[resource.fields[0]?.name ?? pk] ?? "this record")}"` : "this record"}
            />
        </div>
    );
}
