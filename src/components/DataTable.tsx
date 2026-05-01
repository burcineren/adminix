import { useState, memo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
    LayoutList,
    Maximize2,
    Minimize2
} from "lucide-react";
import type { ResourceDefinition } from "@/types/resource-types";
import type { UISchemaField } from "@/core/schema/types";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { Skeleton, EmptyState } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { useI18n } from "@/core/i18n";
import { useTableColumns } from "@/hooks/useTableColumns";
import { Pagination } from "@/components/Pagination";
import { BulkActions } from "@/components/BulkActions";
import type { UsePaginationReturn } from "@/hooks/usePagination";
import { usePermissions } from "@/hooks/usePermissions";

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
    onInlineUpdate?: (id: unknown, data: Record<string, unknown>) => void;
}

export const DataTable = memo(function DataTable({
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
    onInlineUpdate,
}: DataTableProps) {
    "use no memo";
    const { language } = useI18n();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [density, setDensity] = useState<"compact" | "standard" | "comfortable">("standard");
    const parentRef = useRef<HTMLDivElement>(null);
    const { hasPermission } = usePermissions();
    const columns = useTableColumns({
        resource,
        fields,
        onEdit,
        onDelete,
        serverSorting,
        onSortChange,
        onInlineUpdate,
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, expanded },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: true,
        manualSorting: serverSorting,
        enableRowSelection: hasPermission(resource, "bulkDelete") && resource.permissions?.bulkDelete !== false,
        getRowCanExpand: () => !!resource.expandable,
    });

    // Sync selection with parent
    useEffect(() => {
        if (onRowSelectionChange) {
            const selectedData = table.getSelectedRowModel().flatRows.map((r) => r.original);
            onRowSelectionChange(selectedData);
        }
    }, [rowSelection, onRowSelectionChange, table]);

    const rowVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => (density === "compact" ? 33 : density === "comfortable" ? 61 : 49),
        overscan: 10,
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
                            canDelete={hasPermission(resource, "delete")}
                            canExport={hasPermission(resource, "export") && resource.exportable !== false}
                        />
                    )}
                </div>
                <Dropdown
                    trigger={
                        <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
                            <Settings2 className="h-3.5 w-3.5" />
                            {language === 'tr' ? 'Sütunlar' : 'Columns'}
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
                
                <Dropdown
                    trigger={
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <LayoutList className="h-4 w-4" />
                        </Button>
                    }
                    items={[
                        { 
                            label: language === 'tr' ? 'Sıkışık' : 'Compact', 
                            onClick: () => setDensity("compact"),
                            icon: <Minimize2 className="h-3.5 w-3.5" />,
                            active: density === "compact"
                        },
                        { 
                            label: language === 'tr' ? 'Standart' : 'Standard', 
                            onClick: () => setDensity("standard"),
                            icon: <LayoutList className="h-3.5 w-3.5" />,
                            active: density === "standard"
                        },
                        { 
                            label: language === 'tr' ? 'Rahat' : 'Comfortable', 
                            onClick: () => setDensity("comfortable"),
                            icon: <Maximize2 className="h-3.5 w-3.5" />,
                            active: density === "comfortable"
                        }
                    ]}
                />
            </div>

            {/* Table Area */}
            <div 
              ref={parentRef} 
              className="overflow-auto max-h-[700px] border-t border-[hsl(var(--border))]"
            >
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-20 bg-[hsl(var(--card))] shadow-[0_1px_0_0_hsl(var(--border))]">
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            "whitespace-nowrap px-4 text-left text-[hsl(var(--muted-foreground))] font-bold uppercase text-[10px] tracking-widest first:pl-6 bg-[hsl(var(--card))]",
                                            density === "compact" ? "py-2" : density === "comfortable" ? "py-5" : "py-4"
                                        )}
                                        style={{ width: header.getSize(), minWidth: header.getSize() }}
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
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-[hsl(var(--border))]">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <>
                                {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                                    <tr>
                                        <td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={columns.length} />
                                    </tr>
                                )}
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const row = table.getRowModel().rows[virtualRow.index];
                                    if (!row) return null;
                                    
                                    return (
                                        <tr
                                            key={row.id}
                                            data-selected={row.getIsSelected()}
                                            className={cn(
                                                "border-b border-[hsl(var(--border))] transition-colors group",
                                                "hover:bg-[hsl(var(--muted)/0.4)]",
                                                row.getIsSelected() && "bg-[hsl(var(--primary)/2%)]"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td 
                                                    key={cell.id} 
                                                    className={cn(
                                                        "px-4 text-sm first:pl-6 truncate",
                                                        density === "compact" ? "py-1.5" : density === "comfortable" ? "py-4.5" : "py-3"
                                                    )}
                                                    style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                                {rowVirtualizer.getVirtualItems().length > 0 && (
                                    rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end > 0 && (
                                        <tr>
                                            <td style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={columns.length} />
                                        </tr>
                                    )
                                )}
                            </>
                        )}
                        {!loading && table.getRowModel().rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="py-12">
                                    <EmptyState 
                                        title={language === 'tr' ? 'Kayıt bulunamadı' : 'No records found'}
                                        description={language === 'tr' 
                                            ? 'Mevcut görünüme uygun veri bulamadık.' 
                                            : "We couldn't find any data matching your current view."}
                                    />
                                </td>
                            </tr>
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
});
