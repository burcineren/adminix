import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    type RowSelectionState,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Settings2,
} from "lucide-react";
import type { FieldDefinition, ResourceDefinition } from "@/types/resource-types";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { Skeleton } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { getTableFields, formatFieldValue } from "@/utils/schema-utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

function Checkbox({
    checked,
    onCheckedChange,
    indeterminate,
}: {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    indeterminate?: boolean;
}) {
    return (
        <CheckboxPrimitive.Root
            checked={indeterminate ? "indeterminate" : checked}
            onCheckedChange={(v) => onCheckedChange?.(v === true)}
            className={cn(
                "h-4 w-4 shrink-0 rounded-sm border border-[hsl(var(--primary))]",
                "ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:text-[hsl(var(--primary-foreground))]"
            )}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                <Check className="h-3 w-3" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

interface DataTableProps {
    resource: ResourceDefinition;
    data: Record<string, unknown>[];
    loading?: boolean;
    onEdit?: (row: Record<string, unknown>) => void;
    onDelete?: (row: Record<string, unknown>) => void;
    onRowSelectionChange?: (rows: Record<string, unknown>[]) => void;
    serverSorting?: boolean;
    onSortChange?: (field: string, direction: "asc" | "desc") => void;
}

export function DataTable({
    resource,
    data,
    loading,
    onEdit,
    onDelete,
    onRowSelectionChange,
    serverSorting,
    onSortChange,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const visibleFields = getTableFields(resource.fields);
    const permissions = resource.permissions ?? {};

    const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
        const cols: ColumnDef<Record<string, unknown>>[] = [];

        // Selection column
        if (permissions.bulkDelete !== false) {
            cols.push({
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected()}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(v)}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            });
        }

        // Field columns
        for (const field of visibleFields) {
            if (field.customColumn) {
                cols.push(field.customColumn);
                continue;
            }
            cols.push({
                id: field.name,
                accessorKey: field.name,
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    return (
                        <button
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                                "transition-colors hover:text-[hsl(var(--foreground))] select-none",
                                field.sortable === false && "cursor-default"
                            )}
                            onClick={
                                field.sortable !== false
                                    ? () => {
                                        column.toggleSorting(isSorted === "asc");
                                        if (serverSorting && onSortChange) {
                                            onSortChange(field.name, isSorted === "asc" ? "desc" : "asc");
                                        }
                                    }
                                    : undefined
                            }
                        >
                            {getFieldLabel(field)}
                            {field.sortable !== false &&
                                (isSorted === "asc" ? (
                                    <ArrowUp className="h-3 w-3" />
                                ) : isSorted === "desc" ? (
                                    <ArrowDown className="h-3 w-3" />
                                ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                                ))}
                        </button>
                    );
                },
                cell: ({ row }) => {
                    const value = row.getValue(field.name);
                    if (field.render) {
                        return field.render(value, row.original) as React.ReactNode;
                    }
                    return renderCellValue(value, field);
                },
                enableSorting: field.sortable !== false,
                enableHiding: true,
            });
        }

        // Actions column
        const showActions =
            permissions.edit !== false ||
            permissions.delete !== false ||
            (resource.rowActions && resource.rowActions.length > 0);

        if (showActions) {
            cols.push({
                id: "actions",
                header: () => <span className="text-xs font-semibold uppercase tracking-wide">Actions</span>,
                cell: ({ row }) => {
                    const dropdownItems = [];

                    if (permissions.edit !== false && onEdit) {
                        dropdownItems.push({
                            label: "Edit",
                            icon: <Pencil className="h-3.5 w-3.5" />,
                            onClick: () => onEdit(row.original),
                        });
                    }
                    for (const action of resource.rowActions ?? []) {
                        if (!action.hidden?.(row.original)) {
                            dropdownItems.push({
                                label: action.label,
                                icon: action.icon ? <action.icon className="h-3.5 w-3.5" /> : undefined,
                                onClick: () => action.onClick(row.original),
                                variant: action.variant,
                            });
                        }
                    }
                    if (permissions.delete !== false && onDelete) {
                        dropdownItems.push({
                            label: "Delete",
                            icon: <Trash2 className="h-3.5 w-3.5" />,
                            onClick: () => onDelete(row.original),
                            variant: "destructive" as const,
                            separator: dropdownItems.length > 0,
                        });
                    }
                    return (
                        <Dropdown
                            trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            }
                            items={dropdownItems}
                        />
                    );
                },
                enableSorting: false,
                enableHiding: false,
                size: 60,
            });
        }

        return cols;
    }, [visibleFields, permissions, onEdit, onDelete, resource.rowActions, serverSorting, onSortChange]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection },
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
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualSorting: serverSorting,
        enableRowSelection: permissions.bulkDelete !== false,
    });

    const hiddenCount = Object.values(columnVisibility).filter((v) => !v).length;

    return (
        <div className="animate-fade-in">
            {/* Column visibility toggle */}
            <div className="flex justify-end p-3 border-b border-[hsl(var(--border))]">
                <Dropdown
                    trigger={
                        <Button variant="outline" size="sm" className="gap-1.5">
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
                        .map((col) => ({
                            label: (col.columnDef.header as string) || col.id,
                            onClick: () => col.toggleVisibility(),
                            icon: col.getIsVisible() ? <Eye className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 opacity-30" />,
                        }))}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
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
                                    {columns.map((_, j) => (
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
                                        <Eye className="h-10 w-10 opacity-20" />
                                        <p className="text-sm font-medium">No records found</p>
                                        <p className="text-xs">Try adjusting your filters or search term</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Cell Value Renderer ────────────────────────────────────────────────────────

function getFieldLabel(field: FieldDefinition): string {
    if (field.label) return field.label;
    return field.name
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\s/, "")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderCellValue(value: unknown, field: FieldDefinition): React.ReactNode {
    if (value === null || value === undefined) {
        return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
    }

    switch (field.type) {
        case "boolean":
            return (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        value
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    )}
                >
                    {value ? "Yes" : "No"}
                </span>
            );
        case "select": {
            const opt = field.options?.find((o) => o.value === value);
            return (
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2 py-0.5 text-xs font-medium">
                    {opt?.label ?? String(value)}
                </span>
            );
        }
        case "image":
            return (
                <img
                    src={String(value)}
                    alt="record"
                    className="h-8 w-8 rounded-md object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/32"; }}
                />
            );
        default:
            return (
                <span className="max-w-[240px] truncate block" title={formatFieldValue(value, field)}>
                    {formatFieldValue(value, field)}
                </span>
            );
    }
}
