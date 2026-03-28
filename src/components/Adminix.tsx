import { useEffect, useMemo, useState, memo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAdminStore } from "@/core/store";
import { useI18n } from "@/core/i18n";
import { Sidebar, TopBar } from "@/components/Sidebar";
import { ResourceView } from "@/components/ResourceView";
import { Dashboard } from "@/components/Dashboard";
import { GlobalModalManager } from "@/components/GlobalModalManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateResourceDefinition } from "@/utils/resource-schema";
import type { AdminixProps, ResourceDefinition } from "@/types/resource-types";
import { cn } from "@/utils/cn";
import { LayoutDashboard, Zap, Database, Users, AlertCircle, FileWarning, RotateCcw } from "lucide-react";
import { Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const EMPTY_RESOURCES: ResourceDefinition[] = [];

// ── Inner panel (accesses store) ───────────────────────────────────────────────

const AdminixInner = memo(function AdminixInner({
    resources: propsResources = EMPTY_RESOURCES,
    name,
    endpoint,
    fields,
    permissions,
    label: propLabel,
    title,
    logo,
    plugins,
    defaultDarkMode,
    showDashboard: propShowDashboard,
    onError,
}: AdminixProps) {
    const activeResource = useAdminStore((state) => state.activeResource);
    const setActiveResource = useAdminStore((state) => state.setActiveResource);
    const setResources = useAdminStore((state) => state.setResources);
    const darkMode = useAdminStore((state) => state.darkMode);
    const setDarkMode = useAdminStore((state) => state.setDarkMode);
    const sidebarOpen = useAdminStore((state) => state.sidebarOpen);

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // 1. Normalize resources: Merge explicit array with shorthand props
    const normalizedResources = useMemo<ResourceDefinition[]>(() => {
        const list: ResourceDefinition[] = propsResources ? [...propsResources] : [];

        if (endpoint) {
            const resourceName = name ?? endpoint.split("/").pop() ?? "resource";
            const exists = list.some((r) => r.name === resourceName);

            if (!exists) {
                list.unshift({
                    name: resourceName,
                    endpoint,
                    fields: fields ?? [],
                    permissions,
                    label: propLabel ?? (resourceName.charAt(0).toUpperCase() + resourceName.slice(1)),
                });
            }
        }

        return list;
    }, [propsResources, name, endpoint, fields, permissions, propLabel]);

    // ── Validation Layer (Phase 1: Stability) ────────────────────────────────
    useEffect(() => {
        const errors: string[] = [];
        normalizedResources.forEach((res, idx) => {
            const result = validateResourceDefinition(res);
            if (!result.success) {
                errors.push(`Resource "${res.name || idx}": ${result.errors.join(", ")}`);
            }
        });

        setValidationErrors(errors);
        if (errors.length > 0 && onError) {
            onError(new Error("Schema Validation Failed"));
        }
    }, [normalizedResources, onError]);

    // 2. Determine initial dashboard visibility
    const showDashboard = propShowDashboard ?? normalizedResources.length > 1;

    // ── Synchronization ──────────────────────────────────────────────────────────

    // Sync resources to store
    useEffect(() => {
        if (validationErrors.length === 0) {
            setResources(normalizedResources);
        }
    }, [normalizedResources, setResources, validationErrors.length]);

    // Initial dark mode only
    useEffect(() => {
        if (defaultDarkMode !== undefined) {
            setDarkMode(defaultDarkMode);
        }
    }, [defaultDarkMode, setDarkMode]);

    // Initial navigation
    useEffect(() => {
        if (!activeResource && validationErrors.length === 0) {
            if (showDashboard) {
                setActiveResource("dashboard");
            } else if (normalizedResources.length > 0) {
                setActiveResource(normalizedResources[0]!.name);
            }
        }
    }, [activeResource, normalizedResources, showDashboard, setActiveResource, validationErrors.length]);

    // Sync dark mode class on <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    // ── Error Rendering ──────────────────────────────────────────────────────────
    
    const { t } = useI18n();

    if (validationErrors.length > 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-6 bg-[hsl(var(--background))] animate-in fade-in zoom-in duration-500">
                <Card className="max-w-2xl w-full p-8 border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.02)] shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]">
                            <FileWarning className="h-8 w-8" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight uppercase italic text-[hsl(var(--destructive))]">
                                {t.common.settings === "Ayarlar" ? "Geçersiz Yapılandırma" : "Invalid Configuration"}
                            </h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-md mx-auto">
                                {t.common.settings === "Ayarlar" 
                                    ? "<Adminix> bileşenine sağlanan kaynak şeması düzeltilmesi gereken yapısal hatalar içeriyor." 
                                    : "The resource schema provided to <Adminix> contains structural errors that must be fixed."}
                            </p>
                        </div>

                        <div className="w-full text-left p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] space-y-3">
                            <p className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> {t.common.settings === "Ayarlar" ? "Doğrulama Hataları" : "Validation Issues"} ({validationErrors.length})
                            </p>
                            <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {validationErrors.map((err, i) => (
                                    <li key={i} className="text-xs font-mono text-[hsl(var(--destructive))] bg-white/50 dark:bg-black/20 p-2 rounded-md border-l-2 border-[hsl(var(--destructive))]">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3 w-full pt-4">
                            <Button variant="outline" className="flex-1 font-bold h-11 rounded-xl" onClick={() => window.location.reload()}>
                                <RotateCcw className="mr-2 h-4 w-4" /> {t.common.settings === "Ayarlar" ? "Yenile" : "Refresh"}
                            </Button>
                            <Button className="flex-1 font-bold h-11 rounded-xl shadow-lg shadow-[hsl(var(--primary)/20%)]" onClick={() => window.open("https://github.com/burcineren/adminix/docs", "_blank")}>
                                {t.common.settings === "Ayarlar" ? "Dokümantasyon" : "Documentation"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const currentResource = normalizedResources.find((r) => r.name === activeResource);
    const isDashboard = activeResource === "dashboard";

    return (
        <div className={cn("relative h-full w-full overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]")}>
            {/* Core engine components */}
            <GlobalModalManager />

            <Sidebar
                resources={normalizedResources}
                title={title}
                logo={logo}
                plugins={plugins}
                showDashboard={propShowDashboard}
            />

            <TopBar title={isDashboard ? t.common.dashboard : (currentResource?.label ?? currentResource?.name)} />

            <main
                className={cn(
                    "transition-all duration-300 pt-14",
                    sidebarOpen ? "pl-[260px]" : "pl-0"
                )}
            >
                {isDashboard ? (
                    <Dashboard />
                ) : currentResource ? (
                    <ResourceView key={currentResource.name} resource={currentResource} />
                ) : (
                    <WelcomeScreen />
                )}
            </main>

            <Toaster
                position="bottom-right"
                richColors
                expand
                toastOptions={{
                    duration: 4000,
                    className: "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--card-foreground))]"
                }}
            />
        </div>
    );
});

// ── Welcome fallback ──────────────────────────────────────────────────────────

function WelcomeScreen() {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(221deg_83%_70%)] shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                            <LayoutDashboard className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-[hsl(var(--background))]">
                            <Zap className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t.common.welcome === "Hoş geldiniz" ? "Adminix'e Hoş Geldiniz" : "Welcome to Adminix"}
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] max-w-md">
                    {t.common.welcome === "Hoş geldiniz" 
                        ? "Başlamak için yan menüden bir kaynak seçin veya kendi şemanızı Adminix bileşenine ekleyin."
                        : "Select a resource from the sidebar to get started, or add resources to your <Adminix> component."
                    }
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {[
                    { 
                        icon: Database, 
                        title: t.common.welcome === "Hoş geldiniz" ? "Otomatik CRUD" : "Auto CRUD", 
                        desc: t.common.welcome === "Hoş geldiniz" ? "API şemanızdan tam oluşturma, okuma, güncelleme ve silme" : "Full create, read, update, delete from your API schema" 
                    },
                    { 
                        icon: Zap, 
                        title: t.common.welcome === "Hoş geldiniz" ? "Sıfır Yapılandırma" : "Zero Config", 
                        desc: t.common.welcome === "Hoş geldiniz" ? "Mantıklı varsayılanlarla kutudan çıktığı gibi çalışır" : "Works out of the box with sensible defaults" 
                    },
                    { 
                        icon: Users, 
                        title: t.common.welcome === "Hoş geldiniz" ? "Genişletilebilir" : "Extensible", 
                        desc: t.common.welcome === "Hoş geldiniz" ? "Eklenti sistemi ile özel widget'lar eklemenizi sağlar" : "Plugin system lets you add custom widgets and actions" 
                    },
                ].map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary)/0.5)] transition-all hover:shadow-md cursor-default group"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary)/0.2)] transition-colors">
                            <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                        </div>
                        <p className="font-semibold text-sm">{title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function Adminix(props: AdminixProps) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AdminixInner {...props} />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
