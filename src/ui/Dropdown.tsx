import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAdminStore } from "@/core/store";

export interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
    separator?: boolean;
    active?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    align?: "start" | "end" | "center";
}

export function Dropdown({ trigger, items, align = "end" }: DropdownProps) {
    const darkMode = useAdminStore((s) => s.darkMode);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <div className={cn("adminix-root", darkMode && "dark")}>
                    <DropdownMenu.Content
                        align={align}
                        sideOffset={4}
                        className={cn(
                            "z-50 min-w-[180px] overflow-hidden rounded-xl border border-[hsl(var(--border))]",
                            "bg-[hsl(var(--popover))] p-1.5 text-[hsl(var(--popover-foreground))] shadow-xl backdrop-blur-md",
                            "data-[state=open]:animate-scale-in"
                        )}
                    >
                        {items.map((item, i) => (
                            <React.Fragment key={i}>
                                {item.separator && (
                                    <DropdownMenu.Separator className="my-1.5 h-px bg-[hsl(var(--border))]" />
                                )}
                                <DropdownMenu.Item
                                    onClick={(e) => {
                                        e.preventDefault();
                                        item.onClick();
                                    }}
                                    disabled={item.disabled}
                                    className={cn(
                                        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                                        "outline-none transition-all duration-200",
                                        item.variant === "destructive"
                                            ? "text-[hsl(var(--destructive))] focus:bg-[hsl(var(--destructive)/0.1)]"
                                            : "hover:bg-[hsl(var(--accent)/0.5)] focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]",
                                        item.active && "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-medium",
                                        item.disabled && "pointer-events-none opacity-50"
                                    )}
                                >
                                    {item.icon && (
                                        <span className={cn("shrink-0", item.active ? "text-[hsl(var(--primary))]" : "opacity-60")}>
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="flex-1">{item.label}</span>
                                    {item.active && (
                                        <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    )}
                                </DropdownMenu.Item>
                            </React.Fragment>
                        ))}
                    </DropdownMenu.Content>
                </div>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
