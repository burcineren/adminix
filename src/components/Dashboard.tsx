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
    Database,
    Zap,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/utils/cn";
import { LineChart } from "@/ui/Chart";
import { useI18n } from "@/core/i18n";
import { useAdminStore } from "@/core/store";

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
    color?: string;
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-[hsl(var(--border)/0.5)] group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] opacity-70">{title}</h3>
                <div className={cn(
                    "p-2.5 rounded-xl transition-colors group-hover:scale-110",
                    "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                )}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tight">{value}</div>
                <div className="flex items-center gap-2 mt-2">
                    {trend && (
                        <span className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                            trend.isPositive 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-rose-500/10 text-rose-500"
                        )}>
                            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {trend.value}
                        </span>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{description}</p>
                </div>
            </CardContent>
            <div className="h-1 w-full bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
    );
}

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
        <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                            {t.common.dashboard}
                            <span className="text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">Live</span>
                        </h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                            {t.common.welcome}! {t.common.performance.toLowerCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value="$45,231"
                    description="last 30 days"
                    icon={TrendingUp}
                    trend={{ value: "+20.1%", isPositive: true }}
                />
                <StatCard
                    title="Active Users"
                    value="2,350"
                    description="real-time"
                    icon={Users}
                    trend={{ value: "+12%", isPositive: true }}
                />
                <StatCard
                    title="Order Volume"
                    value="12,234"
                    description="last week"
                    icon={ShoppingCart}
                    trend={{ value: "+19%", isPositive: true }}
                />
                <StatCard
                    title="Inventory"
                    value="573"
                    description="SKUs in stock"
                    icon={Package}
                    trend={{ value: "-4%", isPositive: false }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Overview Chart */}
                <Card className="lg:col-span-8 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--muted)/0.1)] px-6 py-4">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest">{t.common.performance}</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Visualizing resource growth and traffic</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[10px] font-bold">
                                 <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                 Revenue
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-10 h-[320px]">
                        <LineChart data={[40, 35, 55, 45, 70, 65, 80, 75, 95, 85, 110, 105]} />
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-4 flex flex-col">
                    <CardHeader className="border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--muted)/0.1)] px-6 py-4">
                        <h3 className="text-sm font-black uppercase tracking-widest">{t.common.activity}</h3>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {[
                                { user: "Alice Johnson", action: "created a new product", time: "2 mins ago", icon: Package },
                                { user: "Bob Smith", action: "modified order #5432", time: "15 mins ago", icon: ShoppingCart },
                                { user: "System", action: "automatic backup completed", time: "1 hour ago", icon: Zap },
                                { user: "Dave Brown", action: "deleted a user record", time: "3 hours ago", icon: Users },
                                { user: "Eve Davis", action: "updated price for Standing Desk", time: "5 hours ago", icon: Database },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 group cursor-default">
                                    <div className="mt-1 p-2 rounded-xl bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary)/0.1)] group-hover:text-[hsl(var(--primary))] transition-colors">
                                        <item.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-medium leading-none">
                                            <span className="font-bold text-[hsl(var(--foreground))]">{item.user}</span> 
                                            <span className="text-[hsl(var(--muted-foreground))] ml-1">{item.action}</span>
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <Clock className="h-3 w-3 text-[hsl(var(--muted-foreground)/0.5)]" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-[hsl(var(--muted-foreground)/0.6)]">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access / Resources */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t.common.quick_access}
                    </h2>
                    <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{resources.length} {t.common.resources.toLowerCase()}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {resources.map((res) => {
                        const Icon = res.icon ?? Database;
                        return (
                            <button 
                                key={res.name} 
                                className="group flex flex-col gap-4 p-5 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-lg transition-all text-left active:scale-95"
                                onClick={() => useAdminStore.getState().setActiveResource(res.name)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="p-3 rounded-2xl bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-[hsl(var(--muted-foreground)/0.3)] group-hover:text-[hsl(var(--primary))] transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-base">{res.label ?? res.name}</h3>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium line-clamp-1 opacity-70">
                                        {res.description ?? `${t.common.edit} ${res.name.toLowerCase()} data`}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Plugin Widgets */}
            {dashboardWidgets.length > 0 && (
                <div className="flex flex-col gap-4">
                     <h2 className="text-lg font-black uppercase tracking-widest opacity-80">{t.common.extensions}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {dashboardWidgets.map((p, i) => (
                            <Fragment key={i}>
                                {p.dashboardWidget && <p.dashboardWidget />}
                                {p.dashboardWidgets?.map((Widget, j) => (
                                    <Widget key={j} />
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

