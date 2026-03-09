import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAdminStore } from "@/core/store";
import { Sidebar, TopBar } from "@/components/Sidebar";
import { ResourceView } from "@/components/ResourceView";
import { Dashboard } from "@/components/Dashboard";
import type { AdminPanelProps } from "@/types/resource-types";
import { cn } from "@/utils/cn";
import { LayoutDashboard, Zap, Database, Users } from "lucide-react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// ── Inner panel (accesses store) ───────────────────────────────────────────────
function AdminPanelInner({
    resources,
    title,
    logo,
    plugins,
    defaultDarkMode = false,
    showDashboard = true,
}: AdminPanelProps) {
    const { activeResource, setActiveResource, setResources, darkMode, setDarkMode, sidebarOpen } =
        useAdminStore();

    useEffect(() => {
        setResources(resources);
        setDarkMode(defaultDarkMode);

        // Default to dashboard if enabled, otherwise first resource
        if (!activeResource) {
            if (showDashboard) {
                setActiveResource("dashboard");
            } else if (resources.length > 0) {
                setActiveResource(resources[0]!.name);
            }
        }
    }, [resources, defaultDarkMode, showDashboard]);

    // Sync dark mode class on <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const currentResource = resources.find((r) => r.name === activeResource);
    const isDashboard = activeResource === "dashboard";

    return (
        <div className={cn("min-h-screen bg-[hsl(var(--background))]")}>
            <Sidebar
                resources={resources}
                title={title}
                logo={logo}
                plugins={plugins}
                showDashboard={showDashboard}
            />
            <TopBar title={isDashboard ? "Dashboard" : (currentResource?.label ?? currentResource?.name)} />
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
                toastOptions={{ duration: 4000 }}
            />
        </div>
    );
}

// ── Welcome fallback ──────────────────────────────────────────────────────────

function WelcomeScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(221deg_83%_70%)] shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                            <LayoutDashboard className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                            <Zap className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome to AutoAdmin</h1>
                <p className="text-[hsl(var(--muted-foreground))] max-w-md">
                    Select a resource from the sidebar to get started, or add resources to your{" "}
                    <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-sm font-mono">
                        &lt;AdminPanel&gt;
                    </code>{" "}
                    component.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {[
                    { icon: Database, title: "Auto CRUD", desc: "Full create, read, update, delete from your API schema" },
                    { icon: Zap, title: "Zero Config", desc: "Works out of the box with sensible defaults" },
                    { icon: Users, title: "Extensible", desc: "Plugin system lets you add custom widgets and actions" },
                ].map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary)/0.5)] transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
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

export function AdminPanel(props: AdminPanelProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminPanelInner {...props} />
        </QueryClientProvider>
    );
}
