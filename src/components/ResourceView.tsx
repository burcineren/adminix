import { useCallback, useState } from "react";
import { Plus, Filter, RefreshCw, Download, AlertCircle, Zap } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { useAdminStore } from "@/core/store";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/ui/Button";
import { Card, EmptyState, LoadingScreen } from "@/ui/Misc";
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
                <Card className="flex flex-col items-center justify-center border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted)/0.2)]">
                    <LoadingScreen message="Analyzing API Structure..." />
                    <div className="pb-8 text-center px-6">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Adminix is analyzing your API response to infer structure, data types, and UI components.
                        </p>
                    </div>
                </Card>
            )}

            {/* Zero-Config Empty State (No data yet to infer from) */}
            {list.isSuccess && list.data.length === 0 && !resource.fields?.length && !isSchemaDetected && (
                <Card className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted)/0.05)] py-20">
                    <EmptyState 
                        title="Waiting for Data"
                        description={`${label} currently has no records. Adminix needs at least one record to automatically infer the schema and generate the UI.`}
                        icon={Zap}
                        action={{
                            label: "Create First Record",
                            onClick: openCreateModal,
                        }}
                    />
                    <div className="mt-8 pt-6 border-t border-[hsl(var(--border))/0.5] text-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--muted-foreground))] mb-2 opacity-50">Or define manually</p>
                        <code className="text-[11px] px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
                            {"{ name: '"} {label.toLowerCase()} {"', endpoint: '"} {resource.endpoint} {"', fields: [...] }"}
                        </code>
                    </div>
                </Card>
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

            {/* Main Content State */}
            {list.isError ? (
                <Card className="p-0 border-[hsl(var(--destructive)/0.2)]">
                    <EmptyState 
                        title="Failed to load records"
                        description={list.error?.message || "An error occurred while fetching data from the API."}
                        icon={AlertCircle}
                        action={{
                            label: "Retry Connection",
                            onClick: () => void refetch(),
                        }}
                    />
                </Card>
            ) : (
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
            )}

            {/* Plugin: table footer */}
            {resource.plugins?.map(
                (p, i) =>
                    p.tableFooter && <p.tableFooter key={i} resource={resource} />
            )}

        </div>
    );
}
