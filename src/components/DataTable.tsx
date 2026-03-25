import { useState, Fragment } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    flexRender,
    type SortingState,
    type VisibilityState,
    type RowSelectionState,
    type ExpandedState,
} from "@tanstack/react-table";
import {
    Eye,
    Settings2,
} from "lucide-react";
import type { ResourceDefinition } from "@/types/resource-types";
import type { UISchemaField } from "@/core/schema/types";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { Skeleton } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { useTableColumns } from "@/hooks/useTableColumns";
import { Pagination } from "@/components/Pagination";
import { BulkActions } from "@/components/BulkActions";
import type { UsePaginationReturn } from "@/hooks/usePagination";

interface DataTableProps {
    resource: ResourceDefinition;
    fields: UISchemaField[];
    data: Record<string, unknown>[];
    loading?: boolean;
    onEdit?: (row: Record<string, unknown>) => void;
    onDelete?: (row: Record<string, unknown>) => void;
    onRowSelectionChange?: (rows: Record<string, unknown>[]) => void;
    serverSorting?: boolean;
    onSortChange?: (field: string, direction: "asc" | "desc") => void;
    pagination?: UsePaginationReturn;
    onBulkDelete?: () => void;
    onBulkExport?: () => void;
    isBulkDeleting?: boolean;
}

export function DataTable({
    resource,
    fields,
    data,
    loading,
    onEdit,
    onDelete,
    onRowSelectionChange,
    serverSorting,
    onSortChange,
    pagination,
    onBulkDelete,
    onBulkExport,
    isBulkDeleting,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const columns = useTableColumns({
        resource,
        fields,
        onEdit,
        onDelete,
        serverSorting,
        onSortChange,
    });

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, expanded },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: (updater) => {
            setRowSelection((prev) => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                if (onRowSelectionChange) {
                    const selectedData = Object.keys(next)
                        .filter((k) => next[k])
                        .map((k) => data[parseInt(k)])
                        .filter(Boolean);
                    onRowSelectionChange(selectedData);
                }
                return next;
            });
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: true,
        manualSorting: serverSorting,
        enableRowSelection: resource.permissions?.bulkDelete !== false,
        getRowCanExpand: () => !!resource.expandable,
    });

    const hiddenCount = Object.values(columnVisibility).filter((v) => !v).length;
    const selectedRowsCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

    return (
        <div className="animate-fade-in">
            {/* Header / Bulk Actions */}
            <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))]">
                <div className="flex-1">
                    {selectedRowsCount > 0 && (
                        <BulkActions
                            selectedCount={selectedRowsCount}
                            onBulkDelete={onBulkDelete}
                            onBulkExport={onBulkExport}
                            loading={isBulkDeleting}
                            canDelete={resource.permissions?.delete !== false}
                            canExport={resource.exportable !== false}
                        />
                    )}
                </div>
                <Dropdown
                    trigger={
                        <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
                            <Settings2 className="h-3.5 w-3.5" />
                            Columns
                            {hiddenCount > 0 && (
                                <span className="ml-1 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-1.5 py-0.5 text-xs leading-none">
                                    {hiddenCount}
                                </span>
                            )}
                        </Button>
                    }
                    items={table
                        .getAllColumns()
                        .filter((col) => col.getCanHide())
                        .map((col) => {
                            const field = fields.find(f => f.name === col.id);
                            return {
                                label: field?.label || col.id,
                                onClick: () => col.toggleVisibility(),
                                icon: col.getIsVisible() ? <Eye className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 opacity-30" />,
                            };
                        })}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="whitespace-nowrap px-4 py-3 text-left text-[hsl(var(--muted-foreground))] first:pl-4"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b border-[hsl(var(--border))]">
                                    {(columns.length > 2 ? columns : Array.from({ length: 5 })).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-16 text-center text-[hsl(var(--muted-foreground))]"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Eye className="h-10 w-10 opacity-10" />
                                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">No records found</p>
                                        <p className="text-xs">Try adjusting your filters or search term</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <tr
                                        data-selected={row.getIsSelected()}
                                        className={cn(
                                            "border-b border-[hsl(var(--border))] transition-colors",
                                            "hover:bg-[hsl(var(--muted)/0.4)]",
                                            row.getIsSelected() && "bg-[hsl(var(--primary)/0.05)]"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.getIsExpanded() && (
                                        <tr className="bg-[hsl(var(--muted)/0.2)]">
                                            <td colSpan={columns.length} className="px-4 py-6">
                                                {resource.expandedComponent ? (
                                                    <resource.expandedComponent data={row.original} />
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-slide-in">
                                                        {fields.map((f) => (
                                                            <div key={f.name}>
                                                                <p className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--muted-foreground))] mb-1">
                                                                    {f.label}
                                                                </p>
                                                                <div className="text-sm text-[hsl(var(--foreground))]">
                                                                    {row.getValue(f.name) !== undefined ? String(row.getValue(f.name)) : <span className="opacity-30">—</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Implementation */}
            {pagination && (
                <Pagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    totalPages={pagination.totalPages}
                    pageSizeOptions={resource.pagination?.pageSizeOptions}
                    onPageChange={pagination.goToPage}
                    onPageSizeChange={pagination.changePageSize}
                />
            )}
        </div>
    );
}

