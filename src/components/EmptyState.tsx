import type { ComponentType } from "react";
import { cn } from "@/utils/cn";
import { Inbox } from "lucide-react";
import { Button } from "@/ui/Button";

interface EmptyStateProps {
    icon?: ComponentType<{ className?: string }>;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

/**
 * A reusable empty state component for tables and views.
 */
export function EmptyState({
    icon: Icon = Inbox,
    title = "No data found",
    description = "There are no records to display at this time.",
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500",
            className
        )}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] mb-4">
                <Icon className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-50" />
            </div>
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-4">{description}</p>
            {actionLabel && onAction && (
                <Button variant="outline" size="sm" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
