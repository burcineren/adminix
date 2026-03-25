import { useCallback, useState } from "react";
import { Plus, Filter, RefreshCw, Download, Database } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { useAdminStore } from "@/core/store";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";
import type { ResourceDefinition } from "@/types/resource-types";
import { cn } from "@/utils/cn";

interface ResourceViewProps {
    resource: ResourceDefinition;
}

export function ResourceView({ resource }: ResourceViewProps) {
    const [showFilters, setShowFilters] = useState(false);

    // ── All-in-one resource hook ──────────────────────────────────────────────
    const {
        pk,
        label,
        list,
        pagination,
        filters,
        crud,
        schema,
        isSchemaDetected,
        setSort,
        refetch,
    } = useResource(resource);

    const {
        openCreateModal,
        openEditModal,
        openDeleteDialog,
        selectedRows,
        setSelectedRows,
        clearSelectedRows,
    } = useAdminStore();

    const permissions = resource.permissions ?? {};

    const handleBulkDelete = useCallback(async () => {
        const ids = selectedRows.map((r) => r[pk]);
        await crud.bulkRemove(ids);
        clearSelectedRows();
    }, [crud, selectedRows, pk, clearSelectedRows]);

    const handleExport = useCallback(() => {
        const rows = selectedRows.length > 0 ? selectedRows : list.data;
        if (rows.length === 0) return;
        const headers = schema.fields.map((f) => f.name).join(",");
        const csvRows = rows.map((row) =>
            schema.fields
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
    }, [list.data, selectedRows, schema.fields, resource.name]);

    return (
        <div className="flex flex-col gap-4 p-6 animate-fade-in text-[hsl(var(--foreground))]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
                        {list.isLoading && !isSchemaDetected && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Analyzing API
                            </span>
                        )}
                    </div>
                    {resource.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                            {resource.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {resource.exportable !== false && permissions.export !== false && isSchemaDetected && (
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 shadow-sm">
                            <Download className="h-3.5 w-3.5" />
                            Export
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void refetch()}
                        title="Refresh"
                        className={cn(list.isFetching && "animate-spin", "h-9 w-9")}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {(filters.filterableFields.length > 0 || !isSchemaDetected) && (
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="sm"
                            disabled={!isSchemaDetected}
                            onClick={() => setShowFilters((v) => !v)}
                            className="gap-1.5 shadow-sm"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {filters.hasActiveFilters && (
                                <span className="ml-0.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] w-4 h-4 flex items-center justify-center text-[10px] leading-none">
                                    !
                                </span>
                            )}
                        </Button>
                    )}
                    {permissions.create !== false && (
                        <Button onClick={openCreateModal} className="gap-1.5 shadow-md shadow-[hsl(var(--primary)/0.2)]">
                            <Plus className="h-4 w-4" />
                            Create {label}
                        </Button>
                    )}
                </div>
            </div>

            {/* Zero-Config Analysis Placeholder */}
            {list.isLoading && !isSchemaDetected && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted)/0.2)] gap-3 animate-slide-in">
                    <div className="relative">
                        <RefreshCw className="h-10 w-10 text-[hsl(var(--primary))] animate-spin opacity-50" />
                        <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-sm">Schema Detection in Progress</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            AutoAdmin is analyzing your API response to infer structure, data types, and UI components.
                        </p>
                    </div>
                </div>
            )}

            {/* Search */}
            {resource.searchable !== false && isSchemaDetected && (
                <SearchBar
                    value={filters.searchInput}
                    onChange={(v) => {
                        filters.setSearchInput(v);
                    }}
                    placeholder={`Search ${label.toLowerCase()}…`}
                    className="max-w-sm"
                />
            )}

            {/* Filters */}
            {showFilters && (
                <FilterBar
                    fields={schema.fields}
                    filters={filters.filters}
                    onFilterChange={(name, val) => {
                        filters.setFilter(name, val as never);
                    }}
                    onClear={() => {
                        filters.clearFilters();
                    }}
                    hasActiveFilters={filters.hasActiveFilters}
                />
            )}



            {/* Plugin: table header */}
            {resource.plugins?.map(
                (p, i) =>
                    p.tableHeader && <p.tableHeader key={i} resource={resource} />
            )}

            {/* Table card */}
            <Card className="overflow-hidden">
                <DataTable
                    resource={resource}
                    fields={schema.fields}
                    data={list.data}
                    loading={list.isLoading || list.isFetching}
                    onEdit={permissions.edit !== false ? openEditModal : undefined}
                    onDelete={permissions.delete !== false ? openDeleteDialog : undefined}
                    onRowSelectionChange={setSelectedRows}
                    serverSorting={resource.pagination?.mode !== "client"}
                    onSortChange={(field, dir) => {
                        setSort(field, dir);
                    }}
                    pagination={pagination}
                    onBulkDelete={handleBulkDelete}
                    onBulkExport={handleExport}
                    isBulkDeleting={crud.state.isBulkDeleting}
                />
            </Card>

            {/* Plugin: table footer */}
            {resource.plugins?.map(
                (p, i) =>
                    p.tableFooter && <p.tableFooter key={i} resource={resource} />
            )}

        </div>
    );
}
