import { Card, CardContent, CardHeader } from "@/ui/Misc";
import { Fragment } from "react";
import {
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Database
} from "lucide-react";
import { cn } from "@/utils/cn";

import type { ComponentType } from "react";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</h3>
                <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                    {trend && (
                        <span className={cn(
                            "flex items-center text-xs font-semibold",
                            trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {trend.value}
                        </span>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

import { useI18n } from "@/core/i18n";
import { useAdminStore } from "@/core/store";

export function Dashboard() {
    const { t } = useI18n();
    const { resources, plugins: globalPlugins } = useAdminStore();
    
    // Collect all plugins
    const allPlugins = [
        ...(globalPlugins ?? []),
        ...resources.flatMap(r => r.plugins ?? [])
    ];
    
    const dashboardWidgets = allPlugins.filter(p => p.dashboardWidget || (p.dashboardWidgets && p.dashboardWidgets.length > 0));

    return (
        <div className="flex flex-col gap-6 p-6 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">{t.common.dashboard}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {t.common.welcome}! Here's what's happening across your resources today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value="$45,231.89"
                    description="from last month"
                    icon={TrendingUp}
                    trend={{ value: "+20.1%", isPositive: true }}
                />
                <StatCard
                    title="Total Users"
                    value="+2,350"
                    description="from last month"
                    icon={Users}
                    trend={{ value: "+180.1%", isPositive: true }}
                />
                <StatCard
                    title="Total Orders"
                    value="+12,234"
                    description="from last month"
                    icon={ShoppingCart}
                    trend={{ value: "+19%", isPositive: true }}
                />
                <StatCard
                    title="Active Products"
                    value="573"
                    description="currently in catalog"
                    icon={Package}
                    trend={{ value: "-4%", isPositive: false }}
                />
            </div>

            <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight">Explore Resources</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((res) => {
                    const Icon = res.icon ?? Database;
                    return (
                        <Card 
                            key={res.name} 
                            className="group cursor-pointer hover:border-[hsl(var(--primary))] transition-all hover:shadow-lg active:scale-[0.98]"
                            onClick={() => useAdminStore.getState().setActiveResource(res.name)}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-lg">{res.label ?? res.name}</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-1">
                                        {res.description ?? `Manage your ${res.name.toLowerCase()} records`}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                                    {res.fields?.length ?? 0} fields configured
                                </span>
                                <div className="flex items-center gap-1 text-[hsl(var(--primary))] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Resource <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <h3 className="text-sm font-semibold">Overview</h3>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm border-t border-dashed border-[hsl(var(--border))] m-4 rounded-lg bg-[hsl(var(--muted)/0.2)]">
                        <div className="flex flex-col items-center gap-2">
                            <TrendingUp className="h-8 w-8 opacity-20" />
                            <p>Chart coming soon with Chart.js plugin...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <h3 className="text-sm font-semibold">Recent Activity</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { user: "Alice Johnson", action: "created a new product", time: "2 mins ago" },
                                { user: "Bob Smith", action: "modified order #5432", time: "15 mins ago" },
                                { user: "System", action: "automatic backup completed", time: "1 hour ago" },
                                { user: "Dave Brown", action: "deleted a user record", time: "3 hours ago" },
                                { user: "Eve Davis", action: "updated price for Standing Desk", time: "5 hours ago" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-[hsl(var(--muted))]">
                                        <Clock className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm">
                                            <span className="font-semibold">{item.user}</span> {item.action}
                                        </p>
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plugin Dashboard Widgets */}
            {dashboardWidgets.length > 0 && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {dashboardWidgets.map((p, i) => (
                        <Fragment key={i}>
                            {p.dashboardWidget && <p.dashboardWidget />}
                            {p.dashboardWidgets?.map((Widget, j) => (
                                <Widget key={j} />
                            ))}
                        </Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
