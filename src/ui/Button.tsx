import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "ghost" | "destructive" | "outline" | "link";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default:
        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] shadow-sm",
    secondary:
        "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary)/0.8)]",
    ghost:
        "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
    destructive:
        "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)] shadow-sm",
    outline:
        "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
    link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-9 px-4 py-2 text-sm rounded-md",
    lg: "h-10 px-6 text-sm rounded-md",
    icon: "h-9 w-9 rounded-md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "default",
            size = "md",
            loading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
                    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50 select-none",
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {loading && (
                    <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
