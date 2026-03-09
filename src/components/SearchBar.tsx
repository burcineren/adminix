import { useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search…", className }: SearchBarProps) {
    const ref = useRef<HTMLInputElement>(null);
    const handleClear = useCallback(() => {
        onChange("");
        ref.current?.focus();
    }, [onChange]);

    return (
        <div className={cn("relative flex items-center", className)}>
            <Search className="absolute left-3 h-4 w-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "flex h-9 w-full min-w-[240px] rounded-md border border-[hsl(var(--input))]",
                    "bg-transparent pl-9 pr-9 py-1 text-sm shadow-sm transition-colors",
                    "placeholder:text-[hsl(var(--muted-foreground))]",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
                )}
            />
            {value && (
                <button
                    onClick={handleClear}
                    className={cn(
                        "absolute right-2 flex h-5 w-5 items-center justify-center rounded-full",
                        "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                        "transition-colors"
                    )}
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
