import { Badge } from "@/ui/Misc";
import { Info, BarChart2 } from "lucide-react";
import type { AdminixPlugin } from "@/types/resource-types";

/**
 * A simple stats plugin that shows total count as a badge above the table
 */
export const statsPlugin = (): AdminixPlugin => ({
    name: "stats",
    tableHeader: ({ resource }) => {
        // Note: In a real app, this would probably come from useResource total
        return (
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1 px-2 py-1">
                    <Info className="h-3 w-3" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {resource.name} Insights
                    </span>
                </Badge>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                    <BarChart2 className="h-3 w-3" />
                    Live data visualization enabled
                </div>
            </div>
        );
    }
});

/**
 * A sidebar widget plugin that shows a decorative banner
 */
export const bannerPlugin = (): AdminixPlugin => ({
    name: "banner",
    sidebarWidget: () => (
        <div className="mx-2 mt-4 p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(221deg_83%_70%)] text-white overflow-hidden relative group">
            <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Adminix Pro</p>
                <p className="text-xs font-semibold leading-snug">
                    Upgrade to unlock advanced analytics & exports.
                </p>
                <button className="mt-2 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors w-full">
                    Learn More
                </button>
            </div>
            <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
        </div>
    )
});
