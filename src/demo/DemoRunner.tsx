import { useState, useEffect, lazy, Suspense } from "react";
import {
    BookOpen,
    Code2,
    LayoutDashboard,
    Boxes,
    Wand2,
    CheckCircle2,
    Home,
    Moon,
    Sun
} from "lucide-react";
import { Adminix } from "@/components/Adminix";
import { useAdminStore } from "@/core/store";
import { useI18n, type Language } from "@/core/i18n";
import { DEMO_RESOURCES } from "./examples";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";
import { cn } from "@/utils/cn";

// ── Lazy-loaded heavy components (Phase 8: Performance) ──────────────────────

const DevPlayground = lazy(() =>
    import("@/components/DevPlayground").then((m) => ({ default: m.DevPlayground }))
);
const Documentation = lazy(() =>
    import("./Documentation").then((m) => ({ default: m.Documentation }))
);
const LandingPage = lazy(() =>
    import("./LandingPage").then((m) => ({ default: m.LandingPage }))
);

// ── Loading fallback ─────────────────────────────────────────────────────────

function LoadingFallback() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 animate-pulse">
                <Boxes className="h-10 w-10 text-[hsl(var(--primary))] opacity-40" />
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Loading...</span>
            </div>
        </div>
    );
}

// ── Types ───────────────────────────────────────────────────────────────────

type DemoMode = "home" | "dashboard" | "zero-config" | "playground" | "docs";

// ── Component ─────────────────────────────────────────────────────────────────

export function DemoRunner() {
    const { language, setLanguage } = useI18n();
    const [mode, setModeState] = useState<DemoMode>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("adminix_demo_mode");
            return (saved as DemoMode) || "home";
        }
        return "home";
    });

    const setMode = (newMode: DemoMode) => {
        setModeState(newMode);
        localStorage.setItem("adminix_demo_mode", newMode);
    };

    const darkMode = useAdminStore((s) => s.darkMode);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <div className="adminix-root flex h-screen w-full flex-col bg-[hsl(var(--background))] overflow-hidden">
            <header className="flex h-14 w-full items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        onClick={() => setMode("home")}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
                            <Boxes className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-sm font-black tracking-tighter uppercase italic">Adminix</span>
                            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">v0.1.0 Beta</span>
                        </div>
                    </button>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { id: "home", label: language === 'tr' ? 'Ana Sayfa' : 'Home', icon: Home },
                        { id: "dashboard", label: language === 'tr' ? 'Panel' : 'Dashboard', icon: LayoutDashboard },
                        { id: "zero-config", label: language === 'tr' ? 'Hızlı Kurulum' : 'Shorthand', icon: Wand2 },
                        { id: "playground", label: language === 'tr' ? 'Oyun Alanı' : 'Playground', icon: Code2 },
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

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-[hsl(var(--muted)/0.5)] rounded-md p-0.5 border border-[hsl(var(--border))]">
                        {[
                            { label: "EN", value: "en" },
                            { label: "TR", value: "tr" },
                        ].map((lang) => (
                            <button
                                key={lang.value}
                                onClick={() => setLanguage(lang.value as Language)}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-bold rounded transition-all",
                                    language === lang.value
                                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 h-9 p-0 rounded-md bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                        onClick={() => useAdminStore.getState().toggleDarkMode()}
                    >
                        {darkMode ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-indigo-400" />
                        )}
                    </Button>
                    <Button
                        variant={mode === "docs" ? "secondary" : "outline"}
                        size="sm"
                        className={cn(
                            "gap-2 h-9 shadow-sm transition-all duration-200",
                            mode === "docs" && "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] font-bold shadow-sm"
                        )}
                        onClick={() => setMode("docs")}
                    >
                        <BookOpen className="h-4 w-4" />
                        {language === 'tr' ? 'Dokümantasyon' : 'Documentation'}
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                <Suspense fallback={<LoadingFallback />}>
                    {/* 0. Landing / Home Page */}
                    {mode === "home" && (
                        <div className="h-full animate-in fade-in duration-500">
                            <LandingPage onNavigate={(m) => setMode(m as DemoMode)} />
                        </div>
                    )}

                    {/* 1. Dashboard Mode: Full Resource Registry */}
                    {mode === "dashboard" && (
                        <div className="h-full animate-in fade-in duration-500">
                            <Adminix
                                resources={DEMO_RESOURCES}
                                title="Corporate Admin"
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
                                        {`<Adminix endpoint="/api/analytics" />`}
                                    </pre>
                                </Card>

                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Auto-detects structure from JSON response.
                                </div>

                                <div className="h-[600px] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-2xl">
                                    <Adminix
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

                    {/* 4. Documentation Mode */}
                    {mode === "docs" && (
                        <div className="h-full animate-in slide-in-from-right-4 duration-500 bg-[hsl(var(--background))]">
                            <Documentation />
                        </div>
                    )}
                </Suspense>
            </main>
        </div>
    );
}
