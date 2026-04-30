import { useCallback, useState, useMemo } from "react";
import { Plus, Filter, RefreshCw, Download, AlertCircle, Zap, LayoutGrid, List as ListIcon, BarChart3 } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { useAdminStore } from "@/core/store";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/ui/Button";
import { Card, EmptyState, LoadingScreen } from "@/ui/Misc";
import type { ResourceDefinition } from "@/types/resource-types";
import { cn } from "@/utils/cn";
import { ReportBuilder } from "./reports/ReportBuilder";
import { WidgetGrid } from "./reports/WidgetGrid";
import type { ReportDefinition, ReportWidget } from "@/types/report-types";
import { usePermissions } from "@/hooks/usePermissions";

interface ResourceViewProps {
    resource: ResourceDefinition;
}

export function ResourceView({ resource }: ResourceViewProps) {
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
    const [showFilters, setShowFilters] = useState(false);
    const [isEditingDashboard, setIsEditingDashboard] = useState(false);

    // ── Store & Resource Hook ──────────────────────────────────────────────────
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
        reports,
        addReport,
        updateReport,
        enableReports
    } = useAdminStore();

    const { hasPermission } = usePermissions();

    // Find if there's a specific report for this resource
    const resourceReport = useMemo(() => {
        return reports.find((r: ReportDefinition) => r.id === `resource-report-${resource.name}`);
    }, [reports, resource.name]);

    const handleBulkDelete = useCallback(async () => {
        const ids = selectedRows.map((r: Record<string, unknown>) => r[pk]);
        await crud.bulkRemove(ids);
        clearSelectedRows();
    }, [crud, selectedRows, pk, clearSelectedRows]);

    const handleExport = useCallback(() => {
        const rows = selectedRows.length > 0 ? selectedRows : list.data;
        if (rows.length === 0) return;
        const headers = schema.fields.map((f) => f.name).join(",");
        const csvRows = rows.map((row: Record<string, unknown>) =>
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

    const handleSaveReport = (report: ReportDefinition) => {
        if (resourceReport) {
            updateReport(resourceReport.id, report);
        } else {
            addReport({
                ...report,
                id: `resource-report-${resource.name}`,
                _source: "local"
            });
        }
        setIsEditingDashboard(false);
    };

    return (
        <div className="flex flex-col gap-4 p-6 animate-fade-in text-[hsl(var(--foreground))] min-h-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] shadow-sm">
                           {resource.icon ? <resource.icon className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                        </div>
                        <div>
                           <h1 className="text-2xl font-black tracking-tight leading-none">{label}</h1>
                           {resource.description && (
                                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1.5 opacity-70">
                                    {resource.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-[hsl(var(--muted)/0.3)] rounded-xl border border-[hsl(var(--border))]">
                    <button 
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                            viewMode === "list" 
                                ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm" 
                                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        )}
                    >
                        <ListIcon className="h-3.5 w-3.5" />
                        List View
                    </button>
                    {enableReports && (
                        <button 
                            onClick={() => setViewMode("analytics")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                                viewMode === "analytics" 
                                    ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm" 
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            )}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Analytics
                        </button>
                    )}
                </div>
            </div>

            {viewMode === "list" ? (
                <>
                    <div className="flex items-center gap-2 flex-wrap">
                        {resource.searchable !== false && isSchemaDetected && (
                            <SearchBar
                                value={filters.searchInput}
                                onChange={(v) => {
                                    filters.setSearchInput(v);
                                }}
                                placeholder={`Search ${label.toLowerCase()}…`}
                                className="max-w-sm flex-1"
                            />
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            {resource.exportable !== false && hasPermission(resource, "export") && isSchemaDetected && (
                                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 rounded-xl font-bold">
                                    <Download className="h-3.5 w-3.5" />
                                    Export
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void refetch()}
                                title="Refresh"
                                className={cn(list.isFetching && "animate-spin", "h-9 w-9 rounded-xl")}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            {(filters.filterableFields.length > 0 || !isSchemaDetected) && (
                                <Button
                                    variant={showFilters ? "secondary" : "outline"}
                                    size="sm"
                                    disabled={!isSchemaDetected}
                                    onClick={() => setShowFilters((v) => !v)}
                                    className="gap-1.5 rounded-xl font-bold"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filters
                                </Button>
                            )}
                            {hasPermission(resource, "create") && (
                                <Button onClick={openCreateModal} className="gap-1.5 rounded-xl font-black shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                                    <Plus className="h-4 w-4" />
                                    Create {label}
                                </Button>
                            )}
                        </div>
                    </div>

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

                    {list.isLoading && !isSchemaDetected ? (
                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted)/0.2)]">
                            <LoadingScreen message="Analyzing API Structure..." />
                        </Card>
                    ) : list.isSuccess && list.data.length === 0 && !resource.fields?.length && !isSchemaDetected ? (
                        <Card className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted)/0.05)] py-20">
                            <EmptyState 
                                title="Waiting for Data"
                                description={`${label} currently has no records. Adminix needs at least one record to automatically infer the schema.`}
                                icon={Zap}
                                action={{ label: "Create First Record", onClick: openCreateModal }}
                            />
                        </Card>
                    ) : list.isError ? (
                        <Card className="p-0 border-[hsl(var(--destructive)/0.2)]">
                            <EmptyState 
                                title="Failed to load records"
                                description={list.error?.message || "An error occurred."}
                                icon={AlertCircle}
                                action={{ label: "Retry Connection", onClick: () => void refetch() }}
                            />
                        </Card>
                    ) : (
                        <Card className="overflow-hidden border-none shadow-xl shadow-[hsl(var(--primary)/0.02)] rounded-3xl">
                            <DataTable
                                resource={resource}
                                fields={schema.fields}
                                data={list.data}
                                loading={list.isLoading || list.isFetching}
                                onEdit={hasPermission(resource, "edit") ? openEditModal : undefined}
                                onDelete={hasPermission(resource, "delete") ? openDeleteDialog : undefined}
                                onRowSelectionChange={setSelectedRows}
                                serverSorting={resource.pagination?.mode !== "client"}
                                onSortChange={(field, dir) => { setSort(field, dir); }}
                                pagination={pagination}
                                onBulkDelete={handleBulkDelete}
                                onBulkExport={handleExport}
                                isBulkDeleting={crud.state.isBulkDeleting}
                                onInlineUpdate={crud.update}
                            />
                        </Card>
                    )}
                </>
            ) : (
                <div className="flex flex-col gap-6">
                    {isEditingDashboard ? (
                        <ReportBuilder 
                            defaultResourceName={resource.name}
                            initialReport={resourceReport || {
                                id: `resource-report-${resource.name}`,
                                name: `${label} Analytics`,
                                description: `Automatically generated dashboard for ${label}`,
                                widgets: [],
                                filters: [],
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                _source: "local"
                            }}
                            onSave={handleSaveReport}
                            onCancel={() => setIsEditingDashboard(false)}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] opacity-60 italic">Dashboard Designer</h2>
                                <Button onClick={() => setIsEditingDashboard(true)} variant="outline" className="gap-2 rounded-xl font-black">
                                    <BarChart3 className="h-4 w-4" />
                                    Configure Charts
                                </Button>
                            </div>
                            {resourceReport && resourceReport.widgets.length > 0 ? (
                                <WidgetGrid 
                                    report={resourceReport} 
                                    onLayoutChange={(newLayout) => {
                                        const updatedWidgets: ReportWidget[] = resourceReport.widgets.map(w => {
                                            const layout = (newLayout as unknown as Record<string, unknown>[]).find(l => l.i === w.id);
                                            if (layout) {
                                                return { 
                                                    ...w, 
                                                    layout: { 
                                                        x: layout.x as number, 
                                                        y: layout.y as number, 
                                                        w: layout.w as number, 
                                                        h: layout.h as number, 
                                                        i: layout.i as string 
                                                    } 
                                                };
                                            }
                                            return w;
                                        });
                                        updateReport(resourceReport.id, { widgets: updatedWidgets });
                                    }}
                                />
                            ) : (
                                <Card className="p-20 flex flex-col items-center border-2 border-dashed border-[hsl(var(--border))] rounded-[40px] bg-[hsl(var(--muted)/0.05)]">
                                    <div className="h-16 w-16 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-full flex items-center justify-center mb-6">
                                        <BarChart3 className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">No Charts Configured</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium text-center max-w-sm mb-8">
                                        Use the Designer to add interactive charts and visualize your {label.toLowerCase()} data.
                                    </p>
                                    <Button onClick={() => setIsEditingDashboard(true)} size="lg" className="rounded-2xl px-10 py-6 font-black shadow-xl shadow-[hsl(var(--primary)/0.2)]">
                                        Open Dashboard Designer
                                    </Button>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
