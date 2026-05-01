import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { useAdminStore } from "@/core/store";
import { useI18n, type Language } from "@/core/i18n";
import type { ResourceDefinition, AdminixPlugin } from "@/types/resource-types";
import {
  LayoutDashboard,
  ChevronRight,
  Menu,
  X,
  Database,
  ExternalLink,
  Search,
  BarChart3,
  Plus,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { ThemeToggle } from "@/ui/ThemeToggle";
import { Input } from "@/ui/Input";
import { UserProfile } from "@/components/auth/UserProfile";
import { usePermissions } from "@/hooks/usePermissions";

interface SidebarProps {
  resources: ResourceDefinition[];
  title?: string;
  logo?: React.ReactNode;
  plugins?: AdminixPlugin[];
  showDashboard?: boolean;
}

export function Sidebar({
  resources,
  title = "Adminix",
  logo,
  plugins,
  showDashboard = true,
  userRole,
}: SidebarProps & { userRole?: string }) {
  const {
    activeResource,
    setActiveResource,
    sidebarOpen,
    toggleSidebar,
    enableReports,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = usePermissions();

  const filteredResources = resources
    .filter((res) => hasPermission(res, "view", userRole))
    .filter((res) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        res.name.toLowerCase().includes(lowerQuery) ||
        (res.label && res.label.toLowerCase().includes(lowerQuery))
      );
    });

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "z-30 flex h-screen flex-col sticky top-0",
          "border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          sidebarOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 border-none",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {logo ?? (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-sm truncate">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-3">
            {showDashboard && (
              <li>
                <button
                  onClick={() => setActiveResource("dashboard")}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    "transition-all duration-150 text-left",
                    activeResource === "dashboard"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                      : "text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                  )}
                >
                  <LayoutDashboard
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      activeResource === "dashboard" && "scale-110",
                    )}
                  />
                  <span className="truncate flex-1">Dashboard</span>
                </button>
              </li>
            )}
            
            {enableReports && (
              <li>
                <button
                  onClick={() => setActiveResource("reports")}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    "transition-all duration-150 text-left",
                    activeResource === "reports"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                      : "text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                  )}
                >
                  <BarChart3
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      activeResource === "reports" && "scale-110",
                    )}
                  />
                  <span className="truncate flex-1">Reports</span>
                </button>
              </li>
            )}
          </ul>

          <div className="px-5 mt-6 mb-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 bg-[hsl(var(--muted)/0.3)] border-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--primary)/0.5)] transition-all text-xs"
              />
            </div>
          </div>

          <div className="px-3 mb-6">
            <Button 
              onClick={() => setActiveResource("product_create")}
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white rounded-xl h-10 font-bold shadow-lg shadow-[hsl(var(--primary)/0.2)] group transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Button>
          </div>

          <div className="px-3 mt-4 mb-1">
            <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] opacity-50 mb-1">
              Resources
            </p>
          </div>
          <ul className="space-y-0.5 px-3">
            {filteredResources.map((res) => {
              const isActive = activeResource === res.name;
              const Icon = res.icon ?? Database;
              return (
                <li key={res.name}>
                  <button
                    onClick={() => setActiveResource(res.name)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      "transition-all duration-150 text-left",
                      isActive
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                        : "text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive && "scale-110",
                      )}
                    />
                    <span className="truncate flex-1">
                      {res.label ?? res.name}
                    </span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Plugin sidebar widgets */}
          {plugins?.some((p) => p.sidebarWidget) && (
            <div className="mt-4 px-3 border-t border-[hsl(var(--border))] pt-4">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">
                Plugins
              </p>
              {plugins.map(
                (p, i) => p.sidebarWidget && <p.sidebarWidget key={i} />,
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--border))] p-3 space-y-1">
          <a
            href="https://github.com/burcineren/adminix"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              "text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
              "transition-colors",
            )}
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </aside>
    </>
  );
}

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggleSidebar } = useAdminStore();
  const { language, setLanguage } = useI18n();

  const languages: { label: string; value: Language }[] = [
    { label: "EN", value: "en" },
    { label: "TR", value: "tr" },
  ];

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-10 flex h-14 items-center gap-3 border-b border-[hsl(var(--border))]",
        "bg-[hsl(var(--background)/0.95)] backdrop-blur-sm px-4",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8"
        title="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>
      {title && (
        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex-1">
          {title}
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />
        <div className="h-4 w-px bg-[hsl(var(--border))] mx-1" />
        <div className="flex bg-[hsl(var(--muted)/0.5)] rounded-lg p-1 border border-[hsl(var(--border))]">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={cn(
                "px-2 py-1 text-[10px] font-black tracking-widest rounded-md transition-all duration-200",
                language === lang.value
                  ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[hsl(var(--border))] mx-1" />
        <UserProfile />
      </div>
    </header>
  );
}
