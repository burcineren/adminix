import React from "react";
import { useAuth } from "@/core/auth/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useI18n } from "@/core/i18n";

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useI18n();

  if (!isAuthenticated || !user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 pr-4 hover:bg-[hsl(var(--muted)/0.5)] transition-all shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] ring-2 ring-[hsl(var(--background))] shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col items-start -space-y-0.5">
            <span className="text-xs font-black uppercase tracking-widest">{user.name || "Admin"}</span>
            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] max-w-[100px] truncate">{user.email}</span>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[240px] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-gray-950 p-2 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          sideOffset={8}
          align="end"
        >
          <div className="flex flex-col space-y-1 px-3 py-3 mb-1 bg-slate-50 dark:bg-gray-900 rounded-xl border border-[hsl(var(--border))]">
            <p className="text-sm font-black leading-none text-slate-900 dark:text-slate-100">{user.name || "Administrator"}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
          <DropdownMenu.Item
            onClick={() => logout()}
            className="flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-colors hover:bg-rose-500/10 focus:bg-rose-500/10 text-rose-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t.common.logout}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
