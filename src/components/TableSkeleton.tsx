import { cn } from "@/utils/cn";
import { Skeleton } from "@/ui/Misc";

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    className?: string;
}

/**
 * An animated skeleton loader that matches the DataTable layout.
 */
export function TableSkeleton({
    columns = 5,
    rows = 6,
    className,
}: TableSkeletonProps) {
    return (
        <div className={cn("w-full animate-in fade-in duration-300", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton
                        key={`h-${i}`}
                        className={cn(
                            "h-4 rounded-md",
                            i === 0 ? "w-8" : "flex-1",
                            i === columns - 1 && "w-20 flex-none"
                        )}
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={`r-${rowIdx}`}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-[hsl(var(--border))]"
                    style={{ animationDelay: `${rowIdx * 60}ms` }}
                >
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={`c-${colIdx}`}
                            className={cn(
                                "h-4 rounded-md",
                                colIdx === 0 ? "w-8" : "flex-1",
                                colIdx === columns - 1 && "w-20 flex-none"
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
