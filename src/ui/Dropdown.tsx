import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/utils/cn";

interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
    separator?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    align?: "start" | "end" | "center";
}

export function Dropdown({ trigger, items, align = "end" }: DropdownProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align={align}
                    sideOffset={4}
                    className={cn(
                        "z-50 min-w-[160px] overflow-hidden rounded-md border border-[hsl(var(--border))]",
                        "bg-[hsl(var(--popover))] p-1 text-[hsl(var(--popover-foreground))] shadow-lg",
                        "data-[state=open]:animate-scale-in"
                    )}
                >
                    {items.map((item, i) => (
                        <React.Fragment key={i}>
                            {item.separator && (
                                <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))]" />
                            )}
                            <DropdownMenu.Item
                                onClick={item.onClick}
                                disabled={item.disabled}
                                className={cn(
                                    "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                                    "outline-none transition-colors",
                                    item.variant === "destructive"
                                        ? "text-[hsl(var(--destructive))] focus:bg-[hsl(var(--destructive)/0.1)]"
                                        : "focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]",
                                    item.disabled && "pointer-events-none opacity-50"
                                )}
                            >
                                {item.icon && (
                                    <span className="shrink-0 opacity-60">{item.icon}</span>
                                )}
                                {item.label}
                            </DropdownMenu.Item>
                        </React.Fragment>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
