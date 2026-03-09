import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    description?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", error, label, description, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[hsl(var(--foreground))]"
                    >
                        {label}
                        {props.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <span className="absolute left-3 flex items-center text-[hsl(var(--muted-foreground))]">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        type={type}
                        className={cn(
                            "flex h-9 w-full rounded-md border border-[hsl(var(--input))]",
                            "bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                            "placeholder:text-[hsl(var(--muted-foreground))]",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-[hsl(var(--destructive))]",
                            leftIcon && "pl-9",
                            rightIcon && "pr-9",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 flex items-center text-[hsl(var(--muted-foreground))]">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {description && !error && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
                )}
                {error && (
                    <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, label, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-[hsl(var(--foreground))]">
                        {label}
                        {props.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
                    </label>
                )}
                <textarea
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))]",
                        "bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]",
                        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                        error && "border-[hsl(var(--destructive))]",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";
