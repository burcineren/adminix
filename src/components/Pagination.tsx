import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/ui/Button";
import { Select } from "@/ui/Select";
import { cn } from "@/utils/cn";
import { useI18n } from "@/core/i18n";

interface PaginationProps {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
    page,
    pageSize,
    total,
    totalPages,
    pageSizeOptions = [10, 25, 50, 100],
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const { t } = useI18n();
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const pageSizeOpts = pageSizeOptions.map((s) => ({ label: `${s} / ${t.common.per_page}`, value: s }));

    // Generate page buttons (at most 7)
    const pages = generatePageRange(page, totalPages);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[hsl(var(--border))]">
            {/* Left: count */}
            <p className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                {total > 0 ? (
                    <>
                        {t.common.showing} <span className="font-medium text-[hsl(var(--foreground))]">{start}–{end}</span> {t.common.of}{" "}
                        <span className="font-medium text-[hsl(var(--foreground))]">{total}</span> {t.common.results}
                    </>
                ) : (
                    t.common.no_results
                )}
            </p>

            {/* Right: page size + navigation */}
            <div className="flex items-center gap-3">
                <div className="w-[140px]">
                    <Select
                        options={pageSizeOpts}
                        value={pageSize}
                        onChange={(v) => onPageSizeChange(Number(v))}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(1)}
                        disabled={page <= 1}
                        className="h-8 w-8"
                        title={t.common.first_page}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="h-8 w-8"
                        title={t.common.prev_page}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pages.map((p, i) =>
                        p === "..." ? (
                            <span key={`ellipsis-${i}`} className="px-1.5 text-[hsl(var(--muted-foreground))]">…</span>
                        ) : (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onPageChange(p as number)}
                                className={cn("h-8 w-8", p === page && "pointer-events-none")}
                            >
                                {p}
                            </Button>
                        )
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="h-8 w-8"
                        title={t.common.next_page}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(totalPages)}
                        disabled={page >= totalPages}
                        className="h-8 w-8"
                        title={t.common.last_page}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function generatePageRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
}
