import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SelectOption } from "@/types/resource-types";

interface SelectProps {
    options: SelectOption[];
    value?: string | number;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = "Select...",
    label,
    error,
    disabled,
    required,
    className,
}: SelectProps) {
    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {label && (
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    {label}
                    {required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
                </label>
            )}
            <SelectPrimitive.Root
                value={value !== undefined ? String(value) : undefined}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectPrimitive.Trigger
                    className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border border-[hsl(var(--input))]",
                        "bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-[hsl(var(--destructive))]"
                    )}
                >
                    <SelectPrimitive.Value placeholder={placeholder} />
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        className={cn(
                            "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-[hsl(var(--border))]",
                            "bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] shadow-lg",
                            "data-[state=open]:animate-scale-in"
                        )}
                        position="popper"
                        sideOffset={4}
                    >
                        <SelectPrimitive.Viewport className="p-1">
                            {options.map((opt) => (
                                <SelectPrimitive.Item
                                    key={String(opt.value)}
                                    value={String(opt.value)}
                                    className={cn(
                                        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm",
                                        "outline-none focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]",
                                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    )}
                                >
                                    <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
                                        <SelectPrimitive.ItemIndicator>
                                            <Check className="h-4 w-4" />
                                        </SelectPrimitive.ItemIndicator>
                                    </span>
                                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
            {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
        </div>
    );
}
