import type { AdminixPlugin } from "@/types/resource-types";

/**
 * Charts Plugin — renders mini SVG bar charts as a dashboard widget.
 * Uses pure SVG, no external chart library required.
 */
export const chartsPlugin = (): AdminixPlugin => ({
    name: "charts",
    dashboardWidgets: [
        () => {
            const data = [35, 60, 45, 80, 55, 70, 90, 65, 75, 50, 85, 40];
            const max = Math.max(...data);
            const barWidth = 20;
            const gap = 4;
            const height = 80;

            return (
                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                            Monthly Trends
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            +12.5%
                        </span>
                    </div>
                    <svg
                        width="100%"
                        height={height}
                        viewBox={`0 0 ${data.length * (barWidth + gap)} ${height}`}
                        className="overflow-visible"
                    >
                        {data.map((val, i) => {
                            const barHeight = (val / max) * (height - 8);
                            return (
                                <g key={i}>
                                    <rect
                                        x={i * (barWidth + gap)}
                                        y={height - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        rx={4}
                                        className="fill-[hsl(var(--primary)/0.7)] hover:fill-[hsl(var(--primary))] transition-colors cursor-pointer"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                    <div className="flex justify-between mt-2 text-[9px] text-[hsl(var(--muted-foreground))]">
                        <span>Jan</span>
                        <span>Jun</span>
                        <span>Dec</span>
                    </div>
                </div>
            );
        },
    ],
});

/**
 * Sparkline Plugin — renders a mini sparkline in the table header.
 */
export const sparklinePlugin = (): AdminixPlugin => ({
    name: "sparkline",
    tableHeader: ({ resource }) => {
        const points = [10, 25, 18, 35, 28, 42, 38, 55, 48, 60, 52, 68];
        const max = Math.max(...points);
        const min = Math.min(...points);
        const w = 160;
        const h = 32;

        const pathData = points
            .map((p, i) => {
                const x = (i / (points.length - 1)) * w;
                const y = h - ((p - min) / (max - min)) * h;
                return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ");

        return (
            <div className="flex items-center gap-3 mb-2 px-1">
                <svg width={w} height={h} className="opacity-60">
                    <path d={pathData} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {resource.label ?? resource.name} Activity
                </span>
            </div>
        );
    },
});
