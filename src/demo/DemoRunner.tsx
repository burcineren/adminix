import { useState } from "react";
import {
    BookOpen,
    Code2,
    LayoutDashboard,
    Boxes,
    Wand2,
    CheckCircle2
} from "lucide-react";
import { AdminPanel } from "@/components/AdminPanel";
import { DevPlayground } from "@/components/DevPlayground";
import { DEMO_RESOURCES } from "./examples";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";
import { cn } from "@/utils/cn";

// ── Types ───────────────────────────────────────────────────────────────────

type DemoMode = "dashboard" | "zero-config" | "playground" | "docs";

// ── Component ─────────────────────────────────────────────────────────────────

export function DemoRunner() {
    const [mode, setMode] = useState<DemoMode>("dashboard");

    return (
        <div className="flex h-screen w-full flex-col bg-[hsl(var(--background))] overflow-hidden">
            {/* Top Navigation (Storybook-style) */}
            <header className="flex h-14 w-full items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
                            <Boxes className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-sm font-black tracking-tighter uppercase italic">AutoAdmin</span>
                            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">v0.1.0 Beta</span>
                        </div>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                        { id: "zero-config", label: "Shorthand", icon: Wand2 },
                        { id: "playground", label: "Playground", icon: Code2 },
                    ].map((item) => (
                        <Button
                            key={item.id}
                            variant={mode === item.id ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "gap-2 h-9 px-4 transition-all duration-200",
                                mode === item.id && "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] font-bold shadow-sm"
                            )}
                            onClick={() => setMode(item.id as DemoMode)}
                        >
                            <item.icon className={cn("h-4 w-4", mode === item.id && "animate-pulse")} />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 h-9 shadow-sm" onClick={() => window.open('https://github.com/google/autoadmin', '_blank')}>
                        <BookOpen className="h-4 w-4" />
                        Documentation
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                {/* 1. Dashboard Mode: Full Resource Registry */}
                {mode === "dashboard" && (
                    <div className="h-full animate-in fade-in duration-500">
                        <AdminPanel
                            resources={DEMO_RESOURCES}
                            title="Corporate Admin"
                            defaultDarkMode={true}
                        />
                    </div>
                )}

                {/* 2. Zero-Config Shorthand Mode */}
                {mode === "zero-config" && (
                    <div className="h-full flex flex-col p-8 overflow-auto animate-in slide-in-from-bottom-4 duration-500 bg-[hsl(var(--muted)/0.1)]">
                        <div className="max-w-4xl mx-auto w-full space-y-8">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Zero-Config Shorthand</h2>
                                <p className="text-[hsl(var(--muted-foreground))] mt-2">
                                    Initialize a full CRUD interface in a single line of code. No fields defined. No schema manual configuration.
                                </p>
                            </div>

                            <Card className="p-6 bg-slate-900 text-slate-100 border-slate-800 font-mono text-xs overflow-x-auto shadow-2xl">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                                    </div>
                                </div>
                                <pre className="text-indigo-300">
                                    {`<AdminPanel endpoint="/api/analytics" />`}
                                </pre>
                            </Card>

                            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Auto-detects structure from JSON response.
                            </div>

                            <div className="h-[600px] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-2xl">
                                <AdminPanel
                                    endpoint="/api/analytics"
                                    name="Inferred Analytics"
                                    title="Shorthand View"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Playground Mode */}
                {mode === "playground" && (
                    <div className="h-full animate-in zoom-in duration-500">
                        <DevPlayground />
                    </div>
                )}
            </main>
        </div>
    );
}
