import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

export function Checkbox({
    checked,
    onCheckedChange,
    indeterminate,
}: {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    indeterminate?: boolean;
}) {
    return (
        <CheckboxPrimitive.Root
            checked={indeterminate ? "indeterminate" : checked}
            onCheckedChange={(v) => onCheckedChange?.(v === true)}
            className={cn(
                "h-4 w-4 shrink-0 rounded-sm border border-[hsl(var(--primary))]",
                "ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:text-[hsl(var(--primary-foreground))]"
            )}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                <Check className="h-3 w-3" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export const CopyableContent = ({ children, rawValue }: { children: React.ReactNode; rawValue: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(rawValue);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group/cell relative flex items-center gap-2 max-w-full">
            <div className="truncate flex-1" title={rawValue}>{children}</div>
            <button
                onClick={handleCopy}
                className={cn(
                    "opacity-0 group-hover/cell:opacity-100 p-1 rounded hover:bg-[hsl(var(--muted))] transition-all",
                    copied && "opacity-100 text-emerald-500"
                )}
            >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />}
            </button>
        </div>
    );
};
