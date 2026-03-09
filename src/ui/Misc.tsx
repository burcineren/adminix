import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/utils/cn";

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    id?: string;
}

export function Switch({ checked, onCheckedChange, label, disabled, id }: SwitchProps) {
    const switchId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    return (
        <div className="flex items-center gap-2">
            <SwitchPrimitive.Root
                id={switchId}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={cn(
                    "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "data-[state=checked]:bg-[hsl(var(--primary))] data-[state=unchecked]:bg-[hsl(var(--input))]"
                )}
            >
                <SwitchPrimitive.Thumb
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
                        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                    )}
                />
            </SwitchPrimitive.Root>
            {label && (
                <label
                    htmlFor={switchId}
                    className="text-sm font-medium leading-none text-[hsl(var(--foreground))] cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                </label>
            )}
        </div>
    );
}

// Badge component
interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "success" | "destructive" | "warning" | "outline";
    className?: string;
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]",
    secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    destructive: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    outline: "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                badgeVariants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

// Card
interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
                "shadow-sm",
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className }: CardProps) {
    return <div className={cn("p-5 pt-0", className)}>{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("skeleton", className)} />;
}

export function Separator({ className }: { className?: string }) {
    return (
        <div
            className={cn("shrink-0 bg-[hsl(var(--border))] h-[1px] w-full", className)}
        />
    );
}
