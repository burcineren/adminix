import { BarChart2, Hash, TrendingUp } from "lucide-react";
import type { AdminPlugin } from "@/types/resource-types";

/**
 * Analytics Widget Plugin — shows aggregate statistics in the table header
 * and a sidebar overview widget.
 */
export const analyticsPlugin = (): AdminPlugin => ({
    name: "analytics",
    tableHeader: ({ resource }) => (
        <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                <Hash className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {resource.fields.length} Fields
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                <BarChart2 className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {resource.fields.filter(f => f.sortable).length} Sortable
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {resource.fields.filter(f => f.searchable).length} Searchable
                </span>
            </div>
        </div>
    ),
    sidebarWidget: () => (
        <div className="mx-2 mt-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
                {[
                    { label: "Active", value: "1.2K", color: "text-emerald-500" },
                    { label: "Pending", value: "83", color: "text-amber-500" },
                    { label: "Errors", value: "3", color: "text-red-500" },
                    { label: "Uptime", value: "99.9%", color: "text-indigo-500" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center">
                        <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[9px] text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    ),
});
