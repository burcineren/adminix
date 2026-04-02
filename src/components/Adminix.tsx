import { useEffect, useMemo } from "react";
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
import {
  LayoutDashboard,
  Zap,
  Database,
  Users,
  FileWarning,
  RotateCcw,
} from "lucide-react";
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

// ── Composable Components (Puzzle Pieces) ──────────────────────────────────────

/**
 * Root Provider: Manages QueryClient, Store, and Theme.
 * Must wrap all other Adminix components.
 */
export function AdminixRoot({
  children,
  ...props
}: AdminixProps & { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminixInnerWrapper {...props}>{children}</AdminixInnerWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * Internal wrapper to sync props to store and provide the base layout shell.
 */
function AdminixInnerWrapper({
  children,
  resources,
  name,
  endpoint,
  fields,
  permissions,
  label,
  defaultDarkMode,
  showDashboard,
  onError,
}: AdminixProps & { children: React.ReactNode }) {
  const setResources = useAdminStore((state) => state.setResources);
  const setDarkMode = useAdminStore((state) => state.setDarkMode);
  const setActiveResource = useAdminStore((state) => state.setActiveResource);
  const activeResource = useAdminStore((state) => state.activeResource);
  const darkMode = useAdminStore((state) => state.darkMode);

  const normalizedResources = useMemo(() => {
    const list: ResourceDefinition[] = resources ? [...resources] : [];
    if (endpoint) {
      const resourceName = name ?? endpoint.split("/").pop() ?? "resource";
      if (!list.some((r) => r.name === resourceName)) {
        list.unshift({
          name: resourceName,
          endpoint,
          fields: fields ?? [],
          permissions,
          label:
            label ??
            resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
        });
      }
    }
    return list;
  }, [resources, name, endpoint, fields, permissions, label]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    normalizedResources.forEach((res, idx) => {
      const result = validateResourceDefinition(res);
      if (!result.success) {
        errors.push(
          `Resource "${res.name || idx}": ${result.errors.join(", ")}`,
        );
      }
    });
    return errors;
  }, [normalizedResources]);

  // Validation side-effect
  useEffect(() => {
    if (validationErrors.length > 0 && onError) {
      onError(new Error("Schema Validation Failed"));
    }
  }, [validationErrors, onError]);

  useEffect(() => {
    if (validationErrors.length === 0) {
      setResources(normalizedResources);
    }
    if (defaultDarkMode !== undefined) setDarkMode(defaultDarkMode);
  }, [
    normalizedResources,
    defaultDarkMode,
    setResources,
    setDarkMode,
    validationErrors.length,
  ]);

  useEffect(() => {
    if (
      !activeResource &&
      normalizedResources.length > 0 &&
      validationErrors.length === 0
    ) {
      const shouldShowDashboard =
        showDashboard ?? normalizedResources.length > 1;
      setActiveResource(
        shouldShowDashboard ? "dashboard" : normalizedResources[0].name,
      );
    }
  }, [
    activeResource,
    normalizedResources,
    showDashboard,
    setActiveResource,
    validationErrors.length,
  ]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  if (validationErrors.length > 0) {
    return <ValidationErrorScreen errors={validationErrors} />;
  }

  return (
    <div className={cn("adminix-root", darkMode && "dark", "h-full w-full")}>
      <div className="flex h-full w-full overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <GlobalModalManager />
        {children}
        <Toaster position="bottom-right" richColors />
      </div>
    </div>
  );
}

/**
 * Default sidebar implementation.
 */
export function AdminixSidebar(props: Partial<AdminixProps>) {
  const resources = useAdminStore((s) => s.resources);
  return (
    <Sidebar
      resources={resources}
      title={props.title}
      logo={props.logo}
      plugins={props.plugins}
      showDashboard={props.showDashboard}
    />
  );
}

/**
 * Main content shell.
 */
export function AdminixMain({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 relative">{children}</div>
  );
}

/**
 * Auto-labeling TopBar.
 */
export function AdminixTopBar() {
  const { activeResource, resources } = useAdminStore();
  const { t } = useI18n();
  const current = resources.find((r) => r.name === activeResource);
  return (
    <TopBar
      title={
        activeResource === "dashboard"
          ? t.common.dashboard
          : (current?.label ?? current?.name)
      }
    />
  );
}

/**
 * Main content area that switches between dashboard and resource views.
 */
export function AdminixContent() {
  const { activeResource, resources } = useAdminStore();
  const current = resources.find((r) => r.name === activeResource);

  return (
    <main className="flex-1 overflow-y-auto pt-14">
      {activeResource === "dashboard" ? (
        <Dashboard />
      ) : current ? (
        <ResourceView key={current.name} resource={current} />
      ) : (
        <WelcomeScreen />
      )}
    </main>
  );
}

/**
 * The monolithic Adminix component.
 */
export const Adminix = Object.assign(
  function Adminix(props: AdminixProps) {
    return (
      <AdminixRoot {...props}>
        <AdminixSidebar {...props} />
        <AdminixMain>
          <AdminixTopBar />
          <AdminixContent />
        </AdminixMain>
      </AdminixRoot>
    );
  },
  {
    Root: AdminixRoot,
    Sidebar: AdminixSidebar,
    Main: AdminixMain,
    TopBar: AdminixTopBar,
    Content: AdminixContent,
  },
);

// ── Fallback Screens ───────────────────────────────────────────────────────────

function ValidationErrorScreen({ errors }: { errors: string[] }) {
  const { t } = useI18n();
  return (
    <div className="flex h-screen w-full items-center justify-center p-6 bg-[hsl(var(--background))]">
      <Card className="max-w-2xl w-full p-8 border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.02)] shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]">
            <FileWarning className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight uppercase italic text-[hsl(var(--destructive))]">
              {t.common.settings === "Ayarlar"
                ? "Geçersiz Yapılandırma"
                : "Invalid Configuration"}
            </h2>
            <ul className="text-left w-full mt-4 space-y-2">
              {errors.map((err, i) => (
                <li
                  key={i}
                  className="text-xs font-mono text-[hsl(var(--destructive))] bg-white dark:bg-black/20 p-3 rounded-lg border border-[hsl(var(--border))]"
                >
                  {err}
                </li>
              ))}
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />{" "}
            {t.common.settings === "Ayarlar" ? "Yenile" : "Refresh"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

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
          {t.common.welcome === "Hoş geldiniz"
            ? "Adminix'e Hoş Geldiniz"
            : "Welcome to Adminix"}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] max-w-md">
          {t.common.welcome === "Hoş geldiniz"
            ? "Başlamak için yan menüden bir kaynak seçin veya kendi şemanızı Adminix bileşenine ekleyin."
            : "Select a resource from the sidebar to get started, or add resources to your <Adminix> component."}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          {
            icon: Database,
            title: "Auto CRUD",
            desc: "Full CRUD from your API schema",
          },
          {
            icon: Zap,
            title: "Zero Config",
            desc: "Sensible defaults out of the box",
          },
          {
            icon: Users,
            title: "Extensible",
            desc: "Custom widgets and plugins",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary)/0.5)] transition-all cursor-default group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary)/0.2)]">
              <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
