import React from "react";
import { Trash2, Download } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn } from "@/utils/cn";

interface BulkActionsProps {
    selectedCount: number;
    onBulkDelete?: () => void;
    onBulkExport?: () => void;
    loading?: boolean;
    canDelete?: boolean;
    canExport?: boolean;
}

export function BulkActions({
    selectedCount,
    onBulkDelete,
    onBulkExport,
    loading,
    canDelete = true,
    canExport = true,
}: BulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={cn(
                "flex items-center justify-between rounded-lg border border-[hsl(var(--primary)/0.3)]",
                "bg-[hsl(var(--primary)/0.08)] px-4 py-3 animate-slide-in"
            )}
        >
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                <span className="font-bold text-[hsl(var(--primary))]">{selectedCount}</span>{" "}
                {selectedCount === 1 ? "item" : "items"} selected
            </span>
            <div className="flex items-center gap-2">
                {canExport && onBulkExport && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkExport}
                        className="gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>
                )}
                {canDelete && onBulkDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onBulkDelete}
                        loading={loading}
                        className="gap-1.5"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete selected
                    </Button>
                )}
            </div>
        </div>
    );
}
