import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SelectOption } from "@/types/resource-types";
import { useAdminStore } from "@/core/store";

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
    placeholder = "Select data type...",
    label,
    error,
    disabled,
    required,
    className,
}: SelectProps) {
    const { darkMode } = useAdminStore();
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] opacity-70">
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
                        "flex h-9 w-full items-center justify-between rounded-xl border border-[hsl(var(--border))]",
                        "bg-[hsl(var(--background)/0.5)] px-3 py-2 text-[13px] shadow-sm transition-all duration-200 outline-none",
                        "hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--card))] hover:shadow-md",
                        "focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)] focus:border-[hsl(var(--primary))]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-[hsl(var(--destructive))]"
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedOption?.icon && (
                            <selectedOption.icon className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                        )}
                        <SelectPrimitive.Value placeholder={placeholder} />
                    </div>
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        className={cn(
                            "adminix-root z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[hsl(var(--border))]",
                            "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xl backdrop-blur-3xl bg-opacity-95",
                            "animate-in fade-in zoom-in-95 duration-200",
                            darkMode && "dark"
                        )}
                        position="popper"
                        sideOffset={6}
                    >
                        <SelectPrimitive.Viewport className="p-1.5 max-h-[300px] overflow-y-auto">
                            {options.map((opt) => (
                                <SelectPrimitive.Item
                                    key={String(opt.value)}
                                    value={String(opt.value)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-[12px] font-medium outline-none transition-all",
                                        "hover:bg-[hsl(var(--primary)/0.08)] hover:text-[hsl(var(--primary))]",
                                        "focus:bg-[hsl(var(--primary)/0.1)] focus:text-[hsl(var(--primary))]",
                                        "data-[state=checked]:bg-[hsl(var(--primary)/0.05)] data-[state=checked]:text-[hsl(var(--primary))]",
                                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5 flex-1">
                                        {opt.icon && (
                                            <opt.icon className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground)/0.7)]" />
                                        )}
                                        <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                                    </div>
                                    <SelectPrimitive.ItemIndicator className="ml-auto">
                                        <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                                    </SelectPrimitive.ItemIndicator>
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
