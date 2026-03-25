import { useMemo } from "react";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ResourceDefinition } from "@/types/resource-types";
import type { UISchemaField } from "@/core/schema/types";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { cn } from "@/utils/cn";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

// ── Selection Component ────────────────────────────────────────────────────────

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

// ── Cell Value Renderer ────────────────────────────────────────────────────────

function renderCellValue(value: unknown, field: UISchemaField): React.ReactNode {
    if (value === null || value === undefined) {
        return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
    }

    if (field.format) {
        return <span className="max-w-[240px] truncate block" title={field.format(value)}>{field.format(value)}</span>;
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
        case "enum":
        case "select": {
            const opt = field.options?.find((o) => o.value === value);
            return (
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2 py-0.5 text-xs font-medium">
                    {opt?.label ?? String(value)}
                </span>
            );
        }
        case "image":
        case "image-url":
            return (
                <img
                    src={String(value)}
                    alt="record"
                    className="h-8 w-8 rounded-md object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/32"; }}
                />
            );
        case "date":
        case "datetime":
            return <span className="whitespace-nowrap">{new Date(String(value)).toLocaleDateString()}</span>;
        default:
            return (
                <span className="max-w-[240px] truncate block" title={String(value)}>
                    {String(value)}
                </span>
            );
    }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

interface UseTableColumnsOptions {
    resource: ResourceDefinition;
    fields: UISchemaField[];
    onEdit?: (row: Record<string, unknown>) => void;
    onDelete?: (row: Record<string, unknown>) => void;
    serverSorting?: boolean;
    onSortChange?: (field: string, direction: "asc" | "desc") => void;
}

export function useTableColumns({
    resource,
    fields,
    onEdit,
    onDelete,
    serverSorting,
    onSortChange,
}: UseTableColumnsOptions) {
    const permissions = resource.permissions ?? {};
    const visibleFields = useMemo(() => fields.filter((f) => f.showInTable && !f.hidden), [fields]);

    return useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
        const cols: ColumnDef<Record<string, unknown>>[] = [];

        // 1. Expand column
        if (resource.expandable) {
            cols.push({
                id: "expander",
                header: () => null,
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            row.toggleExpanded();
                        }}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                ),
                size: 40,
            });
        }

        // 2. Selection column
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

        // 3. Field columns
        for (const field of visibleFields) {
            if (field.customColumn) {
                cols.push(field.customColumn as ColumnDef<Record<string, unknown>>);
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
                            {field.label}
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

        // 4. Actions column
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
    }, [visibleFields, permissions, onEdit, onDelete, resource.rowActions, serverSorting, onSortChange, resource.expandable]);
}
